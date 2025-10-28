import os
from dotenv import load_dotenv
from pathlib import Path


def load_environment() -> Path:
    """Load .env from backend directory and ensure it's applied globally."""
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
    if not os.getenv("GEMINI_API_KEY"):
        print("⚠️ Warning: GEMINI_API_KEY not found in environment!")
    return env_path
