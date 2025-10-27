import { API_BASE } from "./config";

export async function getHealthData() {
  const res = await fetch(`${API_BASE}/api/health`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch health data");
  }

  return await res.json();
}

export async function askAssistant(text) {
  const res = await fetch(`${API_BASE}/api/ai/text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: text }),
  });

  if (!res.ok) {
    throw new Error("AI request failed");
  }

  return await res.json();
}
