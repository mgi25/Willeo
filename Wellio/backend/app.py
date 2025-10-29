import threading

from flask import Flask, jsonify, request
from flask_cors import CORS

from utils.env_loader import load_environment
load_environment()

from utils.emotion import analyze_user_text
from utils.gemini import get_ai_reply
from utils.memory import get_recent_context, record_mood, save_chat
from utils.voice import synthesize_speech

app = Flask(__name__)
CORS(app)


def async_task(fn, *args, **kwargs):
    """Run a lightweight function in the background."""

    threading.Thread(target=fn, args=args, kwargs=kwargs, daemon=True).start()


@app.route("/api/ai/text", methods=["POST"])
def chat_with_ai():
    try:
        data = request.get_json()
        user_id = data.get("user_id", "demo_user")
        user_text = data.get("query", "").strip()

        if not user_text:
            return jsonify({"reply": "Please share what’s on your mind."}), 400

        # 1. analyze mood (local model + optional AWS, with caching)
        if getattr(app, "_last_text", None) == user_text:
            mood_hint = getattr(app, "_last_mood", None)
        else:
            mood_hint = analyze_user_text(user_text)
            app._last_text = user_text
            app._last_mood = mood_hint

        # 2. pull memory from Mongo to keep continuity
        context = get_recent_context(user_id)

        # 3. generate empathetic reply from Gemini
        ai_text = get_ai_reply(user_text, mood_hint, context)

        # 4. store this in Mongo
        async_task(save_chat, user_id, user_text, ai_text, mood_hint)
        async_task(record_mood, user_id, mood_hint)

        # 5. synthesize speech with AWS Polly if configured
        voice_path = None
        try:
            voice_path = synthesize_speech(ai_text) if ai_text else None
        except Exception as voice_error:
            # Log but do not fail the user flow if Polly is unavailable
            print("[Polly Error]", voice_error)

        # 6. return to frontend
        payload = {"reply": ai_text}
        if voice_path:
            payload["voice"] = voice_path

        return jsonify(payload)

    except Exception as e:
        print("Error:", e)
        return jsonify({"reply": "Sorry, I’m having trouble right now."}), 500


if __name__ == "__main__":
    app.run(debug=True)
