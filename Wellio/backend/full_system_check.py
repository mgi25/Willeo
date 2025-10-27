import os, json, requests, time
from dotenv import load_dotenv
from pprint import pprint

print("🩺 Running Wellio Full System Health Check...\n")

# --- 1️⃣ Load environment variables ---
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
mongo_uri = os.getenv("MONGO_URI")

print("🔹 Environment Check:")
print(f"   GEMINI_API_KEY: {'✅ Found' if api_key else '❌ Missing'}")
print(f"   MONGO_URI: {'✅ Found' if mongo_uri else '❌ Missing'}\n")

# --- 2️⃣ Gemini API connectivity ---
try:
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    models = [m.name for m in genai.list_models() if "generateContent" in m.supported_generation_methods]
    print("🔹 Gemini Connection: ✅ Working")
    print("   Available Models:", models, "\n")
except Exception as e:
    print("🔹 Gemini Connection: ❌ Failed")
    print("   Error:", e, "\n")

# --- 3️⃣ Flask endpoints test ---
print("🔹 Flask Route Checks:")
routes = [("/", "Root"), ("/fetch_data", "Fetch Data"), ("/test_gemini", "Gemini Test")]
for route, name in routes:
    try:
        r = requests.get(f"http://127.0.0.1:5000{route}", timeout=5)
        if r.status_code == 200:
            print(f"   ✅ {name} [{route}] -> 200 OK")
        else:
            print(f"   ⚠️ {name} [{route}] -> {r.status_code}")
    except Exception as e:
        print(f"   ❌ {name} [{route}] -> Error:", str(e))

# --- 4️⃣ gTTS Audio Generation Check ---
print("\n🔹 Voice (gTTS) Generation Test:")
try:
    from gtts import gTTS
    os.makedirs("static/audio", exist_ok=True)
    msg = "This is a Wellio system voice check."
    filename = f"static/audio/test_voice.mp3"
    tts = gTTS(msg, lang="en")
    tts.save(filename)
    print(f"   ✅ Voice generated successfully: {filename}")
except Exception as e:
    print("   ❌ Voice generation failed:", e)

# --- 5️⃣ MongoDB Connection ---
print("\n🔹 MongoDB Connection Check:")
try:
    from pymongo import MongoClient
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
    client.server_info()
    db_names = client.list_database_names()
    print("   ✅ Connected to MongoDB")
    print("   Databases:", db_names)
except Exception as e:
    print("   ❌ MongoDB connection failed:", e)

# --- 6️⃣ Static folder check ---
print("\n🔹 Static File Directory:")
print("   static/audio exists ->", "✅ Yes" if os.path.exists("static/audio") else "❌ No")

print("\n✅ Full system health check completed.\n")
