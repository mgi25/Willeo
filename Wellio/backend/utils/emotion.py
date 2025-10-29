"""Lightweight sentiment and emotion analysis helpers."""

import os
from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from transformers import pipeline

_sentiment_pipe = None
_emotion_pipe = None
_comprehend_client = None
_comprehend_initialised = False


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


def analyze_user_text(text: str):
    sentiment = get_sentiment_pipe()(text)[0]
    emotions = get_emotion_pipe()(text)
    top = sorted(emotions[0], key=lambda e: e["score"], reverse=True)[0]["label"]

    result: Dict[str, Any] = {
        "sentiment": sentiment["label"],
        "top_emotion": top,
        "emotions_raw": emotions,
    }

    comprehend_data = _detect_sentiment_with_comprehend(text)
    if comprehend_data:
        aws_sentiment = comprehend_data.get("Sentiment")
        scores = comprehend_data.get("SentimentScore")
        if aws_sentiment:
            result["aws_sentiment"] = aws_sentiment.lower()
        if scores:
            result["aws_sentiment_scores"] = scores

        mapped_emotion = _map_sentiment_to_emotion(aws_sentiment)
        if mapped_emotion:
            # If Comprehend is confident, let it steer the dominant emotion but
            # keep the original for transparency.
            if scores and max(scores.values()) >= 0.6 and mapped_emotion.lower() != top.lower():
                result["hf_top_emotion"] = top
                result["top_emotion"] = mapped_emotion
            else:
                result["blended_emotion"] = mapped_emotion

    return result


def _map_sentiment_to_emotion(sentiment: Optional[str]) -> Optional[str]:
    if not sentiment:
        return None

    mapping = {
        "positive": "joy",
        "negative": "sadness",
        "neutral": "calm",
        "mixed": "thoughtful",
    }
    return mapping.get(sentiment.lower())


def _get_comprehend_client():
    global _comprehend_client, _comprehend_initialised

    if _comprehend_initialised:
        return _comprehend_client

    region = os.getenv("AWS_REGION", "us-east-1")

    try:
        _comprehend_client = boto3.client("comprehend", region_name=region)
    except Exception as exc:  # pragma: no cover - depends on AWS setup
        print("[Comprehend Init Error]", exc)
        _comprehend_client = None
    finally:
        _comprehend_initialised = True

    return _comprehend_client


def _detect_sentiment_with_comprehend(text: str) -> Optional[Dict[str, Any]]:
    client = _get_comprehend_client()
    if not client:
        return None

    try:
        return client.detect_sentiment(Text=text, LanguageCode="en")
    except (BotoCoreError, ClientError) as exc:  # pragma: no cover - network call
        print("[Comprehend Error]", exc)
        return None
