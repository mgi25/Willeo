import { useState, useRef, useEffect } from "react";
import { askAssistant } from "./api";
import { motion, AnimatePresence } from "framer-motion";
import * as Tone from "tone";
import Orb from "./components/Orb";

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const Mic = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
    <path d="M19 10a7 7 0 0 1-14 0" />
    <path d="M12 19v3" />
    <path d="M8 22h8" />
  </svg>
);

const Send = (props) => (
  <svg {...iconProps} {...props}>
    <path d="m22 2-9.5 9.5" />
    <path d="m22 2-7 20-4-9-9-4Z" />
  </svg>
);

const Bot = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M12 4V2" />
    <path d="M8 2h8" />
    <rect width="16" height="12" x="4" y="6" rx="2" />
    <path d="M2 14h20" />
    <circle cx="9" cy="10" r="1.25" />
    <circle cx="15" cy="10" r="1.25" />
  </svg>
);

const initialMessage = {
  id: "intro",
  sender: "ai",
  text: "Hello, I'm Wellio — your voice companion. How are you feeling today?",
};

export default function VoiceAssistant() {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const createMessage = (sender, text) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    text,
  });

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

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript);
    };

    recognition.start();
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  async function playResponseTone() {
    const synth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.4, decay: 0.2, sustain: 0.4, release: 1.2 },
    }).toDestination();

    await Tone.start();
    synth.triggerAttackRelease("C4", "8n");
  }

  async function sendMessage(content) {
    const trimmed = content.trim();
    if (!trimmed) return;

    const userMessage = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await askAssistant(trimmed);
      const reply = res.answer?.trim() || "I'm here, tell me more.";
      const aiMessage = createMessage("ai", reply);
      setMessages((prev) => [...prev, aiMessage]);
      setIsSpeaking(true);
      await playResponseTone();
      speak(reply);
      if (!("speechSynthesis" in window)) {
        setTimeout(() => setIsSpeaking(false), 2000);
      }
    } catch (error) {
      console.error(error);
      const fallback = createMessage("ai", "Sorry, I didn’t quite catch that.");
      setMessages((prev) => [...prev, fallback]);
      setIsSpeaking(false);
    } finally {
      setLoading(false);
    }
  }

  const statusText = isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Here with you";

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="bg-particles" />
      <div className="relative z-10 min-h-screen">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-primary/20 blur-[140px]" />
          <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-purple-500/10 blur-[160px]" />
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-8">
          <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4 text-slate-100">
              <div className="rounded-2xl bg-white/10 p-3">
                <Bot className="h-6 w-6 text-indigo-300" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/70">Wellio Voice Chat v3.0</p>
                <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Your cinematic AI companion</h1>
                <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
                  Share what&apos;s on your mind and Wellio will listen, respond, and speak back with warmth and clarity.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-2">
              <Orb isListening={isListening} isSpeaking={isSpeaking} />
              <p className="text-xs text-slate-400 tracking-wide">{statusText}</p>
            </div>
          </header>

          <section className="mt-6 flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl">
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
              <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`relative max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-glow sm:text-base ${
                          msg.sender === "user"
                            ? "bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-sky-500 text-white"
                            : "bg-white/10 text-slate-100 backdrop-blur-xl"
                        }`}
                      >
                        {msg.sender === "ai" && (
                          <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-indigo-200/70">
                            <span className="inline-flex h-2 w-2 rounded-full bg-indigo-300" />
                            Wellio
                          </span>
                        )}
                        <span>{msg.text}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {loading && (
                    <motion.div
                      key="typing-indicator"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 text-indigo-100/80"
                    >
                      <div className="flex h-9 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-xl">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="h-2 w-2 rounded-full bg-indigo-200"
                            animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                          />
                        ))}
                      </div>
                      <span className="text-sm uppercase tracking-[0.3em] text-indigo-200/70">Responding</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="border-t border-white/10 bg-white/5/60 px-4 py-4 backdrop-blur-xl sm:px-8">
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
                <motion.button
                  type="button"
                  onClick={startListening}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  animate={
                    isListening
                      ? {
                          boxShadow: [
                            "0 0 0 rgba(99,102,241,0.4)",
                            "0 0 36px rgba(129,140,248,0.75)",
                            "0 0 0 rgba(99,102,241,0.4)",
                          ],
                          scale: [1, 1.12, 1],
                        }
                      : { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" }
                  }
                  transition={{ duration: isListening ? 1.4 : 0.3, repeat: isListening ? Infinity : 0, ease: "easeInOut" }}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/20 ${
                    isListening ? "border-indigo-300 text-indigo-100" : ""
                  }`}
                  aria-pressed={isListening}
                  title="Speak with Wellio"
                >
                  <Mic className="h-5 w-5" />
                </motion.button>

                <div className="flex w-full flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-xl focus-within:border-indigo-300 focus-within:bg-white/20">
                  <input
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none sm:text-base"
                    placeholder="Speak or type your message..."
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage(input);
                      }
                    }}
                    aria-label="Message Wellio"
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.05 }}
                    disabled={loading}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-sky-500 text-white shadow-glow transition focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
