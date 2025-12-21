from http.server import BaseHTTPRequestHandler
import json
import os
import base64
import email
import sys
from email.policy import default
from dotenv import load_dotenv

# --- 1. SETUP PATHS & IMPORTS ---
# This ensures we can import geminiService regardless of where this runs
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
from geminiService import call_gemini_api

load_dotenv()

# --- 2. CONFIGURATION ---
MODEL_TYPE = "gemini-3-pro-preview" 

# We strictly define the output format in the prompt
USER_PROMPT = (
    "Given this floor plan image, identify all distinct rooms. "
    "For each room, determine the best geometric shape to represent it: "
    "use 'rect' for rectangular rooms, 'circle' for round rooms, and 'polygon' for irregular/angled rooms. "
    "Estimate the textual dimensions (e.g., '100ft x 50ft' or '20ft Dia') based on the scale markers in the image. "
    "Assign a distinct RGBA color string for each unique room function (e.g., all 'Offices' get the same color). "
    "Return ONLY valid JSON matching this exact structure, no markdown or text:\n\n"
    "{\n"
    "  \"rooms\": [\n"
    "    { \n"
    "      \"id\": 1, \n"
    "      \"name\": \"Gymnasium\", \n"
    "      \"type\": \"rect\", \n"
    "      \"dimensions\": \"100ft x 100ft\",\n"
    "      \"color\": \"rgba(100, 149, 237, 0.5)\", \n"
    "      \"coords\": { \"x\": 480, \"y\": 220, \"w\": 450, \"h\": 450 }\n"
    "    },\n"
    "    { \n"
    "      \"id\": 2, \n"
    "      \"name\": \"Vestibule\", \n"
    "      \"type\": \"polygon\", \n"
    "      \"dimensions\": \"Irregular\",\n"
    "      \"color\": \"rgba(255, 99, 71, 0.5)\", \n"
    "      \"points\": [[300, 680], [430, 780], [470, 820], [300, 750]]\n"
    "    },\n"
    "    { \n"
    "      \"id\": 3, \n"
    "      \"name\": \"Lounge\", \n"
    "      \"type\": \"circle\", \n"
    "      \"dimensions\": \"20ft Dia\",\n"
    "      \"color\": \"rgba(147, 112, 219, 0.5)\", \n"
    "      \"coords\": { \"cx\": 360, \"cy\": 400, \"r\": 60 }\n"
    "    }\n"
    "  ]\n"
    "}"
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

            # 2. Encode Image
            base64_image = base64.b64encode(file_content).decode('utf-8')

            # 3. Construct Messages
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

            # 4. Call Gemini Service
            gemini_response = call_gemini_api(
                model=MODEL_TYPE, 
                messages=messages_payload
            )
            
            # 5. Parse and Return
            try:
                data = json.loads(gemini_response)
                self._send_json(data, 200)
            except json.JSONDecodeError:
                print(f"Invalid JSON from Gemini: {gemini_response}")
                self._send_json({"error": "Failed to generate valid JSON", "raw_response": gemini_response}, 500)

        except Exception as e:
            print(f"Server Error: {e}")
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