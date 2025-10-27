import { useEffect, useState } from "react";
import { getHealthData, askAssistant } from "./api";

export default function Dashboard() {
  const [vitals, setVitals] = useState(null);
  const [loadingVitals, setLoadingVitals] = useState(true);

  const [userQuestion, setUserQuestion] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // Load vitals on component mount
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

  // Send question to AI
  async function handleAsk() {
    setLoadingAI(true);
    try {
      const resp = await askAssistant(userQuestion);
      setAiReply(resp.answer || "(no answer field)");
    } catch (err) {
      console.error(err);
      setAiReply("Error talking to assistant");
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <div style={{
      padding: "1rem",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      color: "#fff",
      background: "#0f172a",
      minHeight: "100vh"
    }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
        Wellio Dashboard
      </h1>

      {/* HEALTH DATA SECTION */}
      <section style={{
        background: "#1e2537",
        borderRadius: "1rem",
        padding: "1rem",
        marginBottom: "1rem",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
      }}>
        <h2 style={{
          fontSize: "1rem",
          fontWeight: 500,
          marginBottom: "0.5rem",
          color: "#a5b4fc"
        }}>
          Your vitals
        </h2>

        {loadingVitals && <p>Loading vitals…</p>}

        {!loadingVitals && vitals && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
            gap: "0.75rem"
          }}>
            <Card label="Heart Rate"   value={vitals.heart_rate}   unit="bpm" />
            <Card label="Sleep"        value={vitals.sleep_hours}  unit="hrs" />
            <Card label="Steps"        value={vitals.steps}        unit="steps" />
            <Card label="Stress"       value={vitals.stress_level} unit="/10" />
          </div>
        )}

        {!loadingVitals && !vitals && (
          <p style={{ color: "#f87171" }}>Could not load vitals.</p>
        )}
      </section>

      {/* AI ASSISTANT SECTION */}
      <section style={{
        background: "#1e2537",
        borderRadius: "1rem",
        padding: "1rem",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
      }}>
        <h2 style={{
          fontSize: "1rem",
          fontWeight: 500,
          marginBottom: "0.5rem",
          color: "#a5b4fc"
        }}>
          Ask Wellio
        </h2>

        <div style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "0.75rem"
        }}>
          <input
            style={{
              flex: 1,
              background: "#0f172a",
              border: "1px solid #475569",
              borderRadius: "0.5rem",
              padding: "0.5rem",
              color: "#fff",
              outline: "none"
            }}
            placeholder="e.g. How was my sleep this week?"
            value={userQuestion}
            onChange={e => setUserQuestion(e.target.value)}
          />
          <button
            onClick={handleAsk}
            disabled={loadingAI}
            style={{
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.5rem 0.75rem",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            {loadingAI ? "..." : "Ask"}
          </button>
        </div>

        <div style={{
          background: "#0f172a",
          border: "1px solid #475569",
          borderRadius: "0.5rem",
          padding: "0.75rem",
          color: "#e2e8f0",
          minHeight: "3rem",
          fontSize: "0.9rem",
          lineHeight: 1.4
        }}>
          {aiReply || "AI reply will appear here"}
        </div>
      </section>
    </div>
  );
}

function Card({ label, value, unit }) {
  return (
    <div style={{
      background: "#0f172a",
      borderRadius: "0.75rem",
      padding: "0.75rem",
      border: "1px solid #475569",
      minHeight: "80px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }}>
      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{label}</span>
      <span style={{
        fontSize: "1.25rem",
        fontWeight: 600,
        color: "#fff"
      }}>
        {value ?? "--"}{" "}
        <span style={{
          fontSize: "0.8rem",
          color: "#64748b",
          fontWeight: 400
        }}>
          {unit}
        </span>
      </span>
    </div>
  );
}
