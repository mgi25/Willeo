import { useEffect, useState } from "react";
import { getHealthData, askAssistant } from "./api";

export default function Dashboard() {
  const [vitals, setVitals] = useState(null);
  const [loadingVitals, setLoadingVitals] = useState(true);
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // Fetch health data
  useEffect(() => {
    async function load() {
      try {
        const data = await getHealthData();
        setVitals(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingVitals(false);
      }
    }
    load();
  }, []);

  // Ask AI
  async function handleAsk() {
    setLoadingAI(true);
    try {
      const data = await askAssistant(question);
      setReply(data.answer);
    } catch (err) {
      console.error(err);
      setReply("Error talking to AI.");
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        padding: "1rem",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Wellio Dashboard</h1>

      {/* Vitals */}
      <section
        style={{
          background: "#1e2537",
          borderRadius: "1rem",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", color: "#a5b4fc" }}>Your Vitals</h2>
        {loadingVitals ? (
          <p>Loading vitals...</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
              gap: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            <Card label="Heart Rate" value={vitals?.heart_rate} unit="bpm" />
            <Card label="Sleep" value={vitals?.sleep_hours} unit="hrs" />
            <Card label="Steps" value={vitals?.steps} unit="steps" />
            <Card label="Stress" value={vitals?.stress_level} unit="/10" />
          </div>
        )}
      </section>

      {/* Ask AI */}
      <section
        style={{
          background: "#1e2537",
          borderRadius: "1rem",
          padding: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", color: "#a5b4fc" }}>Ask Wellio</h2>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. How was my sleep this week?"
            style={{
              flex: 1,
              background: "#0f172a",
              color: "#fff",
              borderRadius: "0.5rem",
              border: "1px solid #475569",
              padding: "0.5rem",
            }}
          />
          <button
            onClick={handleAsk}
            disabled={loadingAI}
            style={{
              background: "#4f46e5",
              color: "#fff",
              borderRadius: "0.5rem",
              border: "none",
              padding: "0.5rem 0.75rem",
              cursor: "pointer",
            }}
          >
            {loadingAI ? "..." : "Ask"}
          </button>
        </div>
        <div
          style={{
            marginTop: "0.75rem",
            background: "#0f172a",
            borderRadius: "0.5rem",
            border: "1px solid #475569",
            padding: "0.75rem",
          }}
        >
          {reply || "AI reply will appear here"}
        </div>
      </section>
    </div>
  );
}

function Card({ label, value, unit }) {
  return (
    <div
      style={{
        background: "#0f172a",
        borderRadius: "0.75rem",
        padding: "0.75rem",
        border: "1px solid #475569",
      }}
    >
      <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{label}</div>
      <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
        {value ?? "--"}{" "}
        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{unit}</span>
      </div>
    </div>
  );
}
