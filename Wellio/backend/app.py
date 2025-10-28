from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from utils.gemini import get_ai_reply
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/api/ai/text", methods=["POST"])
def chat_with_ai():
    try:
        data = request.get_json()
        query = data.get("query", "").strip()

        if not query:
            return jsonify({"reply": "Please type something for me to respond to."}), 400

        print(f"🧠 User asked: {query}")

        ai_response = get_ai_reply(query)

        if not ai_response:
            return jsonify({"reply": "AI did not return any response."}), 500

        print(f"✨ AI replied: {ai_response[:120]}...")
        return jsonify({"reply": ai_response})

    except Exception as e:
        print("❌ Backend error:", e)
        return jsonify({"reply": f"Server error: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
