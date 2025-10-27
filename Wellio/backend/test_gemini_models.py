import google.generativeai as genai
import os

# Replace with your actual Gemini API key or keep os.getenv if it's in .env
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("✅ Available Gemini models:")
for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(" -", m.name)
