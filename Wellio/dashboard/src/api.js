import { API_BASE } from "./config";

export async function getHealthData() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error("Failed to fetch health data");
  return await res.json();
}

export async function askAssistant(query) {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/ai/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return data.reply || "No response received from AI.";
  } catch (error) {
    console.error("Error contacting backend:", error);
    return "There was an issue connecting to Wellio’s AI brain.";
  }
}
