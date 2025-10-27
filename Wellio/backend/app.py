"""Main Flask application for the Wellio backend service."""
from __future__ import annotations

from pathlib import Path

from flask import Flask, jsonify
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
        content = gitignore_path.read_text()
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


def create_app() -> Flask:
    """Application factory that sets up the Flask app and registers blueprints."""
    app = Flask(__name__)
    CORS(app, origins="*")

    # Register blueprints for modular route management.
    app.register_blueprint(health_data_bp)

    @app.route("/api/status", methods=["GET"])
    def root() -> tuple:
        """Basic health check endpoint for the Wellio backend."""
        return jsonify({"status": "Wellio Backend Running ✅"}), 200

    return app


# Instantiate the Flask app using the factory.
app = create_app()


if __name__ == "__main__":
    # Run the Flask development server with debug mode enabled for rapid iteration.
    app.run(debug=True)
