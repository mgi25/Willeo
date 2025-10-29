"""Helpers for converting AI replies into spoken audio via AWS Polly."""

from __future__ import annotations

import hashlib
import os
from pathlib import Path
from typing import Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from utils.env_loader import load_environment

load_environment()

_AUDIO_DIR = Path(__file__).resolve().parent.parent / "static" / "audio"
_AUDIO_DIR.mkdir(parents=True, exist_ok=True)

_polly_client: Optional[boto3.client] = None


def _get_polly_client() -> Optional[boto3.client]:
    """Return a cached Polly client when credentials are present."""

    global _polly_client
    if _polly_client is not None:
        return _polly_client

    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    region = os.getenv("AWS_REGION", "us-east-1")

    if not (access_key and secret_key):
        _polly_client = None
        return _polly_client

    try:
        _polly_client = boto3.client(
            "polly",
            region_name=region,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
        )
    except (BotoCoreError, ClientError) as exc:  # pragma: no cover - depends on AWS
        print("[Polly Error]", exc)
        _polly_client = None

    return _polly_client


def synthesize_speech(text: str, voice: str = "Joanna") -> Optional[str]:
    """Generate an MP3 file for the given ``text`` and return its relative path."""

    if not text:
        return None

    client = _get_polly_client()
    if client is None:
        return None

    file_hash = hashlib.sha1(text.encode("utf-8")).hexdigest()
    output_path = _AUDIO_DIR / f"{file_hash}.mp3"

    if output_path.exists():
        return str(output_path.relative_to(Path(__file__).resolve().parent.parent))

    try:
        response = client.synthesize_speech(Text=text, OutputFormat="mp3", VoiceId=voice)
        audio_stream = response.get("AudioStream")
        if audio_stream is None:
            print("[Polly Warning] Empty audio stream returned.")
            return None
        with open(output_path, "wb") as file_handle:
            file_handle.write(audio_stream.read())
    except (BotoCoreError, ClientError) as exc:  # pragma: no cover - depends on AWS
        print("[Polly Error]", exc)
        return None

    return str(output_path.relative_to(Path(__file__).resolve().parent.parent))
