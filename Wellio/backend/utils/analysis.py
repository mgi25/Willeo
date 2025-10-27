"""Utility functions for performing lightweight analytics on smartwatch data."""
from __future__ import annotations

from typing import Any, Dict, Iterable, List


def calculate_avg_heart_rate(records: Iterable[Dict[str, Any]]) -> float | None:
    """Calculate the average heart rate from a collection of records."""
    heart_rates: List[int] = []
    for record in records:
        value = record.get("heart_rate")
        if isinstance(value, (int, float)):
            heart_rates.append(int(value))
    if not heart_rates:
        return None
    return sum(heart_rates) / len(heart_rates)


def detect_stress_patterns(records: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Placeholder function to surface basic stress-related patterns."""
    alerts: List[Dict[str, Any]] = []
    for record in records:
        stress_level = record.get("stress_level")
        if isinstance(stress_level, (int, float)) and stress_level >= 7:
            alerts.append({
                "user_id": record.get("user_id"),
                "stress_level": stress_level,
                "timestamp": record.get("timestamp"),
            })
    return alerts
