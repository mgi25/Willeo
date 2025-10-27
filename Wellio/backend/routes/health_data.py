"""Blueprint routes for handling smartwatch health data uploads and retrieval."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict

from flask import Blueprint, jsonify, request

from database.db import get_all_records, insert_record

health_data_bp = Blueprint("health_data", __name__)

_REQUIRED_FIELDS = [
    "user_id",
    "heart_rate",
    "steps",
    "stress_level",
    "sleep_hours",
]


@health_data_bp.route("/upload_data", methods=["POST"])
def upload_data():
    """Accept smartwatch data, validate it, add a timestamp, and persist it."""
    payload: Dict[str, Any] | None = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Invalid or missing JSON payload."}), 400

    missing_fields = [field for field in _REQUIRED_FIELDS if field not in payload]
    if missing_fields:
        return (
            jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}),
            400,
        )

    record = {field: payload[field] for field in _REQUIRED_FIELDS}
    record["timestamp"] = datetime.now(timezone.utc).isoformat()

    insert_result = insert_record(record)
    if insert_result is None:
        return jsonify({"error": "Failed to save data to the database."}), 500

    return jsonify({"message": "Data received successfully ✅"}), 200


@health_data_bp.route("/fetch_data", methods=["GET"])
def fetch_data():
    """Return all smartwatch data records stored in the database."""
    records = get_all_records()
    if records is None:
        return jsonify({"error": "Failed to fetch data from the database."}), 500

    return jsonify(records), 200
