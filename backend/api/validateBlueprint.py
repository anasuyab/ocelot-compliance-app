from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime

class handler(BaseHTTPRequestHandler):

    # 1. Handle CORS Preflight (Required for POST requests from browser)
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    # 2. Handle the POST request
    def do_POST(self):
        try:
            # --- RECEIVE THE FILE ---
            # Get the size of data to read
            content_length = int(self.headers.get('Content-Length', 0))
            
            # Read the data to clear the buffer (even though we are just returning mock data)
            # This prevents connection reset errors
            if content_length > 0:
                self.rfile.read(content_length)

            response_data = {
                    "result": True
                }

            # --- SEND RESPONSE ---
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(response_data).encode('utf-8'))

        except Exception as e:
            # Basic error handling
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    # Keep GET active for simple health checks
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "API is online. Use POST to upload files."}).encode('utf-8'))