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
# Using 2.0/2.5 Pro or Flash is recommended for coordinate detection tasks
MODEL_TYPE = "gemini-2.0-flash" 

# We strictly define the output format in the prompt
USER_PROMPT = (
    "Given this picture, identify the rooms and their approximate 2D bounding box coordinates. "
    "There can be multiple rooms of the same type. "
    "Assign a distinct RGBA color string for each unique room 'type'. "
    "For example, all 'entrance' types should have the exact same color, but different IDs and bounds. "
    "Return ONLY valid JSON matching this exact structure, no markdown or text:\n\n"
    "{\n"
    "  \"rooms\": [\n"
    "    { \"id\": 1, \"label\": \"Vestibule\", \"type\": \"entrance\", \"bounds\": { \"x\": 0, \"y\": 0, \"width\": 100, \"height\": 100 }, \"color\": \"rgba(59, 130, 246, 0.3)\" }\n"
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