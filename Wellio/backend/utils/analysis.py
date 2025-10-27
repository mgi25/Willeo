"""Utility functions for producing analytics from smartwatch data."""
from __future__ import annotations

from statistics import mean
from typing import Any, Dict, Iterable, List, Tuple


def _collect_numeric(records: Iterable[Dict[str, Any]], key: str) -> List[float]:
    """Extract numeric values for ``key`` from ``records`` while ignoring bad data."""

    values: List[float] = []
    for record in records:
        value = record.get(key)
        if isinstance(value, (int, float)):
            values.append(float(value))
    return values


def calculate_avg_heart_rate(records: Iterable[Dict[str, Any]]) -> Tuple[float | None, str]:
    """Return the average heart rate and a human-readable description."""

    heart_rates = _collect_numeric(records, "heart_rate")
    if not heart_rates:
        return None, "No heart rate data available yet."

    avg_heart_rate = mean(heart_rates)
    return avg_heart_rate, f"Average heart rate is {avg_heart_rate:.1f} bpm."


def calculate_avg_sleep(records: Iterable[Dict[str, Any]]) -> Tuple[float | None, str]:
    """Return the average sleep duration and a human-readable description."""

    sleep_hours = _collect_numeric(records, "sleep_hours")
    if not sleep_hours:
        return None, "No sleep data available yet."

    avg_sleep = mean(sleep_hours)
    return avg_sleep, f"Average sleep duration is {avg_sleep:.1f} hours."


def detect_stress_patterns(records: Iterable[Dict[str, Any]]) -> str:
    """Detect high-level stress trends based on the stress level scale."""

    stress_values = _collect_numeric(records, "stress_level")
    if not stress_values:
        return "No stress data available."

    high_stress_count = sum(1 for value in stress_values if value >= 3)
    stress_ratio = high_stress_count / len(stress_values)

    if stress_ratio > 0.5:
        return "High Stress ⚠️ More than half of entries show elevated stress."
    if stress_ratio > 0.2:
        return "Moderate Stress 😐 Keep an eye on recovery and relaxation."
    return "Stress levels look balanced ✅ Keep up the good routines."


def compute_wellness_score(records: Iterable[Dict[str, Any]]) -> Tuple[int | None, str]:
    """Compute a blended wellness score (0–100) using heart rate, sleep, and stress."""

    records_list = list(records)
    if not records_list:
        return None, "Not enough data to compute a wellness score."

    avg_hr, _ = calculate_avg_heart_rate(records_list)
    avg_sleep, _ = calculate_avg_sleep(records_list)
    stress_values = _collect_numeric(records_list, "stress_level")

    if avg_hr is None and avg_sleep is None and not stress_values:
        return None, "Not enough data to compute a wellness score."

    def score_heart_rate(value: float | None) -> float:
        if value is None:
            return 50.0
        if 60 <= value <= 100:
            centered_penalty = min(25.0, abs(value - 75.0) * 1.2)
            return max(70.0, 100.0 - centered_penalty)
        penalty = min(60.0, abs(value - 80.0) * 1.5)
        return max(20.0, 70.0 - penalty)

    def score_sleep(value: float | None) -> float:
        if value is None:
            return 50.0
        if 7 <= value <= 9:
            centered_penalty = min(20.0, abs(value - 8.0) * 10.0)
            return max(75.0, 100.0 - centered_penalty)
        penalty = min(70.0, abs(value - 8.0) * 12.0)
        return max(15.0, 65.0 - penalty)

    def score_stress(values: List[float]) -> float:
        if not values:
            return 55.0
        high_ratio = sum(1 for value in values if value >= 3) / len(values)
        return max(10.0, 100.0 - high_ratio * 100.0)

    heart_rate_score = score_heart_rate(avg_hr)
    sleep_score = score_sleep(avg_sleep)
    stress_score = score_stress(stress_values)

    composite = (
        heart_rate_score * 0.35 + sleep_score * 0.35 + stress_score * 0.30
    )
    wellness_score = int(round(composite))

    if wellness_score >= 80:
        message = "Overall wellness looks excellent."
    elif wellness_score >= 60:
        message = "Wellness is decent with room for small improvements."
    elif wellness_score >= 40:
        message = "Wellness is moderate—prioritize recovery strategies."
    else:
        message = "Wellness is low—focus on rest and stress reduction."

    return wellness_score, message


def generate_ai_suggestion(analytics: Dict[str, Any]) -> str:
    """Return a placeholder AI suggestion based on computed analytics."""

    if analytics["stress_status"].startswith("High"):
        return "You seem slightly stressed. Try a 5-minute deep breathing exercise."
    if isinstance(analytics.get("avg_sleep"), (int, float)) and analytics["avg_sleep"] < 6:
        return "You need more rest today. Aim for at least 7 hours of sleep."
    return "You’re doing great! Keep maintaining your balance."

