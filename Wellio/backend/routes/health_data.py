"""Blueprint routes for handling smartwatch health data uploads and retrieval."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List

from flask import Blueprint, jsonify, request

from database.db import get_all_records, insert_record
from utils.analysis import (
    calculate_avg_heart_rate,
    calculate_avg_sleep,
    compute_wellness_score,
    detect_stress_patterns,
    generate_ai_suggestion,
)

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
    """Return smartwatch records along with derived analytics and insights."""

    records = get_all_records()
    if records is None:
        return jsonify({"error": "Failed to fetch data from the database."}), 500

    records_list: List[Dict[str, Any]] = list(records)

    avg_heart_rate, avg_hr_message = calculate_avg_heart_rate(records_list)
    avg_sleep, avg_sleep_message = calculate_avg_sleep(records_list)
    stress_status = detect_stress_patterns(records_list)
    wellness_score, wellness_message = compute_wellness_score(records_list)

    analytics = {
        "avg_heart_rate": round(avg_heart_rate, 1)
        if avg_heart_rate is not None
        else avg_hr_message,
        "avg_sleep": round(avg_sleep, 1) if avg_sleep is not None else avg_sleep_message,
        "stress_status": stress_status,
        "wellness_score": wellness_score if wellness_score is not None else wellness_message,
    }

    analytics["ai_suggestion"] = generate_ai_suggestion(analytics)

    user_ids = sorted(
        {str(record.get("user_id")) for record in records_list if record.get("user_id")}
    )
    if user_ids:
        print("[Wellio] Generated analytics summary for users:", ", ".join(user_ids))
    else:
        print("[Wellio] Generated analytics summary for user: unknown")

    response_body = {
        "records": records_list,
        "analytics": {
            key: analytics[key]
            for key in ["avg_heart_rate", "avg_sleep", "stress_status", "wellness_score"]
        },
        "ai_suggestion": analytics["ai_suggestion"],
    }

    return jsonify(response_body), 200
