"""Model definitions for smartwatch data payloads."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class SmartwatchData:
    """Lightweight data model representing smartwatch telemetry."""

    user_id: str
    heart_rate: int
    steps: int
    stress_level: int
    sleep_hours: float

    def __post_init__(self) -> None:
        """Perform basic validation similar to a Pydantic model."""
        if not self.user_id or not isinstance(self.user_id, str):
            raise ValueError("'user_id' must be a non-empty string.")

        self.heart_rate = self._validate_int("heart_rate", self.heart_rate, minimum=0)
        self.steps = self._validate_int("steps", self.steps, minimum=0)
        self.stress_level = self._validate_int("stress_level", self.stress_level, minimum=0, maximum=10)
        self.sleep_hours = self._validate_float("sleep_hours", self.sleep_hours, minimum=0.0)

    @staticmethod
    def _validate_int(field: str, value: Any, *, minimum: int | None = None, maximum: int | None = None) -> int:
        if not isinstance(value, int):
            raise ValueError(f"'{field}' must be an integer.")
        if minimum is not None and value < minimum:
            raise ValueError(f"'{field}' must be greater than or equal to {minimum}.")
        if maximum is not None and value > maximum:
            raise ValueError(f"'{field}' must be less than or equal to {maximum}.")
        return value

    @staticmethod
    def _validate_float(field: str, value: Any, *, minimum: float | None = None, maximum: float | None = None) -> float:
        if not isinstance(value, (float, int)):
            raise ValueError(f"'{field}' must be a number.")
        value = float(value)
        if minimum is not None and value < minimum:
            raise ValueError(f"'{field}' must be greater than or equal to {minimum}.")
        if maximum is not None and value > maximum:
            raise ValueError(f"'{field}' must be less than or equal to {maximum}.")
        return value

    def to_dict(self) -> Dict[str, Any]:
        """Return a dictionary representation of the smartwatch data."""
        return {
            "user_id": self.user_id,
            "heart_rate": self.heart_rate,
            "steps": self.steps,
            "stress_level": self.stress_level,
            "sleep_hours": self.sleep_hours,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SmartwatchData":
        """Construct a SmartwatchData instance from a raw dictionary."""
        return cls(**data)
