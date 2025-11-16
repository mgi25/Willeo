// src/VoiceAssistant.jsx
import Orb from "./components/Orb";
import AnimatedGrid from "./components/AnimatedGrid";
import { useState, useRef, useEffect } from "react";
import { askAssistant } from "./api";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import heartbeat from "./assets/heartbeat.gif";

/* ----------------------- Icons ----------------------- */
const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const Mic = (p) => (
  <svg {...iconProps} {...p}>
    <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
    <path d="M19 10a7 7 0 0 1-14 0" />
    <path d="M12 19v3" />
    <path d="M8 22h8" />
  </svg>
);

const Send = (p) => (
  <svg {...iconProps} {...p}>
    <path d="m22 2-9.5 9.5" />
    <path d="m22 2-7 20-4-9-9-4Z" />
  </svg>
);

/* ---------------- Initial message ---------------- */
const initialMessage = {
  id: "intro",
  sender: "ai",
  text: "Hey — I’m Wellio. Tell me anything and I’ll help.",
};

/* ---------------- Header (Home + heartbeat) ---------------- */
function Header({ onHome, palette, statusText }) {
  const goHome =
    typeof onHome === "function" ? onHome : () => (window.location.href = "/");

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background:
          "linear-gradient(180deg, rgba(8,12,18,0.86) 0%, rgba(8,12,18,0.52) 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
      }}
    >
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 90, damping: 18 }}
        style={{
          height: 3,
          width: "100%",
          background:
            "linear-gradient(90deg, #7F5AF0 0%, #00D4FF 35%, #2CB67D 70%, #7F5AF0 100%)",
        }}
      />

      <div
        style={{
          height: 64,
          display: "grid",
          gridTemplateColumns: "200px 1fr auto",
          alignItems: "center",
          padding: "0 18px",
          gap: 12,
        }}
      >
        <button
          onClick={goHome}
          aria-label="Home"
          style={{
            fontWeight: 900,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            color: "#E6F1FF",
          }}
        >
          WELLIO
        </button>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={goHome}
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "linear-gradient(135deg, rgba(44,182,125,.55), rgba(127,90,240,.55))",
              color: palette.text,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Home
          </button>

          {/* small live status badge */}
          <div
            title={statusText}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,.04)",
              color: palette.sub,
              fontSize: 12,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  statusText === "Online"
                    ? palette.g3
                    : statusText === "Listening"
                    ? palette.g2
                    : palette.g1,
                boxShadow:
                  statusText === "Online"
                    ? "0 0 10px rgba(44,182,125,.7)"
                    : "0 0 10px rgba(127,90,240,.7)",
              }}
            />
            {statusText}
          </div>
        </div>

        <div
          aria-hidden
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            minWidth: 160,
          }}
        >
          <img
            src={heartbeat}
            alt=""
            style={{
              height: 34,
              width: "auto",
              opacity: 0.95,
              filter: "drop-shadow(0 0 14px rgba(163,230,255,0.35))",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </header>
  );
}

/* ---------------- Voice Assistant ---------------- */
export default function VoiceAssistant({ onHome }) {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // palette
  const P = {
    bg: "#0B0D13",
    panel: "#0F131A",
    panelAlt: "#0D1118",
    card: "rgba(255,255,255,0.045)",
    border: "rgba(255,255,255,0.10)",
    text: "#E6F1FF",
    sub: "#A9B8D0",
    g1: "#7F5AF0",
    g2: "#00D4FF",
    g3: "#2CB67D",
  };

  // keyboard shortcuts: '/' focus, 'm' mic, 'Esc' cancel TTS/ASR
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key.toLowerCase() === "m" && !e.repeat) {
        e.preventDefault();
        startListening();
      } else if (e.key === "Escape") {
        stopAllAudio();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // auto-scroll
  useEffect(
    () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages, loading]
  );

  // cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      stopAllAudio();
    };
  }, []);

  const stopAllAudio = () => {
    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch {}
    try {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    } catch {}
    setIsListening(false);
    setIsSpeaking(false);
  };

  const createMessage = (sender, text) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    text,
    at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });

  // voice
  function startListening() {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    try {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (e) => sendMessage(e.results[0][0].transcript);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.pitch = 1;
    u.rate = 1;
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  async function playResponseTone() {
    const synth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.3, decay: 0.15, sustain: 0.4, release: 1.1 },
    }).toDestination();
    await Tone.start();
    synth.triggerAttackRelease("C4", "8n");
  }

  // chat
  async function sendMessage(content) {
    const text = content.trim();
    if (!text) return;
    const userMsg = createMessage("user", text);
    const thinking = createMessage("ai", "…");
    setMessages((p) => [...p, userMsg, thinking]);
    setInput("");
    setShowPrompts(false);
    setLoading(true);

    try {
      const aiResponse = await askAssistant(text);
      const reply = (aiResponse || "").trim() || "I’m here and listening.";
      setMessages((p) =>
        p.map((m) => (m.id === thinking.id ? { ...m, text: reply } : m))
      );
      setIsSpeaking(true);
      await playResponseTone();
      speak(reply);
    } catch {
      setMessages((p) =>
        p.map((m) =>
          m.id === thinking.id
            ? { ...m, text: "⚠️ Connection issue. Try again." }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  const statusText = isListening ? "Listening" : isSpeaking ? "Speaking" : "Online";
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };
  const goHome = () => {
    if (typeof onHome === "function") onHome();
    else window.location.href = "/";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        color: P.text,
        backgroundImage:
          "radial-gradient(1200px 520px at -12% -24%, rgba(127,90,240,0.16), transparent), radial-gradient(900px 460px at 112% 112%, rgba(0,212,255,0.14), transparent)",
        backgroundColor: P.bg,
        fontFamily:
          "'Space Grotesk', Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      {/* global cosmetic tweaks */}
      <style>{`
        ::selection { background: rgba(0,212,255,.25); color: #E6F1FF; }
        ::-webkit-scrollbar { height: 10px; width: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 12px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,.04); }
      `}</style>

      <Header onHome={goHome} palette={P} statusText={statusText} />

      {/* Centered frame */}
      <div style={{ paddingTop: 76, paddingLeft: 18, paddingRight: 18, paddingBottom: 18 }}>
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.04fr) 1fr",
            gap: 16,
          }}
        >
          {/* LEFT: Chat panel */}
          <div
            style={{
              position: "relative",
              borderRadius: 18,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
              boxShadow:
                "0 10px 26px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
              border: `1px solid ${P.border}`,
              overflow: "hidden",
            }}
          >
            {/* top accent inside panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
              style={{
                height: 3,
                width: "100%",
                background:
                  "linear-gradient(90deg, #7F5AF0 0%, #00D4FF 35%, #2CB67D 70%, #7F5AF0 100%)",
              }}
            />

            <div style={{ padding: "22px 22px 16px" }}>
              {/* Title + status */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(22px,2.3vw,28px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.015em",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    background:
                      "linear-gradient(90deg,#E6F1FF,#A3E9FF 30%,#A7F3CE 60%,#E6F1FF)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Wellio — Chat
                </h1>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: `1px solid ${P.border}`,
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: statusText === "Online" ? P.g3 : P.g1,
                      boxShadow: `0 0 12px ${
                        statusText === "Online"
                          ? "rgba(44,182,125,.7)"
                          : "rgba(127,90,240,.7)"
                      }`,
                    }}
                  />
                  <span style={{ fontSize: 12, letterSpacing: "0.1em", color: P.sub }}>
                    {statusText}
                  </span>
                </div>
              </div>

              <p style={{ margin: "6px 0 8px", color: P.sub, fontSize: 14 }}>
                Minimal, expressive, fast. Type or use the mic — your pick.
              </p>

              {/* Quick prompts */}
              {showPrompts && messages.length <= 1 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 8,
                    marginBottom: 6,
                  }}
                >
                  {[
                    "How did I sleep last night?",
                    "Plan a 20-minute workout",
                    "Help me unwind in 5 mins",
                    "What should I eat post-run?",
                  ].map((t) => (
                    <motion.button
                      key={t}
                      onClick={() => sendMessage(t)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 999,
                        border: `1px solid ${P.border}`,
                        background:
                          "linear-gradient(120deg, rgba(127,90,240,.18), rgba(0,212,255,.18))",
                        color: P.text,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {t}
                    </motion.button>
                  ))}
                  <button
                    onClick={() => setShowPrompts(false)}
                    title="Hide"
                    style={{
                      marginLeft: 4,
                      padding: "8px 10px",
                      borderRadius: 999,
                      border: `1px solid ${P.border}`,
                      background: "rgba(255,255,255,.04)",
                      color: P.sub,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Hide
                  </button>
                </div>
              )}
            </div>

            {/* Messages area */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: "0 18px 14px 18px",
                height: "54vh",
                overflowY: "auto",
              }}
              aria-live="polite"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      style={{
                        alignSelf: isUser ? "flex-end" : "flex-start",
                        maxWidth: "76%",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          padding: "12px 14px",
                          borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: isUser
                            ? "linear-gradient(135deg, rgba(127,90,240,0.28), rgba(0,212,255,0.22))"
                            : "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.04))",
                          boxShadow: isUser
                            ? "0 12px 30px rgba(127,90,240,0.18)"
                            : "0 10px 24px rgba(0,0,0,0.28)",
                          color: P.text,
                          fontSize: 15,
                          lineHeight: 1.55,
                          backdropFilter: "blur(2px)",
                        }}
                      >
                        {msg.text}
                        <div
                          style={{
                            marginTop: 4,
                            color: P.sub,
                            fontSize: 11,
                            opacity: 0.7,
                          }}
                        >
                          {msg.at}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* typing indicator */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      color: P.sub,
                    }}
                  >
                    <motion.span
                      style={{
                        display: "inline-flex",
                        width: 64,
                        height: 28,
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.06)",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.i
                          key={i}
                          style={{
                            width: 6,
                            height: 6,
                            margin: "0 3px",
                            borderRadius: "50%",
                            background: i === 0 ? P.g1 : i === 1 ? P.g2 : P.g3,
                          }}
                          animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </motion.span>
                    <span style={{ fontSize: 13, letterSpacing: "0.08em" }}>
                      Thinking.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 12,
                margin: 12,
                borderRadius: 16,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.04))",
                border: `1px solid ${P.border}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <motion.div
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(120deg, rgba(127,90,240,.10), transparent 30%, rgba(0,212,255,.08) 60%, transparent)",
                  pointerEvents: "none",
                }}
              />
              <motion.button
                type="button"
                onClick={startListening}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.06 }}
                animate={
                  isListening
                    ? { boxShadow: "0 0 24px rgba(0,212,255,.45)", scale: [1, 1.06, 1] }
                    : { boxShadow: "0 0 0 rgba(0,0,0,0)" }
                }
                transition={{ duration: 1.2, repeat: isListening ? Infinity : 0 }}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(127,90,240,.35), rgba(0,212,255,.35))",
                  border: "1px solid rgba(255,255,255,.14)",
                  color: P.text,
                  borderRadius: 12,
                  width: 44,
                  height: 44,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
                title="Speak (M)"
                aria-label="Start voice input"
              >
                <Mic />
              </motion.button>

              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message…  (Press Enter to send, / to focus)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: P.text,
                  fontSize: 16,
                }}
              />

              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.06 }}
                disabled={loading}
                style={{
                  position: "relative",
                  border: "1px solid rgba(255,255,255,.14)",
                  background:
                    "linear-gradient(135deg, rgba(44,182,125,.42), rgba(127,90,240,.42))",
                  color: P.text,
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  overflow: "hidden",
                }}
                aria-label="Send message"
              >
                <Send />
                <motion.span
                  aria-hidden
                  initial={{ opacity: 0, scale: 0 }}
                  whileTap={{ opacity: 0.3, scale: 2.2 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #7F5AF0 0%, transparent 60%)",
                  }}
                />
              </motion.button>
            </form>
          </div>

          {/* RIGHT: Orb panel with aura and divider */}
          <div
            style={{
              position: "relative",
              borderRadius: 18,
              overflow: "hidden",
              border: `1px solid ${P.border}`,
              background: P.panelAlt,
              boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
              minHeight: "calc(78vh)",
              display: "grid",
              placeItems: "center",
              isolation: "isolate",
            }}
          >
            {/* vertical gradient divider on the left edge */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 2,
                background:
                  "linear-gradient(180deg, rgba(127,90,240,.5), rgba(0,212,255,.4), rgba(44,182,125,.5))",
                opacity: 0.5,
              }}
            />

            {/* soft moving aurora */}
            <motion.div
              aria-hidden
              animate={{ x: ["-10%", "10%", "-10%"] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: "-25% -15% -25% -15%",
                zIndex: 0,
                background:
                  "radial-gradient(60% 40% at 20% 20%, rgba(127,90,240,.20), transparent 70%), radial-gradient(50% 35% at 80% 80%, rgba(0,212,255,.16), transparent 70%)",
                filter: "blur(80px)",
              }}
            />

            {/* grid */}
            <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
              <AnimatedGrid active={isListening || isSpeaking} fast={isSpeaking} cell={28} />
            </div>

            {/* orb + tiny status */}
            <div style={{ zIndex: 2, transform: "translateY(-6px)" }}>
              <Orb
                isListening={isListening}
                isSpeaking={isSpeaking}
                audioReactive
                size={"clamp(260px, 32vw, 420px)"}
                mode="inline"
              />
              <div
                style={{
                  marginTop: 12,
                  textAlign: "center",
                  fontSize: 12,
                  color: P.sub,
                  letterSpacing: "0.08em",
                }}
              >
                {statusText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
