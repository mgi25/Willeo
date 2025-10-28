import datetime
import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")
client = MongoClient(os.getenv("MONGO_URI"))
db = client["wellio_db"]
chats = db["chat_history"]
moods = db["mood_snapshots"]


def save_chat(user_id, user_text, ai_text, emotion_summary):
    chats.insert_one(
        {
            "user_id": user_id,
            "timestamp": datetime.datetime.utcnow(),
            "user_text": user_text,
            "ai_text": ai_text,
            "emotion": emotion_summary,
        }
    )


def record_mood(user_id, emotion_summary):
    moods.insert_one(
        {
            "user_id": user_id,
            "timestamp": datetime.datetime.utcnow(),
            "sentiment": emotion_summary.get("sentiment"),
            "top_emotion": emotion_summary.get("top_emotion"),
        }
    )


def get_recent_context(user_id, limit=5):
    data = list(chats.find({"user_id": user_id}).sort("timestamp", -1).limit(limit))
    data.reverse()
    convo = []
    for d in data:
        convo.append(f"User: {d['user_text']}")
        convo.append(f"Wellio: {d['ai_text']}")
    return "\n".join(convo)
