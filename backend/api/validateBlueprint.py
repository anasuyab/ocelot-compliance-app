from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import base64
import email
import sys
from email.policy import default
from openai import OpenAI

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
from geminiService import call_gemini_api

from dotenv import load_dotenv
load_dotenv()

MODEL_TYPE = "gemini-2.5-flash-lite"
USER_PROMPT = (
    "Analyze the provided image and determine if it is a valid architectural blueprint.\n\n"
    "To be considered a valid blueprint (result: true), the image must satisfy ALL of the following criteria:\n"
    "1. Is a Blueprint: The image visually depicts a floor plan or architectural drawing.\n"
    "2. Has Scale: A visual scale bar or text indicating the scale (e.g., '1/4\" = 1\\'0\"' or a graphical ruler) is clearly present.\n"
    "3. Has Rooms: Distinct room labels or identifiable room types (e.g., 'Kitchen', 'Bedroom', 'Lobby') are textually present.\n\n"
    "Output Instructions:\n"
    "- If ANY of the above criteria are missing, the 'result' must be false.\n"
    "- If the result is true, provide the list of detected room types in the 'rooms' field.\n"
    "- If the result is false, the 'rooms' field should be an empty list [].\n"
    "- Strictly output ONLY valid JSON. Do not include markdown formatting (like ```json), explanations, or any other text.\n\n"
    "Required JSON Structure:\n"
    "{\"result\": boolean}"
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
            # 1. Read the length of the uploaded data
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error(400, "No data received")
                return

            # 2. Read the raw body
            body = self.rfile.read(content_length)

            # 3. Parse the Multipart Form Data using the 'email' library
            # We reconstruct a valid message header so the email library can parse the body
            content_type = self.headers.get('Content-Type')
            headers = b'Content-Type: ' + content_type.encode('utf-8') + b'\r\n'
            msg_data = headers + b'\r\n' + body
            
            # Parse the bytes into a message object
            msg = email.message_from_bytes(msg_data, policy=default)

            file_content = None
            mime_type = "image/jpeg" # Default

            # Walk through the message parts to find the file
            for part in msg.walk():
                if part.get_filename(): # This part is a file
                    file_content = part.get_payload(decode=True)
                    mime_type = part.get_content_type() or "image/jpeg"
                    break

            if not file_content:
                self._send_json({"error": "No file found in request"}, 400)
                return

            # 4. Prepare data for Gemini
            base64_image = base64.b64encode(file_content).decode('utf-8')

            messages_payload = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": USER_PROMPT
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ]

            # 4. Call the Service
            # We pass the Model Name and the Messages as requested
            gemini_response = call_gemini_api(
                model=MODEL_TYPE, 
                messages=messages_payload
            )
            
            # Ensure it is valid JSON before sending
            try:
                data = json.loads(gemini_response)
                self._send_json(data, 200)
            except json.JSONDecodeError:
                # Fallback if model returns text instead of JSON
                self._send_json({"result": "true" in gemini_response.lower()}, 200)

        except Exception as e:
            print(f"Server Error: {e}")
            self._send_json({"error": str(e)}, 500)

    # --- HELPER TO SEND JSON ---
    def _send_json(self, data, status_code):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    # --- HEALTH CHECK ---
    def do_GET(self):
        self._send_json({"status": "API is online"}, 200)