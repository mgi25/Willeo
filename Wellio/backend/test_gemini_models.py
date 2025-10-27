<<<<<<< HEAD
from dotenv import load_dotenv
import google.generativeai as genai
import os
import json

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("❌ GEMINI_API_KEY not found in .env file")

genai.configure(api_key=api_key)

models = []
for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        models.append(m.name)

print("✅ Available Gemini Models:")
print(json.dumps(models, indent=2))
=======
import google.generativeai as genai
import os

# Replace with your actual Gemini API key or keep os.getenv if it's in .env
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("✅ Available Gemini models:")
for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(" -", m.name)
>>>>>>> fc9238b (update)
