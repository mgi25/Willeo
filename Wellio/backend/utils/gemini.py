import os
from pathlib import Path

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("⚠️ GEMINI_API_KEY not found in environment")

genai.configure(api_key=api_key)
MODEL = "gemini-1.5-flash-latest"


def get_ai_reply(user_message, mood_hint, memory_context):
    tone = mood_hint.get("top_emotion", "neutral")
    sentiment = mood_hint.get("sentiment", "neutral")
    prompt = f"""
You are Wellio — a gentle, cinematic AI companion.
Respond with empathy, warmth, and awareness of emotion.
User mood: {tone} ({sentiment})

Recent memory:
{memory_context}

User says: "{user_message}"

Give a short, heartfelt, emotionally intelligent response (2–4 sentences max).
    """
    try:
        model = genai.GenerativeModel(MODEL)
        res = model.generate_content(prompt)
        if hasattr(res, "text"):
            return res.text.strip()
        return res.candidates[0].content.parts[0].text.strip()
    except Exception as e:
        print("Gemini error:", e)
        return "I'm here with you. Let’s take a deep breath together."
