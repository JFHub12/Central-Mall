import http.server
import socketserver
import json
import urllib.parse
import urllib.request
import os
import time
import math
from typing import Dict, Any, List

PORT = 8000
DATA_DIR = os.path.join(os.path.dirname(__file__), 'backend_data')
PRODUCTS_FILE = os.path.join(DATA_DIR, 'products.json')
ORDERS_FILE = os.path.join(DATA_DIR, 'orders.json')


def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)


def load_json_file(file_path: str, default: Any) -> Any:
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"⚠️ Failed to read {file_path}: {e}")
    return default


def save_json_file(file_path: str, data: Any):
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"⚠️ Failed to write {file_path}: {e}")


# Central University Miotso Campus Buildings Data
CENTRAL_BUILDINGS = [
    {
        "id": "senate-building",
        "name": "Senate Building & Admin Block",
        "code": "SEN-01",
        "category": "Administrative",
        "description": "Central University Administration offices, Vice-Chancellor's office, Finance, and Admissions.",
        "facilities": ["Admissions Desk", "Finance Dept", "VC Office", "ATM"],
        "x": 50,
        "y": 30,
        "image": "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800",
        "openingHours": "8:00 AM - 5:00 PM (Mon - Fri)"
    },
    {
        "id": "trinity-hall",
        "name": "Trinity Hall (Male Hostel)",
        "code": "TRN-H1",
        "category": "Hostels",
        "description": "Main male undergraduate hostel featuring 24/7 security, laundry room, and study lounge.",
        "facilities": ["Lounge", "Laundry Room", "Wi-Fi Hub", "Supermarket"],
        "x": 75,
        "y": 70,
        "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800",
        "openingHours": "24/7 Resident Access"
    },
    {
        "id": "destiny-hall",
        "name": "Destiny Hall (Female Hostel)",
        "code": "DST-H2",
        "category": "Hostels",
        "description": "Female residence hall equipped with modern kitchenettes and quiet study floors.",
        "facilities": ["Saloon", "Study Room", "Kitchenette", "Security Desk"],
        "x": 25,
        "y": 75,
        "image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
        "openingHours": "24/7 Resident Access"
    },
    {
        "id": "clinic-1",
        "name": "Central University School Clinic",
        "code": "CLN-01",
        "category": "Medical",
        "description": "On-campus medical center providing 24/7 emergency care, triage, and pharmacy services.",
        "facilities": ["Ambulance Station", "Pharmacy", "Consultation Rooms", "Lab"],
        "x": 20,
        "y": 35,
        "image": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
        "openingHours": "24 Hours Daily"
    },
    {
        "id": "central-library",
        "name": "Central University Main Library",
        "code": "LIB-01",
        "category": "Academic",
        "description": "Ultra-modern multi-story library containing e-learning labs, quiet zones, and research archives.",
        "facilities": ["Computer Lab", "Discussion Booths", "Printing Center", "Cafeteria"],
        "x": 50,
        "y": 55,
        "image": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800",
        "openingHours": "7:30 AM - 10:00 PM"
    },
    {
        "id": "law-faculty",
        "name": "Faculty of Law & Moot Court",
        "code": "LAW-01",
        "category": "Academic",
        "description": "Home to the Law Faculty, state-of-the-art Moot Courtroom, and legal research wing.",
        "facilities": ["Moot Court", "Law Library", "Lecture Theaters"],
        "x": 35,
        "y": 45,
        "image": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800",
        "openingHours": "8:00 AM - 8:00 PM"
    },
    {
        "id": "sports-complex",
        "name": "Miotso Campus Sports Complex",
        "code": "SPT-01",
        "category": "Sports",
        "description": "Multi-purpose sports arena featuring basketball courts, football pitch, and fitness gym.",
        "facilities": ["Football Pitch", "Basketball Court", "Gym", "Changing Rooms"],
        "x": 80,
        "y": 30,
        "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
        "openingHours": "6:00 AM - 9:00 PM"
    }
]

# Initial Marketplace Products
PRODUCTS_STORE = [
    {
        "id": "prod-1",
        "title": "Introduction to Law & Legal Systems (Ghana)",
        "price": 120,
        "category": "Textbooks",
        "description": "Gently used 3rd Edition textbook required for Level 100 Law students. Clean pages.",
        "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
        "sellerName": "Kwame Mensah",
        "sellerRole": "Law Student (Level 300)",
        "sellerContact": "+233241234567",
        "locationOnCampus": "Trinity Hall, Room B12",
        "condition": "Like New",
        "dateAdded": "Today"
    },
    {
        "id": "prod-2",
        "title": "HP Pavilion Laptop (16GB RAM, 512GB SSD)",
        "price": 3200,
        "category": "Electronics",
        "description": "Superfast Core i5 11th Gen, ideal for Computer Science and Business Administration courses.",
        "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800",
        "sellerName": "Abena Osei",
        "sellerRole": "CS Student",
        "sellerContact": "+233509876543",
        "locationOnCampus": "Destiny Hall, Room C04",
        "condition": "Used - Excellent",
        "dateAdded": "Yesterday"
    },
    {
        "id": "prod-3",
        "title": "Central University Custom Hoodie (Red/Gold)",
        "price": 180,
        "category": "Fashion",
        "description": "Authentic quality heavy-cotton Central University crest hoodie. Unisex size L.",
        "image": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
        "sellerName": "Central SRC Store",
        "sellerRole": "Official Vendor",
        "sellerContact": "+233270001122",
        "locationOnCampus": "Senate Building Ground Floor",
        "condition": "New",
        "dateAdded": "2 days ago"
    },
    {
        "id": "prod-4",
        "title": "Hot Ghanaian Jollof & Fried Chicken Combo",
        "price": 35,
        "category": "Food & Snacks",
        "description": "Freshly cooked spicy Jollof rice served with grilled chicken, salad, and fried plantain.",
        "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
        "sellerName": "Miotso Campus Buka",
        "sellerRole": "Campus Vendor",
        "sellerContact": "+233245558899",
        "locationOnCampus": "Near Library Cafeteria",
        "condition": "New",
        "dateAdded": "Just Now"
    }
]

ORDERS_STORE = []

# Load persisted store data if available
ensure_data_dir()
PRODUCTS_STORE = load_json_file(PRODUCTS_FILE, None)
if PRODUCTS_STORE is None or not isinstance(PRODUCTS_STORE, list):
    PRODUCTS_STORE = [
        {
            "id": "prod-1",
            "title": "Introduction to Law & Legal Systems (Ghana)",
            "price": 120,
            "category": "Textbooks",
            "description": "Gently used 3rd Edition textbook required for Level 100 Law students. Clean pages.",
            "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
            "sellerName": "Kwame Mensah",
            "sellerRole": "Law Student (Level 300)",
            "sellerContact": "+233241234567",
            "locationOnCampus": "Trinity Hall, Room B12",
            "condition": "Like New",
            "dateAdded": "Today"
        },
        {
            "id": "prod-2",
            "title": "HP Pavilion Laptop (16GB RAM, 512GB SSD)",
            "price": 3200,
            "category": "Electronics",
            "description": "Superfast Core i5 11th Gen, ideal for Computer Science and Business Administration courses.",
            "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800",
            "sellerName": "Abena Osei",
            "sellerRole": "CS Student",
            "sellerContact": "+233509876543",
            "locationOnCampus": "Destiny Hall, Room C04",
            "condition": "Used - Excellent",
            "dateAdded": "Yesterday"
        },
        {
            "id": "prod-3",
            "title": "Central University Custom Hoodie (Red/Gold)",
            "price": 180,
            "category": "Fashion",
            "description": "Authentic quality heavy-cotton Central University crest hoodie. Unisex size L.",
            "image": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
            "sellerName": "Central SRC Store",
            "sellerRole": "Official Vendor",
            "sellerContact": "+233270001122",
            "locationOnCampus": "Senate Building Ground Floor",
            "condition": "New",
            "dateAdded": "2 days ago"
        },
        {
            "id": "prod-4",
            "title": "Hot Ghanaian Jollof & Fried Chicken Combo",
            "price": 35,
            "category": "Food & Snacks",
            "description": "Freshly cooked spicy Jollof rice served with grilled chicken, salad, and fried plantain.",
            "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
            "sellerName": "Miotso Campus Buka",
            "sellerRole": "Campus Vendor",
            "sellerContact": "+233245558899",
            "locationOnCampus": "Near Library Cafeteria",
            "condition": "New",
            "dateAdded": "Just Now"
        }
    ]

ORDERS_STORE = load_json_file(ORDERS_FILE, [])
if not isinstance(ORDERS_STORE, list):
    ORDERS_STORE = []

# In-memory Live GPS Users / Vehicles
LIVE_GPS_USERS: Dict[str, Dict[str, Any]] = {
    "shuttle-1": {
        "id": "shuttle-1",
        "name": "Miotso Campus Shuttle #1",
        "role": "Campus Shuttle",
        "x": 45.0,
        "y": 50.0,
        "lat": 5.7592,
        "lng": 0.0528,
        "speedKmH": 18,
        "headingDeg": 120,
        "lastUpdated": time.strftime("%I:%M:%S %p")
    },
    "ambulance-1": {
        "id": "ambulance-1",
        "name": "School Clinic Emergency Ambulance",
        "role": "Emergency Medical",
        "x": 20.0,
        "y": 35.0,
        "lat": 5.7585,
        "lng": 0.0515,
        "speedKmH": 0,
        "headingDeg": 0,
        "lastUpdated": time.strftime("%I:%M:%S %p")
    },
    "security-1": {
        "id": "security-1",
        "name": "Miotso Campus Security Patrol",
        "role": "Campus Security",
        "x": 78.0,
        "y": 55.0,
        "lat": 5.7601,
        "lng": 0.0539,
        "speedKmH": 12,
        "headingDeg": 270,
        "lastUpdated": time.strftime("%I:%M:%S %p")
    }
}


class PythonBackendHandler(http.server.BaseHTTPRequestHandler):

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_json(self, data: Any, status: int = 200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        query_params = urllib.parse.parse_qs(parsed_path.query)

        # 1. Health Endpoint
        if path == "/api/health":
            self._send_json({
                "status": "ok",
                "backend": "Python 3.10 Backend Engine",
                "app": "Central University Miotso Campus"
            })
            return

        # 2. Live GPS Locations
        if path == "/api/gps/locations":
            # Simulate slight motion for shuttle
            now_sec = time.time()
            shuttle = LIVE_GPS_USERS.get("shuttle-1")
            if shuttle:
                shuttle["x"] = round(
                    25.0 + (math.sin(now_sec / 5.0) + 1.0) * 25.0, 1)
                shuttle["y"] = round(
                    30.0 + (math.cos(now_sec / 5.0) + 1.0) * 20.0, 1)
                shuttle["speedKmH"] = round(15 + (now_sec % 10))
                shuttle["lastUpdated"] = time.strftime("%I:%M:%S %p")

            self._send_json({
                "locations": list(LIVE_GPS_USERS.values())
            })
            return

        # 3. Universal Search Endpoint (Buildings + Products)
        if path == "/api/gps/search":
            q = query_params.get("q", [""])[0].strip().lower()

            if not q:
                self._send_json({
                    "query": "",
                    "totalCount": len(CENTRAL_BUILDINGS) + len(PRODUCTS_STORE),
                    "buildings": CENTRAL_BUILDINGS,
                    "products": PRODUCTS_STORE
                })
                return

            matched_buildings = [
                b for b in CENTRAL_BUILDINGS
                if q in b["name"].lower()
                or q in b["code"].lower()
                or q in b["category"].lower()
                or q in b["description"].lower()
                or any(q in f.lower() for f in b["facilities"])
            ]

            matched_products = [
                p for p in PRODUCTS_STORE
                if q in p["title"].lower()
                or q in p["category"].lower()
                or q in p["description"].lower()
                or q in p["sellerName"].lower()
                or q in p["locationOnCampus"].lower()
            ]

            self._send_json({
                "query": q,
                "totalCount": len(matched_buildings) + len(matched_products),
                "buildings": matched_buildings,
                "products": matched_products
            })
            return

        # 4. Products List
        if path == "/api/products":
            self._send_json({"products": PRODUCTS_STORE})
            return

        # 5. Orders List
        if path == "/api/orders":
            self._send_json({"orders": ORDERS_STORE})
            return

        # Unknown endpoint
        self._send_json({"error": "Endpoint not found"}, 404)

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path

        content_length = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(
            content_length) if content_length > 0 else b"{}"

        try:
            body = json.loads(post_body.decode("utf-8"))
        except Exception:
            body = {}

        # 1. Update User Live Location
        if path == "/api/gps/update-location":
            user_id = body.get("id", "user-self")
            x = float(body.get("x", 50))
            y = float(body.get("y", 50))
            name = body.get("name", "Your Live Position")
            role = body.get("role", "Student (Live GPS)")

            updated_user = {
                "id": user_id,
                "name": name,
                "role": role,
                "x": round(max(5.0, min(95.0, x)), 1),
                "y": round(max(5.0, min(95.0, y)), 1),
                "lat": round(5.7592 + (y - 50.0) * 0.0001, 6),
                "lng": round(0.0528 + (x - 50.0) * 0.0001, 6),
                "speedKmH": body.get("speedKmH", 4.5),
                "headingDeg": body.get("headingDeg", 45),
                "lastUpdated": time.strftime("%I:%M:%S %p"),
                "isSelf": True
            }

            LIVE_GPS_USERS[user_id] = updated_user
            self._send_json({
                "message": "Live GPS location registered in Python engine",
                "location": updated_user
            })
            return

        # 2. Post New Marketplace Item
        if path == "/api/products":
            title = body.get("title", "").strip()
            price = body.get("price", 0)
            if not title:
                self._send_json({"error": "Product title is required"}, 400)
                return

            new_prod = {
                "id": f"prod-{int(time.time())}",
                "title": title,
                "price": float(price),
                "category": body.get("category", "Other"),
                "description": body.get("description", ""),
                "image": body.get("image") or "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800",
                "sellerName": body.get("sellerName", "Student Seller"),
                "sellerRole": body.get("sellerRole", "Central Student"),
                "sellerContact": body.get("sellerContact", body.get("sellerPhone", "+233240000000")),
                "locationOnCampus": body.get("locationOnCampus", "Miotso Campus"),
                "condition": body.get("condition", "Good"),
                "dateAdded": time.strftime("%Y-%m-%d %I:%M %p")
            }

            PRODUCTS_STORE.insert(0, new_prod)
            save_json_file(PRODUCTS_FILE, PRODUCTS_STORE)
            self._send_json(
                {"message": "Product published successfully!", "product": new_prod}, 201)
            return

        # 3. Create New Order (MoMo / Telecel)
        if path == "/api/orders":
            items = body.get("items", [])
            momo = body.get("momoNumber", "")

            new_order = {
                "id": f"ORD-{int(time.time())}",
                "items": items,
                "totalAmount": float(body.get("totalAmount", body.get("total", 0))),
                "paymentMethod": body.get("paymentMethod", "MTN MoMo"),
                "momoNumber": momo,
                "deliveryLocation": body.get("deliveryLocation", "Trinity Hall"),
                "date": time.strftime("%Y-%m-%d %I:%M %p"),
                "createdAt": time.strftime("%Y-%m-%d %I:%M %p"),
                "status": "Confirmed & Processing",
                "paymentStatus": "Paid"
            }

            ORDERS_STORE.insert(0, new_order)
            save_json_file(ORDERS_FILE, ORDERS_STORE)
            self._send_json(
                {"message": "Order placed successfully!", "order": new_order}, 201)
            return

        # 4. Clinic Triage AI Chat Response
        if path == "/api/clinic/chat":
            msg = body.get("message", "").lower()

            reply = "Welcome to Central University School Clinic Desk. How can our nurses assist you?"
            actions = ["Book Consultation",
                       "Pharmacy Stock", "Emergency Dispatch"]

            if "fever" in msg or "headache" in msg or "pain" in msg:
                reply = "For fever or headache, please visit the Miotso Clinic near Trinity Hall for a quick temperature check and doctor consultation. Ensure you stay hydrated."
                actions = ["Book Consultation", "Emergency Hotline"]
            elif "stomach" in msg or "cramp" in msg or "diarrhea" in msg:
                reply = "Stomach distress can be examined at our outpatient wing. Our pharmacy has oral rehydration salts and digestive medication available."
                actions = ["Book Consultation", "Speak to Nurse"]
            elif "emergency" in msg or "blood" in msg or "faint" in msg or "breathing" in msg:
                reply = "CRITICAL: If you or a student has collapsed or is experiencing severe difficulty breathing, our ambulance is standing by. Call +233 30 393 0000 immediately!"
                actions = ["Call Emergency (+233 30 393 0000)"]

            self._send_json({"reply": reply, "suggestedActions": actions})
            return

        # 5. General Campus AI Assistant Endpoint
        if path in ["/api/chat", "/api/ai/chat"]:
            user_msg = body.get("message", "").strip()

            api_key = os.environ.get("GEMINI_API_KEY")
            if api_key:
                try:
                    # Direct Gemini REST call using Python urllib
                    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
                    system_prompt = (
                        "You are Central AI, the official AI Assistant for Central University Ghana (Miotso Main Campus). "
                        "Help students, staff, and visitors with campus directions, Senate Building, Trinity Hall, Destiny Hall, "
                        "School Clinic, Law Faculty, and Central Mall marketplace listings. Keep responses concise, friendly, and helpful."
                    )
                    payload = {
                        "contents": [
                            {
                                "role": "user",
                                "parts": [{"text": f"{system_prompt}\n\nUser Question: {user_msg}"}]
                            }
                        ]
                    }
                    req = urllib.request.Request(
                        gemini_url,
                        data=json.dumps(payload).encode("utf-8"),
                        headers={"Content-Type": "application/json"}
                    )
                    with urllib.request.urlopen(req, timeout=10) as response:
                        res_data = json.loads(response.read().decode("utf-8"))
                        text_resp = res_data["candidates"][0]["content"]["parts"][0]["text"]
                        self._send_json({"reply": text_resp})
                        return
                except Exception as e:
                    print("Gemini Python call error:", e)

            # Contextual Fallback AI Response if Gemini API Key not set or fails
            lowered = user_msg.lower()
            if "senate" in lowered:
                reply = "The Senate Building & Admin Block is located at the center of Miotso campus. It houses the Vice-Chancellor's office, Finance, and Admissions."
            elif "trinity" in lowered or "hostel" in lowered:
                reply = "Trinity Hall (Male Hostel) and Destiny Hall (Female Hostel) offer 24/7 security, laundry, and study lounges on campus."
            elif "clinic" in lowered or "doctor" in lowered:
                reply = "The Central School Clinic is near Trinity Hall, open 24/7. Emergency line is +233 (0)30 393 0000."
            elif "shop" in lowered or "buy" in lowered or "sell" in lowered:
                reply = "Central Mall allows students and campus vendors to buy and sell textbooks, laptops, food, and clothing using MTN MoMo & Telecel Cash."
            else:
                reply = f"Hello! I am Central AI for Central University Miotso Campus. Regarding '{user_msg}', you can use our live GPS navigator to find any facility or check Central Mall for campus items."

            self._send_json({"reply": reply})
            return

        self._send_json({"error": "Endpoint not found"}, 404)


def run_server():
    server_address = ("127.0.0.1", PORT)
    httpd = socketserver.TCPServer(server_address, PythonBackendHandler)
    print(f"🐍 Python 3.10 Backend Server running on http://127.0.0.1:{PORT}")
    httpd.serve_forever()


if __name__ == "__main__":
    run_server()
