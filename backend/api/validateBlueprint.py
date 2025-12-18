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
from gemini_service import call_gemini_api

from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_TYPE = "gemini-2.5-flash-lite"
USER_PROMPT = "Given this picture, check if it is a blueprint. If it is a blueprint then return true,"\
 "if it is not a blueprint return false. The result must be in json format {\"result\": True}. No othergi " \
 "information should be provided other than the json" 
client = OpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
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