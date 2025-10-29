"""Helpers for generating conversational replies with Gemini."""

from __future__ import annotations

import os
from typing import Optional

import google.generativeai as genai

from utils.env_loader import load_environment

load_environment()

_MODEL_NAME = os.getenv("GEMINI_MODEL", "models/gemini-1.5-flash")
_FALLBACK_REPLY = "I'm here with you. Let’s take a deep breath together."
_model: Optional[genai.GenerativeModel] = None


def _get_model() -> Optional[genai.GenerativeModel]:
    """Initialise the Gemini model once and reuse it."""

    global _model
    if _model is not None:
        return _model

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[Gemini Warning] Missing GEMINI_API_KEY; using fallback replies.")
        return None

    try:
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel(model_name=_MODEL_NAME)
    except Exception as exc:  # pragma: no cover - configuration logging only
        print(f"[Gemini Error] Failed to initialise model '{_MODEL_NAME}': {exc}")
        _model = None

    return _model


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

    model = _get_model()
    if model is None:
        return _FALLBACK_REPLY

    try:
        res = model.generate_content(prompt)
        if hasattr(res, "text") and res.text:
            return res.text.strip()
        if getattr(res, "candidates", None):
            return res.candidates[0].content.parts[0].text.strip()
        print("[Gemini Warning] Empty response received; using fallback.")
    except Exception as exc:
        print("[Gemini Error]", exc)

    return _FALLBACK_REPLY
