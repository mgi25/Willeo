"""AWS Polly helpers for synthesising Wellio responses."""

from __future__ import annotations

import hashlib
import os
from contextlib import closing
from pathlib import Path
from typing import Any, Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError

AUDIO_DIR = Path(__file__).resolve().parent.parent / "static" / "audio"
_POLLY_CLIENT: Optional[Any] = None
_POLLY_INITIALISED = False


def _get_polly_client():
    """Initialise (and cache) the Polly client if credentials are present."""

    global _POLLY_CLIENT, _POLLY_INITIALISED

    if _POLLY_INITIALISED:
        return _POLLY_CLIENT

    region = os.getenv("AWS_REGION", "us-east-1")
    client_kwargs = {"region_name": region}

    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    session_token = os.getenv("AWS_SESSION_TOKEN")

    if access_key and secret_key:
        client_kwargs.update(
            {
                "aws_access_key_id": access_key,
                "aws_secret_access_key": secret_key,
            }
        )
        if session_token:
            client_kwargs["aws_session_token"] = session_token

    try:
        _POLLY_CLIENT = boto3.client("polly", **client_kwargs)
    except Exception as exc:  # pragma: no cover - network credentials vary
        print("[Polly Init Error]", exc)
        _POLLY_CLIENT = None
    finally:
        _POLLY_INITIALISED = True

    return _POLLY_CLIENT



def _ensure_audio_dir() -> Path:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    return AUDIO_DIR



def synthesize_speech(text: str, voice: str = "Joanna") -> Optional[str]:
    """Generate an MP3 file for the provided text using AWS Polly.

    Returns the relative path to the static file, or ``None`` if Polly
    is unavailable or the text is empty.
    """

    if not text:
        return None

    client = _get_polly_client()
    if client is None:
        raise RuntimeError("AWS Polly is not configured or accessible.")

    _ensure_audio_dir()

    hash_key = hashlib.sha1(text.encode("utf-8")).hexdigest()
    file_path = AUDIO_DIR / f"wellio-{hash_key}.mp3"

    try:
        response = client.synthesize_speech(Text=text, OutputFormat="mp3", VoiceId=voice)
    except (BotoCoreError, ClientError) as exc:
        raise RuntimeError("Failed to call AWS Polly") from exc

    audio_stream = response.get("AudioStream")
    if audio_stream is None:
        raise RuntimeError("AWS Polly returned no audio stream.")

    with closing(audio_stream):
        audio_bytes = audio_stream.read()

    file_path.write_bytes(audio_bytes)

    # Return path relative to Flask static folder so the frontend can load it.
    return str(file_path.relative_to(Path(__file__).resolve().parent.parent))
