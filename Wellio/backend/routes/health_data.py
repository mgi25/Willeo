"""Blueprint routes for handling smartwatch health data uploads and retrieval."""
from __future__ import annotations

from datetime import datetime, timezone
from statistics import mean
from typing import Any, Dict, List
from urllib.parse import urljoin
import os

from dotenv import load_dotenv
import google.generativeai as genai
from flask import Blueprint, jsonify, request

from database.db import get_all_records, get_records_for_user, insert_record
from utils.analysis import (
    calculate_avg_heart_rate,
    calculate_avg_sleep,
    compute_wellness_score,
    detect_stress_patterns,
)
from utils.ai_voice import (
    FALLBACK_MESSAGE,
    analyze_with_gemini,
    synthesize_voice,
    list_gemini_models,
)

health_data_bp = Blueprint("health_data", __name__, url_prefix="/api")

_REQUIRED_FIELDS = [
    "user_id",
    "heart_rate",
    "steps",
    "stress_level",
    "sleep_hours",
]


@health_data_bp.route("/data/upload", methods=["POST"])
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


@health_data_bp.route("/data/fetch", methods=["GET"])
def fetch_data():
    """Return smartwatch records along with derived analytics and insights."""

    records = get_all_records()
    db_available = True
    if records is None:
        db_available = False
        records_list = []
    else:
        records_list = list(records)

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

    ai_message = FALLBACK_MESSAGE
    try:
        ai_message = analyze_with_gemini(analytics)
    except Exception as exc:  # pragma: no cover - defensive logging
        print("[Gemini Error]", exc)

    audio_path = ""
    try:
        audio_path = synthesize_voice(ai_message)
    except Exception as exc:  # pragma: no cover - defensive logging
        print("[Voice Synthesis Error]", exc)

    voice_url = None
    if audio_path:
        host_root = request.host_url.rstrip("/")
        voice_url = urljoin(f"{host_root}/", audio_path)

    user_ids = sorted(
        {str(record.get("user_id")) for record in records_list if record.get("user_id")}
    )
    if user_ids:
        print("[Wellio] Generated analytics summary for users:", ", ".join(user_ids))
    elif db_available:
        print("[Wellio] Generated analytics summary for user: unknown")
    else:
        print("[Wellio] No database connection; returning placeholder analytics.")

    response_body = {
        "records": records_list,
        "analytics": {
            key: analytics[key]
            for key in ["avg_heart_rate", "avg_sleep", "stress_status", "wellness_score"]
        },
        "ai_message": ai_message,
        "voice_url": voice_url,
    }

    if not db_available:
        response_body["warning"] = "Database unavailable; analytics based on cached defaults."

    return jsonify(response_body), 200


@health_data_bp.route("/ai/test", methods=["GET"])
def test_gemini():
    """Test Gemini API connectivity and list available models."""
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")

    models: List[str] = []
    ai_message = FALLBACK_MESSAGE
    voice_url = None

    if not api_key:
        print("❌ Missing GEMINI_API_KEY in .env")
    else:
        try:
            genai.configure(api_key=api_key)
            if os.getenv("ENABLE_GEMINI_MODEL_LIST", "0").lower() in {"1", "true", "yes"}:
                models = list_gemini_models()
            ai_message = analyze_with_gemini(
                {
                    "avg_heart_rate": "n/a",
                    "avg_sleep": "n/a",
                    "stress_status": "n/a",
                    "wellness_score": "n/a",
                }
            )
        except Exception as exc:
            print("[Gemini Error]", exc)

    try:
        audio_path = synthesize_voice(ai_message)
    except Exception as exc:  # pragma: no cover - defensive logging
        print("[Voice Synthesis Error]", exc)
        audio_path = ""

    if audio_path:
        host_root = request.host_url.rstrip("/")
        voice_url = urljoin(f"{host_root}/", audio_path)

    payload = {
        "status": "✅ Gemini connection successful" if models else "Gemini check completed",
        "models": models,
        "ai_message": ai_message,
        "voice_url": voice_url,
    }

    return jsonify(payload), 200


@health_data_bp.route("/ai/voice", methods=["GET"])
def talk():
    """Generate a motivational voice message for a single user."""

    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400

    records = get_records_for_user(user_id, limit=50)
    db_available = True
    if records is None:
        db_available = False
        records = []

    if not db_available:
        return (
            jsonify(
                {
                    "user_id": user_id,
                    "analytics": {},
                    "message": FALLBACK_MESSAGE,
                    "voice_url": None,
                    "warning": "Database unavailable; analytics based on cached defaults.",
                }
            ),
            200,
        )

    if not records:
        return (
            jsonify(
                {
                    "message": "No data available for this user yet.",
                    "voice_url": None,
                }
            ),
            200,
        )

    avg_heart_rate, avg_hr_message = calculate_avg_heart_rate(records)
    avg_sleep, avg_sleep_message = calculate_avg_sleep(records)
    stress_status = detect_stress_patterns(records)
    wellness_score, wellness_message = compute_wellness_score(records)

    analytics = {
        "avg_heart_rate": round(avg_heart_rate, 1)
        if avg_heart_rate is not None
        else avg_hr_message,
        "avg_sleep": round(avg_sleep, 1) if avg_sleep is not None else avg_sleep_message,
        "stress_status": stress_status,
        "wellness_score": wellness_score if wellness_score is not None else wellness_message,
    }

    prompt = (
        "Generate a short motivational message for a user with the following analytics: "
        f"{analytics}."
    )

    ai_message = FALLBACK_MESSAGE
    try:
        ai_message = analyze_with_gemini({"user_id": user_id, **analytics, "prompt": prompt})
    except Exception as exc:  # pragma: no cover - defensive logging
        print("[Gemini Error]", exc)

    audio_path = ""
    try:
        audio_path = synthesize_voice(ai_message)
    except Exception as exc:  # pragma: no cover - defensive logging
        print("[Voice Synthesis Error]", exc)

    voice_url = None
    if audio_path:
        host_root = request.host_url.rstrip("/")
        voice_url = urljoin(f"{host_root}/", audio_path)

    payload = {
        "user_id": user_id,
        "analytics": analytics,
        "message": ai_message,
        "voice_url": voice_url,
    }

    return jsonify(payload), 200


@health_data_bp.route("/health", methods=["GET"])
def get_health() -> tuple:
    """Return aggregated vitals for dashboard consumption."""

    records = get_all_records()
    records_list = list(records) if records is not None else []

    avg_heart_rate, avg_hr_message = calculate_avg_heart_rate(records_list)
    avg_sleep, avg_sleep_message = calculate_avg_sleep(records_list)

    step_values = [
        float(record.get("steps"))
        for record in records_list
        if isinstance(record.get("steps"), (int, float))
    ]
    avg_steps = int(round(mean(step_values))) if step_values else None

    stress_values = [
        float(record.get("stress_level"))
        for record in records_list
        if isinstance(record.get("stress_level"), (int, float))
    ]
    avg_stress = round(mean(stress_values), 1) if stress_values else None

    payload = {
        "heart_rate": round(avg_heart_rate, 1) if avg_heart_rate is not None else None,
        "sleep_hours": round(avg_sleep, 1) if avg_sleep is not None else None,
        "steps": avg_steps,
        "stress_level": avg_stress,
    }

    if not records_list:
        payload["warning"] = "No records available; showing placeholder vitals."
        payload.update(
            {
                "heart_rate": payload["heart_rate"] or 72,
                "sleep_hours": payload["sleep_hours"] or 6.5,
                "steps": payload["steps"] or 8000,
                "stress_level": payload["stress_level"] or 3,
            }
        )

    if payload["heart_rate"] is None:
        payload["heart_rate_note"] = avg_hr_message
    if payload["sleep_hours"] is None:
        payload["sleep_note"] = avg_sleep_message
    if payload["stress_level"] is None:
        payload["stress_note"] = detect_stress_patterns(records_list)

    return jsonify(payload), 200


@health_data_bp.route("/ai/text", methods=["POST"])
def ai_text() -> tuple:
    """Return a Gemini-powered text response for the provided query."""

    payload: Dict[str, Any] | None = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Invalid or missing JSON payload."}), 400

    user_query = str(payload.get("query", "")).strip()
    if not user_query:
        return jsonify({"error": "Query text is required."}), 400

    try:
        ai_response = analyze_with_gemini({"query": user_query})
    except Exception as exc:  # pragma: no cover - defensive logging
        print("[Gemini Error]", exc)
        ai_response = FALLBACK_MESSAGE

    return jsonify({"answer": ai_response}), 200
