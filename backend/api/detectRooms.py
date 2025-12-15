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
                "rooms": [
                    {
                    "id": 1,
                    "label": "Vestibule",
                    "type": "entrance",
                    "bounds": {
                        "x": 310,
                        "y": 880,
                        "width": 200,
                        "height": 150
                    },
                    "color": "rgba(59, 130, 246, 0.3)"
                    },
                    {
                    "id": 2,
                    "label": "Lobby",
                    "type": "common",
                    "bounds": {
                        "x": 350,
                        "y": 750,
                        "width": 150,
                        "height": 130
                    },
                    "color": "rgba(34, 197, 94, 0.3)"
                    },
                    {
                    "id": 3,
                    "label": "Dance",
                    "type": "activity",
                    "bounds": {
                        "x": 60,
                        "y": 650,
                        "width": 240,
                        "height": 250
                    },
                    "color": "rgba(168, 85, 247, 0.3)"
                    },
                    {
                    "id": 4,
                    "label": "Multipurpose",
                    "type": "activity",
                    "bounds": {
                        "x": 60,
                        "y": 380,
                        "width": 240,
                        "height": 270
                    },
                    "color": "rgba(168, 85, 247, 0.3)"
                    },
                    {
                    "id": 5,
                    "label": "Art",
                    "type": "activity",
                    "bounds": {
                        "x": 60,
                        "y": 280,
                        "width": 160,
                        "height": 100
                    },
                    "color": "rgba(168, 85, 247, 0.3)"
                    },
                    {
                    "id": 6,
                    "label": "Lounge",
                    "type": "common",
                    "bounds": {
                        "x": 290,
                        "y": 360,
                        "width": 160,
                        "height": 160
                    },
                    "color": "rgba(34, 197, 94, 0.3)"
                    },
                    {
                    "id": 7,
                    "label": "Exercise",
                    "type": "activity",
                    "bounds": {
                        "x": 350,
                        "y": 150,
                        "width": 140,
                        "height": 210
                    },
                    "color": "rgba(168, 85, 247, 0.3)"
                    },
                    {
                    "id": 8,
                    "label": "Office",
                    "type": "administrative",
                    "bounds": {
                        "x": 350,
                        "y": 530,
                        "width": 120,
                        "height": 100
                    },
                    "color": "rgba(251, 146, 60, 0.3)"
                    },
                    {
                    "id": 9,
                    "label": "Reception",
                    "type": "administrative",
                    "bounds": {
                        "x": 430,
                        "y": 650,
                        "width": 100,
                        "height": 80
                    },
                    "color": "rgba(251, 146, 60, 0.3)"
                    },
                    {
                    "id": 10,
                    "label": "Gymnasium",
                    "type": "activity",
                    "bounds": {
                        "x": 520,
                        "y": 220,
                        "width": 380,
                        "height": 550
                    },
                    "color": "rgba(168, 85, 247, 0.3)"
                    }
                ]} 

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