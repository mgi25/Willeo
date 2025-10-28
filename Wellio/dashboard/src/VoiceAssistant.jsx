import { useState, useRef, useEffect } from "react";
import { askAssistant } from "./api";

export default function VoiceAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello, I'm Wellio — your personal voice assistant. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function startListening() {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage(content) {
    if (!content.trim()) return;
    setMessages((m) => [...m, { sender: "user", text: content }]);
    setInput("");
    setLoading(true);

    try {
      const res = await askAssistant(content);
      const aiReply = res.answer || "I'm here, but something went wrong.";
      setMessages((m) => [...m, { sender: "ai", text: aiReply }]);
      speak(aiReply);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { sender: "ai", text: "Sorry, I had trouble processing that." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0f172a",
        color: "#fff",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <header
        style={{
          padding: "1rem",
          fontSize: "1.25rem",
          fontWeight: 600,
          borderBottom: "1px solid #1e293b",
        }}
      >
        🎙️ Wellio Voice Chat
      </header>

      <main style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                background: msg.sender === "user" ? "#4f46e5" : "#1e2537",
                color: "#fff",
                padding: "0.75rem 1rem",
                borderRadius: "1rem",
                maxWidth: "75%",
                whiteSpace: "pre-wrap",
                lineHeight: 1.4,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: "left", color: "#94a3b8", fontStyle: "italic" }}>
            Wellio is thinking...
          </div>
        )}
        <div ref={chatEndRef}></div>
      </main>

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          borderTop: "1px solid #1e293b",
          padding: "0.75rem",
          background: "#1e2537",
        }}
      >
        <button
          onClick={startListening}
          style={{
            background: listening ? "#22c55e" : "#4f46e5",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            cursor: "pointer",
          }}
          title="Start voice input"
        >
          🎤
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or speak your question..."
          style={{
            flex: 1,
            borderRadius: "1rem",
            border: "1px solid #334155",
            padding: "0.5rem 1rem",
            background: "#0f172a",
            color: "#fff",
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading}
          style={{
            background: "#4f46e5",
            color: "#fff",
            borderRadius: "0.75rem",
            padding: "0.5rem 0.75rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "..." : "Send"}
        </button>
      </footer>
    </div>
  );
}
