import google.generativeai as genai
import os

# Load API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("⚠️ GEMINI_API_KEY not found in environment!")

# Configure Gemini
genai.configure(api_key=api_key)

def get_ai_reply(prompt: str):
    """Generate a conversational reply from Gemini-Pro."""
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(prompt)

        # Return text safely
        if hasattr(response, "text") and response.text:
            return response.text.strip()
        elif response and hasattr(response, "candidates"):
            # Sometimes response.text is missing, fallback to first candidate
            return response.candidates[0].content.parts[0].text
        else:
            return "Hmm, I didn’t quite get that. Could you repeat?"

    except Exception as e:
        print("🚨 Gemini API error:", e)
        return None
