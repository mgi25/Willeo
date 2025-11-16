// =============================
// Wellio Dashboard — Home Page
// Modern AI ChatGPT-style Layout
// =============================

import React from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f172a, #1e2537)",
        padding: "4rem 6rem",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#fff",
      }}
    >
      {/* ---------------- LEFT SECTION ---------------- */}
      <div style={{ flex: 1 }}>
        <h1
          style={{
            fontSize: "2.8rem",
            fontWeight: "600",
            marginBottom: "1rem",
            color: "#a5b4fc",
          }}
        >
          Welcome back to Wellio
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#cbd5e1",
            maxWidth: "520px",
            lineHeight: "1.8",
          }}
        >
          Your AI companion is here to chat, assist, and evolve with you.  
          Start a conversation or explore insights with a single click.
        </p>

        {/* ---- Chat preview bubble ---- */}
        <div
          style={{
            marginTop: "3rem",
            background: "#1e2537",
            borderRadius: "1rem",
            padding: "1.5rem",
            width: "90%",
            maxWidth: "480px",
            boxShadow: "0 0 25px rgba(99,102,241,0.2)",
          }}
        >
          <div
            style={{
              background: "#334155",
              padding: "1rem 1.2rem",
              borderRadius: "0.75rem",
              maxWidth: "80%",
              marginBottom: "1rem",
            }}
          >
            <p>Hello, I’m Wellio — your voice companion. How are you feeling today?</p>
          </div>
          <div
            style={{
              background: "#6366f1",
              padding: "1rem 1.2rem",
              borderRadius: "0.75rem",
              maxWidth: "60%",
              marginLeft: "auto",
              color: "#fff",
            }}
          >
            <p>I’m feeling good! Let’s start something new.</p>
          </div>
        </div>

        {/* ---- Buttons ---- */}
        <div style={{ marginTop: "3rem", display: "flex", gap: "1rem" }}>
          <button
            style={{
              background: "#6366f1",
              color: "#fff",
              padding: "0.8rem 1.8rem",
              borderRadius: "0.6rem",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              boxShadow: "0 0 25px rgba(99,102,241,0.3)",
              transition: "transform 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
          >
            Start Chat
          </button>
          <button
            style={{
              background: "transparent",
              color: "#a5b4fc",
              padding: "0.8rem 1.8rem",
              borderRadius: "0.6rem",
              border: "1px solid #6366f1",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "transform 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
          >
            Learn More
          </button>
        </div>
      </div>

      {/* ---------------- RIGHT SECTION (AI Orb) ---------------- */}
      <motion.div
        style={{
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.7), rgba(147,51,234,0.6), rgba(236,72,153,0.5))",
          boxShadow:
            "0 0 60px rgba(99,102,241,0.4), 0 0 120px rgba(147,51,234,0.3), 0 0 160px rgba(236,72,153,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [1, 0.9, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          style={{
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #818cf8, #a855f7, #ec4899, #06b6d4)",
            filter: "blur(2px)",
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
    </div>
  );
}
