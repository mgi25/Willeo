"""Database helpers for interacting with MongoDB."""
from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

from utils.env_loader import load_environment
from pymongo import MongoClient
from pymongo.collection import Collection

# Load environment variables so the MongoDB URI is available when this module is imported.
load_environment()

_MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
_DB_NAME = "wellio"
_COLLECTION_NAME = "health_data"
_client: Optional[MongoClient] = None


def _get_collection() -> Collection:
    """Return the MongoDB collection used for storing smartwatch data."""
    global _client
    if _client is None:
        try:
            _client = MongoClient(
                _MONGO_URI,
                serverSelectionTimeoutMS=2000,
                connectTimeoutMS=2000,
                socketTimeoutMS=2000,
            )
        except Exception as exc:  # pragma: no cover - logging only
            print(f"Error connecting to MongoDB: {exc}")
            raise

    database = _client[_DB_NAME]
    return database[_COLLECTION_NAME]


def insert_record(data: Dict[str, Any]) -> Optional[str]:
    """Insert a smartwatch record into MongoDB and return the inserted ID."""
    try:
        collection = _get_collection()
        result = collection.insert_one(data)
        return str(result.inserted_id)
    except Exception as exc:  # pragma: no cover - logging only
        print(f"Error inserting record into MongoDB: {exc}")
        return None


def get_all_records() -> Optional[List[Dict[str, Any]]]:
    """Retrieve all smartwatch records from MongoDB."""
    try:
        collection = _get_collection()
        records: List[Dict[str, Any]] = []
        for document in collection.find():
            document["_id"] = str(document.get("_id"))
            records.append(document)
        return records
    except Exception as exc:  # pragma: no cover - logging only
        print(f"Error fetching records from MongoDB: {exc}")
        return None


def get_records_for_user(user_id: str, limit: int | None = None) -> Optional[List[Dict[str, Any]]]:
    """Return recent smartwatch records for a specific user."""

    try:
        collection = _get_collection()
        query = {"user_id": user_id}
        cursor = collection.find(query).sort("timestamp", -1)
        if limit:
            cursor = cursor.limit(limit)
        records: List[Dict[str, Any]] = []
        for document in cursor:
            document["_id"] = str(document.get("_id"))
            records.append(document)
        return records
    except Exception as exc:  # pragma: no cover - logging only
        print(f"Error fetching records for user {user_id}: {exc}")
        return None
