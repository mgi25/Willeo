import { API_BASE } from "./config";

export async function getHealthData() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error("Failed to fetch health data");
  return await res.json();
}

export async function askAssistant(query) {
  try {
    const response = await fetch(`${API_BASE}/api/ai/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply || "No response received from AI.";
  } catch (err) {
    console.error("Error contacting Wellio backend:", err);
    return "Sorry, I’m having trouble connecting to my AI core.";
  }
}
