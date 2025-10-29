"""Helpers for communicating with Gemini models."""

import os
from typing import Iterable

from dotenv import load_dotenv
import google.generativeai as genai

# Load env vars (GEMINI_API_KEY, etc.)
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("⚠️ GEMINI_API_KEY not found in environment!")

# Configure Gemini client
try:
    genai.configure(api_key=api_key)

    # ✅ Use a model that we KNOW exists for your key
    MODEL = "models/gemini-2.5-flash-lite"

    model = genai.GenerativeModel(MODEL)
    print(f"✅ Connected to Gemini: {MODEL}")
except Exception as e:
    print(f"[Gemini Error] ❌ {e}")
    model = None


def _safe_emotion_label(emotion_obj):
    """
    emotion_obj could be:
    - dict from analyze_user_text()
    - string
    - None
    We normalize it to a lowercase string like "sad", "stressed", etc.
    """
    if isinstance(emotion_obj, dict):
        # Our analyze_user_text returns { "sentiment": "...", "top_emotion": "...", ... }
        # so we'll prefer top_emotion
        if "top_emotion" in emotion_obj:
            return str(emotion_obj["top_emotion"]).lower()
        if "label" in emotion_obj:
            return str(emotion_obj["label"]).lower()
    elif isinstance(emotion_obj, str):
        return emotion_obj.lower()

    return "neutral"


def _collect_stream_chunks(response_stream: Iterable) -> str:
    """Safely collect streamed chunks from Gemini into a single string."""

    chunks: list[str] = []

    for chunk in response_stream:
        # chunk may expose text directly or via "candidates" depending on SDK version
        text = getattr(chunk, "text", None)
        if text:
            chunks.append(text)
            continue

        candidates = getattr(chunk, "candidates", None)
        if candidates:
            try:
                part_text = candidates[0].content.parts[0].text
            except Exception:
                part_text = None
            if part_text:
                chunks.append(part_text)

    return "".join(chunks).strip()


def get_ai_reply(user_text: str, mood_hint=None, context: str = None) -> str:
    """
    Create an empathetic, memory-aware response.

    user_text  -> what the user just said
    mood_hint  -> output from analyze_user_text()
    context    -> recent convo history from Mongo
    """

    if not model:
        return "I'm here with you. I couldn't reach my thinking core just now, but you're not alone."

    # Normalize emotion for the prompt
    user_feeling = _safe_emotion_label(mood_hint)

    # Build a rich prompt for the model
    system_instructions = f"""
You are Wellio, a gentle emotional support companion.
Your job:
- Be kind, calm, and extremely human.
- Talk like you're here with them right now.
- Keep replies short (2 to 4 sentences).
- Ask one soft follow-up question at the end to keep them talking.
- Never sound like a robot or therapist script.
- Emotion detected: {user_feeling}.
    """.strip()

    memory_block = ""
    if context:
        memory_block = f"""
Here is the recent conversation between you and the user. Use this to stay consistent and show you remember:
{context}
        """.strip()

    final_prompt = f"""
{system_instructions}

{memory_block}

The user now says:
"{user_text}"

Wellio, answer in a warm, caring, first-person voice:
    """.strip()

    try:
        response_stream = model.generate_content(final_prompt, stream=True)
        final_reply = _collect_stream_chunks(response_stream)

        if final_reply:
            return final_reply

        # If stream returned nothing, fall back to a non-streaming call.
        fallback_response = model.generate_content(final_prompt)
        if hasattr(fallback_response, "text") and fallback_response.text:
            return fallback_response.text.strip()

        if getattr(fallback_response, "candidates", None):
            try:
                return fallback_response.candidates[0].content.parts[0].text.strip()
            except Exception:
                pass

        return "I’m still here with you. Tell me more about how you're feeling right now."

    except Exception as e:
        print(f"[Gemini Error] {e}")
        return "Something went wrong in my thinking, but I’m still here with you. Keep talking to me."
