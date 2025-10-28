"""Utilities for loading environment configuration for the backend."""

from pathlib import Path
import os

from dotenv import load_dotenv


def load_environment():
    """Load the project's ``.env`` file and preconfigure libraries.

    Transformers is instructed to skip TensorFlow/Keras so that we do not
    require the unsupported ``keras==3`` stack when running lightweight
    sentiment analysis pipelines.  The settings are idempotent and safe to run
    multiple times.
    """

    os.environ.setdefault("TRANSFORMERS_NO_TF", "1")
    os.environ.setdefault("KERAS_BACKEND", "torch")

    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
    return env_path
