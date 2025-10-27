import json
import os
from typing import Dict, Tuple

import requests
from dotenv import load_dotenv

from utils.ai_voice import analyze_with_gemini, list_gemini_models, synthesize_voice

print("🩺 Running Wellio Full System Health Check...\n")

# --- 1️⃣ Load environment variables ---
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
mongo_uri = os.getenv("MONGO_URI")

print("🔹 Environment Check:")
print(f"   GEMINI_API_KEY: {'✅ Found' if api_key else '❌ Missing'}")
print(f"   MONGO_URI: {'✅ Found' if mongo_uri else '❌ Missing'}\n")

# --- 2️⃣ Gemini API connectivity ---
gemini_ok = False
if api_key:
    from google.generativeai import configure

    try:
        configure(api_key=api_key)
        models = list_gemini_models()
        sample_message = analyze_with_gemini({"status": "health check"})
        if models or sample_message:
            gemini_ok = True
        print("🔹 Gemini Connection: ✅ Working" if gemini_ok else "🔹 Gemini Connection: ⚠️ Limited")
        print("   Available Models:")
        print(json.dumps(models, indent=2))
    except Exception as exc:
        print("🔹 Gemini Connection: ❌ Failed")
        print("   Error:", exc)
else:
    print("🔹 Gemini Connection: ❌ Missing API key; skipped")

# --- 3️⃣ Flask endpoints test ---
print("\n🔹 Flask Route Checks:")
route_statuses: Dict[str, Tuple[bool, str]] = {}
routes = [("/", "Root"), ("/fetch_data", "Fetch Data"), ("/test_gemini", "Gemini Test")]
for route, name in routes:
    try:
        response = requests.get(f"http://127.0.0.1:5000{route}", timeout=10)
        ok = response.status_code == 200
        route_statuses[route] = (ok, str(response.status_code))
        status_icon = "✅" if ok else "⚠️"
        print(f"   {status_icon} {name} [{route}] -> {response.status_code}")
    except Exception as exc:
        route_statuses[route] = (False, str(exc))
        print(f"   ❌ {name} [{route}] -> Error: {exc}")

# --- 4️⃣ gTTS Audio Generation Check ---
print("\n🔹 Voice (gTTS) Generation Test:")
voice_ok = False
try:
    filename = synthesize_voice("This is a Wellio system voice check.")
    if filename:
        voice_ok = True
        print(f"   ✅ Voice generated successfully: {filename}")
    else:
        print("   ⚠️ Voice generation skipped (no audio produced).")
except Exception as exc:
    print("   ❌ Voice generation failed:", exc)

# --- 5️⃣ MongoDB Connection ---
print("\n🔹 MongoDB Connection Check:")
mongo_ok = False
try:
    from pymongo import MongoClient

    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
    client.server_info()
    mongo_ok = True
    print("   ✅ Connected to MongoDB")
except Exception as exc:
    print("   ❌ MongoDB connection failed:", exc)

# --- 6️⃣ Static folder check ---
static_ok = os.path.exists("static/audio")
print("\n🔹 Static File Directory:")
print("   static/audio exists ->", "✅ Yes" if static_ok else "❌ No")

if (
    gemini_ok
    and voice_ok
    and mongo_ok
    and all(status for status, _ in route_statuses.values())
    and static_ok
):
    print("\n✅ Wellio backend fully updated to Gemini 2.5 and functioning correctly")
else:
    print("\n⚠️ Wellio backend check completed with issues. Review logs above.")
