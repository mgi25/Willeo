from flask import Flask, jsonify, request
from flask_cors import CORS

from utils.env_loader import load_environment
load_environment()

from utils.emotion import analyze_user_text
from utils.gemini import get_ai_reply
from utils.memory import get_recent_context, record_mood, save_chat

app = Flask(__name__)
CORS(app)

@app.route("/api/ai/text", methods=["POST"])
def chat_with_ai():
    try:
        data = request.get_json()
        user_id = data.get("user_id", "demo_user")
        user_text = data.get("query", "").strip()

        if not user_text:
            return jsonify({"reply": "Please share what’s on your mind."}), 400

        # 1. analyze mood (local model, offline)
        mood_hint = analyze_user_text(user_text)

        # 2. pull memory from Mongo to keep continuity
        context = get_recent_context(user_id)

        # 3. generate empathetic reply from Gemini
        ai_text = get_ai_reply(user_text, mood_hint, context)

        # 4. store this in Mongo
        save_chat(user_id, user_text, ai_text, mood_hint)
        record_mood(user_id, mood_hint)

        # 5. return to frontend
        return jsonify({"reply": ai_text})

    except Exception as e:
        print("Error:", e)
        return jsonify({"reply": "Sorry, I’m having trouble right now."}), 500


if __name__ == "__main__":
    app.run(debug=True)
