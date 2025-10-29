"""Lightweight sentiment and emotion analysis helpers."""

from __future__ import annotations

import os
from typing import Any, Dict

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from transformers import pipeline

_sentiment_pipe = None
_emotion_pipe = None
_comprehend_client = None


def get_sentiment_pipe():
    global _sentiment_pipe
    if _sentiment_pipe is None:
        _sentiment_pipe = pipeline(
            "sentiment-analysis",
            model="distilbert/distilbert-base-uncased-finetuned-sst-2-english",
            framework="pt",
        )
    return _sentiment_pipe


def get_emotion_pipe():
    global _emotion_pipe
    if _emotion_pipe is None:
        _emotion_pipe = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None,
            framework="pt",
        )
    return _emotion_pipe


def get_comprehend_client():
    """Return a cached AWS Comprehend client when credentials are available."""

    global _comprehend_client
    if _comprehend_client is not None:
        return _comprehend_client

    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    region = os.getenv("AWS_REGION", "us-east-1")

    if not (access_key and secret_key):
        _comprehend_client = False
        return _comprehend_client

    try:
        _comprehend_client = boto3.client(
            "comprehend",
            region_name=region,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
        )
    except (BotoCoreError, ClientError) as exc:  # pragma: no cover - environment specific
        print("[Comprehend Error]", exc)
        _comprehend_client = False

    return _comprehend_client


def _blend_sentiment(local_label: str, comprehend_data: Dict[str, Any]) -> str:
    """Blend local and AWS sentiment labels into a single descriptor."""

    aws_label = comprehend_data.get("label")
    if not aws_label:
        return local_label

    if aws_label.lower() == local_label.lower():
        return aws_label

    return f"{aws_label} (local: {local_label})"


def analyze_user_text(text: str):
    sentiment = get_sentiment_pipe()(text)[0]
    emotions = get_emotion_pipe()(text)
    top = sorted(emotions[0], key=lambda e: e["score"], reverse=True)[0]["label"]

    result = {
        "sentiment": sentiment["label"],
        "top_emotion": top,
        "emotions_raw": emotions,
    }

    comprehend_client = get_comprehend_client()
    if comprehend_client:
        try:
            comp = comprehend_client.detect_sentiment(Text=text, LanguageCode="en")
            comprehend_data = {
                "label": comp.get("Sentiment"),
                "scores": comp.get("SentimentScore"),
            }
            result["aws_sentiment"] = comprehend_data
            result["sentiment"] = _blend_sentiment(sentiment["label"], comprehend_data)
        except (BotoCoreError, ClientError) as exc:  # pragma: no cover - network dependent
            print("[Comprehend Error]", exc)

    return result
