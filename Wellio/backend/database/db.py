"""Database helpers for interacting with MongoDB."""
from __future__ import annotations

import os
from typing import Any, Dict, List

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.errors import ConfigurationError

# Load environment variables so the MongoDB URI is available when this module is imported.
load_dotenv()

_DEFAULT_DB_NAME = "wellio"
_COLLECTION_NAME = "wellio_data"
_client: MongoClient | None = None


def _get_client() -> MongoClient:
    """Create (or return) a cached MongoDB client instance."""
    global _client
    if _client is None:
        mongo_uri = os.getenv("MONGO_URI")
        if not mongo_uri:
            raise RuntimeError("MONGO_URI environment variable is not set.")
        _client = MongoClient(mongo_uri)
    return _client


def _get_collection() -> Collection:
    """Fetch the MongoDB collection used for storing smartwatch data."""
    client = _get_client()
    try:
        database = client.get_default_database()
        if database is None:
            raise ConfigurationError("No default database set in URI.")
    except ConfigurationError:
        database = client[_DEFAULT_DB_NAME]
    return database[_COLLECTION_NAME]


def insert_record(data: Dict[str, Any]) -> str:
    """Insert a smartwatch record into the collection.

    Returns the inserted document's ID as a string for reference.
    """
    collection = _get_collection()
    result = collection.insert_one(data)
    return str(result.inserted_id)


def get_all_records() -> List[Dict[str, Any]]:
    """Retrieve all smartwatch records from the collection as a list of dictionaries."""
    collection = _get_collection()
    records: List[Dict[str, Any]] = []
    for document in collection.find():
        document["_id"] = str(document.get("_id"))
        records.append(document)
    return records
