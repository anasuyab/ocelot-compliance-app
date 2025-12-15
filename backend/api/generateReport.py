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

            # --- PREPARE THE FULL MOCK DATA ---
            # This matches the structure your React App expects exactly
            response_data = {
                "summary": {
                    "compliant": 8,
                    "violations": 3,
                    "warnings": 2,
                    "totalChecks": 13
                },
                "blueprint": {
                    "name": "Tribal Admin Office - Floor Plan.pdf",
                    "uploadDate": datetime.now().strftime("%m/%d/%Y"),
                    "facilityType": "Administrative Office",
                    "totalArea": "2,400 sq ft"
                },
                "results": [
                    {
                        "category": "Space Requirements",
                        "status": "compliant",
                        "items": [
                            {
                                "id": 1,
                                "check": "Office Space Square Footage",
                                "status": "pass",
                                "finding": "Office spaces range from 150-200 sq ft, exceeding minimum requirement of 100 sq ft per occupant",
                                "blueprint": "Room 101, 102, 103 measured at 150, 175, 200 sq ft respectively",
                                "policy": "25 CFR 900.70(a) - Adequate space for program administration",
                                "citation": "Indian Affairs Manual Part 80, Chapter 7, Section 1.7.B.2"
                            },
                            {
                                "id": 2,
                                "check": "Common Area Allocation",
                                "status": "pass",
                                "finding": "Common areas (break room, conference room) total 400 sq ft, meeting guideline of 15-20% of total space",
                                "blueprint": "Break room: 200 sq ft, Conference room: 200 sq ft",
                                "policy": "General facility standards for administrative offices",
                                "citation": "Building Code Section 310.1"
                            }
                        ]
                    },
                    {
                        "category": "Accessibility & Egress",
                        "status": "violation",
                        "items": [
                            {
                                "id": 3,
                                "check": "Exit Door Width",
                                "status": "fail",
                                "finding": "Exit door in Room 104 measures 30 inches wide, below ADA minimum requirement",
                                "blueprint": "Room 104 exit door marked as 30\" on blueprint",
                                "policy": "ADA Standards require minimum 32 inches clear width for doorways",
                                "citation": "ADA Standards Section 404.2.3",
                                "recommendation": "Widen door opening to minimum 32 inches or replace with compliant door frame"
                            },
                            {
                                "id": 4,
                                "check": "Main Corridor Width",
                                "status": "pass",
                                "finding": "Main corridor width of 48 inches exceeds minimum requirement",
                                "blueprint": "Main corridor marked as 48\" throughout",
                                "policy": "Minimum 44 inches for accessible routes",
                                "citation": "ADA Standards Section 403.5.1"
                            },
                            {
                                "id": 5,
                                "check": "Bathroom Accessibility",
                                "status": "fail",
                                "finding": "Bathroom door opens inward, blocking required clear floor space for wheelchair maneuvering",
                                "blueprint": "Bathroom layout shows door swing conflicts with 60\" turning diameter",
                                "policy": "Accessible bathrooms must provide 60-inch diameter turning space",
                                "citation": "ADA Standards Section 603.2.1",
                                "recommendation": "Reverse door swing to open outward or use sliding door"
                            }
                        ]
                    },
                    {
                        "category": "Fire Safety & Equipment",
                        "status": "warning",
                        "items": [
                            {
                                "id": 6,
                                "check": "Fire Extinguisher Placement",
                                "status": "pass",
                                "finding": "Fire extinguishers placed every 75 feet, meeting maximum travel distance requirement",
                                "blueprint": "4 fire extinguishers marked on plan at strategic locations",
                                "policy": "Maximum 75 feet travel distance to extinguisher",
                                "citation": "NFPA 10 Section 6.1"
                            },
                            {
                                "id": 7,
                                "check": "Emergency Exit Signage",
                                "status": "warning",
                                "finding": "Exit signs shown on blueprint but specifications not provided",
                                "blueprint": "Exit signs indicated but illumination details missing",
                                "policy": "Exit signs must be illuminated and meet visibility requirements",
                                "citation": "IBC Section 1013",
                                "recommendation": "Verify exit signs are illuminated and meet photometric requirements"
                            }
                        ]
                    },
                    {
                        "category": "105(l) Lease Compliance",
                        "status": "compliant",
                        "items": [
                            {
                                "id": 8,
                                "check": "Program Space Allocation",
                                "status": "pass",
                                "finding": "Facility layout supports identified PFSAs with appropriate space allocation",
                                "blueprint": "Administrative offices, meeting spaces, and support areas clearly designated",
                                "policy": "Facility must support programs, functions, services, or activities (PFSAs) under funding agreement",
                                "citation": "Indian Affairs Manual Part 80, Chapter 7, Section 1.6.A"
                            },
                            {
                                "id": 9,
                                "check": "Facility Use Documentation",
                                "status": "pass",
                                "finding": "Blueprint clearly identifies administrative program spaces matching funding agreement",
                                "blueprint": "Spaces labeled for tribal governance, social services, and administration",
                                "policy": "105(l) lease must support PFSAs contained in approved funding agreement",
                                "citation": "25 U.S.C. § 5324(l)"
                            }
                        ]
                    }
                ]
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