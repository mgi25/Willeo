"""Main Flask application for the Wellio backend service."""
from __future__ import annotations

from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv


def _log_environment_safety() -> None:
    """Validate that sensitive files are ignored in version control."""

    gitignore_path = Path(__file__).resolve().parent / ".gitignore"
    required_groups = [
        ["__pycache__/"],
        ["*.pyc", "*.py[cod]"],
        [".env"],
        ["*.env"],
        [".DS_Store"],
    ]

    try:
        content = gitignore_path.read_text(encoding="utf-8", errors="ignore")
    except FileNotFoundError:
        print("⚠️ .gitignore not found; please ensure environment safety manually.")
        return

    if all(any(entry in content for entry in group) for group in required_groups):
        print("✅ Environment safe and clean")
    else:
        print("⚠️ Update .gitignore to include environment safeguards.")


# Load environment variables from a .env file if present.
load_dotenv()
_log_environment_safety()

# Import the blueprint that contains health data routes.
from routes.health_data import health_data_bp
from utils.ai_voice import gemini_respond


def create_app() -> Flask:
    """Application factory that sets up the Flask app and registers blueprints."""
    app = Flask(__name__)
    CORS(app, origins="*")

    # Register blueprints for modular route management.
    app.register_blueprint(health_data_bp)

    @app.route("/", methods=["GET"])
    def home() -> str:
        """Provide a default message confirming the backend is reachable."""
        return "✅ Wellio backend is running. Try /api/health or /api/ai/text."

    @app.route("/api/health", methods=["GET"])
    def get_health() -> tuple:
        """Return a sample set of wellness metrics for quick health checks."""

        data = {
            "heart_rate": 75,
            "sleep_hours": 7.2,
            "steps": 8200,
            "stress_level": 2,
        }

        return jsonify(data), 200

    @app.route("/api/ai/text", methods=["GET", "POST"])
    def ai_text() -> tuple:
        """Generate a Gemini powered response for the supplied query text."""

        if request.method == "GET":
            return (
                jsonify(
                    {
                        "message": "Use POST with JSON body {'query': '<your text>'} to get AI response.",
                    }
                ),
                200,
            )

        payload = request.get_json(silent=True) or {}
        query = str(payload.get("query", "")).strip()

        if not query:
            return jsonify({"error": "Query text is required."}), 400

        response_text = gemini_respond(query)

        return jsonify({"answer": response_text}), 200

    return app


# Instantiate the Flask app using the factory.
app = create_app()


if __name__ == "__main__":
    # Run the Flask development server with debug mode enabled for rapid iteration.
    app.run(debug=True)
