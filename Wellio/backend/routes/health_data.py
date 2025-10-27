"""Route definitions for health data ingestion and analytics endpoints."""
from datetime import datetime, timezone
from typing import Any, Dict

from flask import Blueprint, jsonify, request

from database.db import get_all_records, insert_record
from models.user_data import SmartwatchData
from utils.analysis import (
    calculate_avg_heart_rate,
    detect_stress_patterns,
)

# Blueprint responsible for handling smartwatch health data routes.
health_data_bp = Blueprint("health_data", __name__)


@health_data_bp.route("/upload_data", methods=["POST"])
def upload_data():
    """Accept smartwatch data, enrich it with a timestamp, and persist it."""
    payload: Dict[str, Any] | None = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Invalid JSON payload."}), 400

    try:
        # Validate and normalize incoming data using the SmartwatchData model.
        smartwatch_data = SmartwatchData(**payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    record = smartwatch_data.to_dict()
    record["timestamp"] = datetime.now(timezone.utc).isoformat()

    try:
        insert_record(record)
        records = get_all_records()
    except Exception as exc:  # pragma: no cover - simple demo logging substitute.
        return jsonify({"error": f"Database operation failed: {exc}"}), 500

    response_payload = {
        "message": "Data received",
        "total_records": len(records),
        "analytics": {
            "average_heart_rate": calculate_avg_heart_rate(records),
            "stress_alerts": detect_stress_patterns(records),
        },
    }
    return jsonify(response_payload), 201


@health_data_bp.route("/analytics", methods=["GET"])
def analytics():
    """Provide simple analytics derived from the stored records."""
    try:
        records = get_all_records()
    except Exception as exc:  # pragma: no cover - simple demo logging substitute.
        return jsonify({"error": f"Database operation failed: {exc}"}), 500

    analytics_payload = {
        "total_records": len(records),
        "average_heart_rate": calculate_avg_heart_rate(records),
        "stress_alerts": detect_stress_patterns(records),
    }
    return jsonify(analytics_payload)
