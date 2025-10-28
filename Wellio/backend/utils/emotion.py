from transformers import pipeline

_sentiment_pipe = None
_emotion_pipe = None


def get_sentiment_pipe():
    global _sentiment_pipe
    if _sentiment_pipe is None:
        _sentiment_pipe = pipeline("sentiment-analysis")
    return _sentiment_pipe


def get_emotion_pipe():
    global _emotion_pipe
    if _emotion_pipe is None:
        _emotion_pipe = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None,
        )
    return _emotion_pipe


def analyze_user_text(text: str):
    sentiment = get_sentiment_pipe()(text)[0]
    emotions = get_emotion_pipe()(text)
    top = sorted(emotions[0], key=lambda e: e["score"], reverse=True)[0]["label"]
    return {
        "sentiment": sentiment["label"],
        "top_emotion": top,
        "emotions_raw": emotions,
    }
