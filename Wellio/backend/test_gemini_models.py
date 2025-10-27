"""Utility script to list available Gemini models for debugging."""
from __future__ import annotations

import json
import os

from dotenv import load_dotenv

try:
    import google.generativeai as genai
except ImportError as exc:  # pragma: no cover - diagnostics only
    raise SystemExit(f"google-generativeai package is required: {exc}")


def main() -> None:
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        print("❌ Missing GEMINI_API_KEY in .env")
        return

    genai.configure(api_key=api_key)

    models = [
        m.name for m in genai.list_models() if "generateContent" in m.supported_generation_methods
    ]

    print("✅ Available Gemini Models:")
    print(json.dumps(models, indent=2))


if __name__ == "__main__":
    main()
