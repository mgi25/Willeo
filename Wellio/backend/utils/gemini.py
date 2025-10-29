"""Helpers for generating conversational replies with Gemini."""

from __future__ import annotations

import os
from typing import Optional

import google.generativeai as genai

from utils.env_loader import load_environment

load_environment()

_MODEL_NAME = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash-lite")
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


def _format_emotion(mood_hint: Optional[dict]) -> str:
    """Return a safe, human-readable emotion description."""

    if not mood_hint:
        return "neutral"

    emotion = mood_hint.get("top_emotion") or mood_hint.get("emotion")
    sentiment = mood_hint.get("sentiment")

    if emotion and sentiment:
        return f"{emotion} ({sentiment})"
    if emotion:
        return str(emotion)
    if sentiment:
        return str(sentiment)
    return "neutral"


def get_ai_reply(user_message, mood_hint, memory_context):
    """Generate an empathetic reply using Gemini streaming responses."""

    instructions = (
        "You are Wellio — a calm, cinematic AI companion. "
        "Respond with warmth and empathy, stay concise (<=3 sentences), "
        "and stay grounded in the provided memory context."
    )
    emotion = _format_emotion(mood_hint)
    context = memory_context or "None"

    prompt = (
        f"{instructions}\n\n"
        f"Detected emotion: {emotion}.\n\n"
        f"Recent context:\n{context}\n\n"
        f"User: {user_message}\nWellio:"
    )

    model = _get_model()
    if model is None:
        return _FALLBACK_REPLY

    try:
        response_stream = model.generate_content(prompt, stream=True)
        final_reply = ""
        for chunk in response_stream:
            text = getattr(chunk, "text", None)
            if text:
                final_reply += text
        if final_reply.strip():
            return final_reply.strip()
        print("[Gemini Warning] Empty streamed response; using fallback.")
    except Exception as exc:
        print("[Gemini Error]", exc)

    return _FALLBACK_REPLY
