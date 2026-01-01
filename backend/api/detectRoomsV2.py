from http.server import BaseHTTPRequestHandler
import json
import os
import base64
import email
import sys
from email.policy import default
from dotenv import load_dotenv
from PIL import Image
import io

# --- 1. SETUP PATHS & IMPORTS ---
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
from geminiService import call_gemini_api

load_dotenv()

# --- 2. CONFIGURATION ---
MODEL_TYPE = "gemini-3-pro-preview" 

# Updated prompt - JSON with coordinates AND wall data
USER_PROMPT = (
    "Role: You are an architectural image analysis AI.\n"
    "Task: Analyze the provided floor plan image and extract data about the distinct rooms.\n\n"
    "Steps:\n"
    "1. Identify all distinct rooms in the floor plan.\n"
    "2. For each room, determine if it's rectangular, circular, or irregular.\n"
    "3. Extract vertex coordinates (x,y pixel positions) for each room corner.\n"
    "4. Calculate wall dimensions between consecutive vertices. Use the scale present in the picture.\n"
    "5. Calculate the total area (square footage) for each room. Use the scale present in the picture.\n"
    "6. Normalize room types (e.g., 'Gymnasium' -> 'gym', 'Restroom' -> 'bathroom'). There should be a list of room types in the picture\n"
    "7. There may be some rooms in the picture not listed in the room types. Add an Unknown room type to them. If more than one Unknown then label Unknown1, Unknown2, etc."
    "8. Some room types may have more than one room. All of the rooms of a room type should be identified \n"
    " and annotated with a number to distinguish between rooms (e.g. Lounge1, Lounge2, etc) \n\n"
    "IMPORTANT: (0,0) is the TOP-LEFT corner of the image.\n"
    "X increases going RIGHT, Y increases going DOWN.\n\n"
    "JSON Schema: Adhere strictly to this JSON structure:\n"
    "{\n"
    "  \"rooms\": [\n"
    "    {\n"
    "      \"id\": 1,\n"
    "      \"name\": \"Gymnasium\",\n"
    "      \"type\": \"gym\",\n"
    "      \"calculated_area\": 10000,\n"
    "      \"shape_type\": \"rect\",\n"
    "      \"coords\": {\n"
    "        \"x\": 520,\n"
    "        \"y\": 250,\n"
    "        \"w\": 450,\n"
    "        \"h\": 560\n"
    "      },\n"
    "      \"walls\": [\n"
    "        {\n"
    "          \"sequence_order\": 1,\n"
    "          \"length\": 92,\n"
    "          \"unit\": \"ft\"\n"
    "        },\n"
    "        {\n"
    "          \"sequence_order\": 2,\n"
    "          \"length\": 112,\n"
    "          \"unit\": \"ft\"\n"
    "        },\n"
    "        {\n"
    "          \"sequence_order\": 3,\n"
    "          \"length\": 92,\n"
    "          \"unit\": \"ft\"\n"
    "        },\n"
    "        {\n"
    "          \"sequence_order\": 4,\n"
    "          \"length\": 112,\n"
    "          \"unit\": \"ft\"\n"
    "        }\n"
    "      ]\n"
    "    },\n"
    "    {\n"
    "      \"id\": 2,\n"
    "      \"name\": \"Lounge\",\n"
    "      \"type\": \"lounge\",\n"
    "      \"calculated_area\": 314,\n"
    "      \"shape_type\": \"circle\",\n"
    "      \"coords\": {\n"
    "        \"cx\": 400,\n"
    "        \"cy\": 450,\n"
    "        \"r\": 60\n"
    "      },\n"
    "      \"walls\": [\n"
    "        {\n"
    "          \"sequence_order\": 1,\n"
    "          \"length\": 62.8,\n"
    "          \"unit\": \"ft\",\n"
    "          \"note\": \"circumference\"\n"
    "        }\n"
    "      ]\n"
    "    },\n"
    "    {\n"
    "      \"id\": 3,\n"
    "      \"name\": \"Vestibule\",\n"
    "      \"type\": \"vestibule\",\n"
    "      \"calculated_area\": 500,\n"
    "      \"shape_type\": \"polygon\",\n"
    "      \"points\": [\n"
    "        [360, 820],\n"
    "        [460, 910],\n"
    "        [500, 870],\n"
    "        [400, 780]\n"
    "      ],\n"
    "      \"walls\": [\n"
    "        {\n"
    "          \"sequence_order\": 1,\n"
    "          \"length\": 25,\n"
    "          \"unit\": \"ft\"\n"
    "        },\n"
    "        {\n"
    "          \"sequence_order\": 2,\n"
    "          \"length\": 20,\n"
    "          \"unit\": \"ft\"\n"
    "        },\n"
    "        {\n"
    "          \"sequence_order\": 3,\n"
    "          \"length\": 25,\n"
    "          \"unit\": \"ft\"\n"
    "        },\n"
    "        {\n"
    "          \"sequence_order\": 4,\n"
    "          \"length\": 20,\n"
    "          \"unit\": \"ft\"\n"
    "        }\n"
    "      ]\n"
    "    }\n"
    "  ]\n"
    "}\n\n"
    "Shape Types:\n"
    "- 'rect': Use 'coords' with x, y, w, h\n"
    "- 'circle': Use 'coords' with cx, cy, r\n"
    "- 'polygon': Use 'points' array of [x, y] coordinates.\n\n"
    "Return ONLY valid JSON, no markdown formatting, no code blocks, no explanatory text."
)

class handler(BaseHTTPRequestHandler):

    # --- CORS SUPPORT ---
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    # --- POST REQUEST ---
    def do_POST(self):
        try:
            # 1. Parse Input
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error(400, "No data received")
                return

            body = self.rfile.read(content_length)
            content_type = self.headers.get('Content-Type', '')
            
            # Helper to create valid email message for parsing
            headers = b'Content-Type: ' + content_type.encode('utf-8') + b'\r\n'
            msg = email.message_from_bytes(headers + b'\r\n' + body, policy=default)

            file_content = None
            mime_type = "image/jpeg"

            for part in msg.walk():
                if part.get_filename():
                    file_content = part.get_payload(decode=True)
                    mime_type = part.get_content_type() or "image/jpeg"
                    break

            if not file_content:
                self._send_json({"error": "No file found in request"}, 400)
                return

            # 2. Get Image Dimensions
            try:
                image = Image.open(io.BytesIO(file_content))
                image_width, image_height = image.size
                print(f"Image dimensions: {image_width} x {image_height}")
            except Exception as e:
                print(f"Error reading image dimensions: {e}")
                image_width, image_height = None, None

            # 3. Encode Image
            base64_image = base64.b64encode(file_content).decode('utf-8')

            # 4. Construct Messages
            messages_payload = [
                {
                    "role": "user",
                    "content": [
                        { "type": "text", "text": USER_PROMPT },
                        { 
                            "type": "image_url", 
                            "image_url": { "url": f"data:{mime_type};base64,{base64_image}" } 
                        }
                    ]
                }
            ]

            # 5. Call Gemini Service
            gemini_response = call_gemini_api(
                model=MODEL_TYPE, 
                messages=messages_payload
            )
            
            # 6. Parse Response
            try:
                data = json.loads(gemini_response)
                
                # Add image metadata to the response
                if image_width and image_height:
                    data['imageMetadata'] = {
                        'width': image_width,
                        'height': image_height
                    }
                
                self._send_json(data, 200)
                
            except json.JSONDecodeError as e:
                print(f"Invalid JSON from Gemini: {gemini_response[:500]}")
                self._send_json({
                    "error": "Failed to parse response", 
                    "details": str(e),
                    "raw_response": gemini_response[:1000]
                }, 500)

        except Exception as e:
            print(f"Server Error: {e}")
            import traceback
            traceback.print_exc()
            self._send_json({"error": str(e)}, 500)

    # --- HELPERS ---
    def _send_json(self, data, status_code):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_GET(self):
        self._send_json({"status": "Room Detection API is online"}, 200)