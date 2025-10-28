from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins="*")  # allow frontend access

# ---- Mock Gemini Logic ----
def gemini_respond(query: str):
    if not query:
        return "Please provide a question."
    return f"AI analysis: Based on your input '{query}', your vitals look stable and healthy!"

# ---- Default Root ----
@app.route("/")
def home():
    return "✅ Wellio backend is running. Try /api/health or /api/ai/text."

# ---- Health Endpoint ----
@app.route("/api/health", methods=["GET"])
def get_health():
    data = {
        "heart_rate": 74,
        "sleep_hours": 7.1,
        "steps": 8200,
        "stress_level": 3
    }
    return jsonify(data)

# ---- AI Text Endpoint ----
@app.route("/api/ai/text", methods=["GET", "POST"])
def ai_text():
    if request.method == "GET":
        return jsonify({
            "message": "Use POST with JSON body {'query': '<your text>'} to get AI response."
        })
    
    body = request.get_json(silent=True) or {}
    query = body.get("query", "")
    if not query:
        return jsonify({"error": "Missing 'query' field"}), 400

    response = gemini_respond(query)
    return jsonify({"answer": response})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
