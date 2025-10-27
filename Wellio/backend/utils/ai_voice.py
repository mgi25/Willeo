"""Utilities for generating AI-driven voice messages for Wellio."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, TimeoutError
from datetime import datetime
import os
import atexit
from typing import List, Optional

from dotenv import load_dotenv
from gtts import gTTS
import google.generativeai as genai
import requests

GENAI_MODEL_NAME = "models/gemini-2.5-flash"
FALLBACK_MESSAGE = "I'm having trouble connecting right now, but you're doing great!"

load_dotenv()

_model: Optional[genai.GenerativeModel] = None
_executor = ThreadPoolExecutor(max_workers=4)
atexit.register(_executor.shutdown, wait=False)


def _initialize_model() -> Optional[genai.GenerativeModel]:
    """Initialize the Gemini model if credentials are available."""

    global _model
    if _model is not None:
        return _model

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ Missing GEMINI_API_KEY in .env")
        return None

    try:
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel(model_name=GENAI_MODEL_NAME)
        print("✅ Gemini 2.5 model active: models/gemini-2.5-flash")
    except Exception as exc:  # pragma: no cover - configuration logging only
        print(f"[Gemini Error] Failed to initialize model: {exc}")
        _model = None

    return _model


# Attempt to initialize on import so startup logs reflect status.
_initialize_model()


def analyze_with_gemini(analytics: dict) -> str:
    """Generate a friendly wellness message using Gemini 2.5 Flash."""
    model = _initialize_model()
    if model is None:
        print("[Gemini Warning] Model unavailable; returning fallback message.")
        return FALLBACK_MESSAGE

    prompt = f"""
    You are Wellio, a friendly smartwatch wellness assistant.
    Analyze this data and write a short (1-2 sentence) motivational message:
    {analytics}
    """
    future = _executor.submit(model.generate_content, prompt)
    try:
        response = future.result(timeout=3)
        if hasattr(response, "text") and response.text:
            return response.text.strip()
        print("[Gemini Warning] Empty response received; using fallback message.")
        return FALLBACK_MESSAGE
    except TimeoutError:
        future.cancel()
        print("[Gemini Warning] Generation timed out; using fallback message.")
        return FALLBACK_MESSAGE
    except Exception as e:
        print("[Gemini Error]", e)
        return FALLBACK_MESSAGE


def synthesize_voice(message: str) -> str:
    """Convert text message to speech and save as MP3."""
    os.makedirs("static/audio", exist_ok=True)
    filename = f"static/audio/wellio_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp3"

    def _generate() -> str:
        tts = gTTS(message, lang="en")
        tts.save(filename)
        return filename

    future = _executor.submit(_generate)
    try:
        return future.result(timeout=3)
    except TimeoutError:
        future.cancel()
        print("[Voice Synthesis Warning] gTTS timed out; skipping audio generation.")
        return ""
    except Exception as exc:
        print("[Voice Synthesis Error]", exc)
        return ""


def list_gemini_models() -> List[str]:
    """Return available Gemini models, handling timeouts gracefully."""

    if _initialize_model() is None:
        return []

    future = _executor.submit(
        lambda: [
            m.name
            for m in genai.list_models()
            if "generateContent" in m.supported_generation_methods
        ]
    )

    try:
        return future.result(timeout=3)
    except TimeoutError:
        future.cancel()
        print("[Gemini Warning] Listing models timed out; returning empty list.")
        return []
    except Exception as exc:
        print("[Gemini Error] Unable to list models:", exc)
        return []
