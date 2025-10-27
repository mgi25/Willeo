"""Utilities for generating AI-driven voice messages for Wellio."""
from __future__ import annotations

from dotenv import load_dotenv
import os
import google.generativeai as genai
from datetime import datetime
from gtts import gTTS

# Load .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("❌ GEMINI_API_KEY missing in .env — please add it.")

genai.configure(api_key=api_key)
print("✅ Gemini API Key loaded successfully")

# Example model usage
model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")


def analyze_with_gemini(analytics: dict) -> str:
    """Generate a friendly wellness message using Gemini 1.5 Flash."""
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""
    You are Wellio, a friendly smartwatch wellness assistant.
    Analyze this data and write a short (1-2 sentence) motivational message:
    {analytics}
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("[Gemini Error]", e)
        return "I'm having trouble connecting right now, but you’re doing great!"


def synthesize_voice(message: str) -> str:
    """Convert text message to speech and save as MP3."""
    os.makedirs("static/audio", exist_ok=True)
    filename = f"static/audio/wellio_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3"
    tts = gTTS(message, lang="en")
    tts.save(filename)
    return filename
