"""Main Flask application for the Wellio backend service."""
from flask import Flask
from dotenv import load_dotenv

# Load environment variables from a .env file if present.
load_dotenv()

# Import the blueprint that contains health data routes.
from routes.health_data import health_data_bp


def create_app() -> Flask:
    """Application factory that sets up the Flask app and registers blueprints."""
    app = Flask(__name__)

    # Register blueprints for modular route management.
    app.register_blueprint(health_data_bp)

    @app.route("/")
    def root() -> str:
        """Basic health check endpoint for the Wellio backend."""
        return "Wellio Backend Running ✅"

    return app


# Instantiate the Flask app using the factory.
app = create_app()


if __name__ == "__main__":
    # Run the Flask development server with debug mode enabled for rapid iteration.
    app.run(debug=True)
