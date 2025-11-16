// src/components/Orb.jsx
import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Minimal Gradient Orb with Visible Blinking
 * - Blank oval eyes (no pupils/iris)
 * - True blink (ry animated)
 * - Subtle eye tracking
 * - Speaking: gentle bobble/squint via group animation (no mouth)
 * - Thinking: two eyes orbit the rim as a loader
 */

export default function Orb({
  isListening = false,
  isSpeaking = false,
  isThinking = false,
  size = 320,
  className,
  style,
}) {
  const rMotion = useReducedMotion();
  const resolved = typeof size === "string" ? size : `${size}px`;

  return (
    <div
      className={className}
      style={{ position: "relative", width: resolved, height: resolved, ...style }}
    >
      {/* Outer ambient glow */}
      {!rMotion && (
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: "-30px",
            borderRadius: "50%",
            filter: "blur(40px)",
            background: isThinking
              ? "radial-gradient(circle, rgba(138,43,226,.25), transparent 70%)"
              : isSpeaking
              ? "radial-gradient(circle, rgba(99,102,241,.28), transparent 70%)"
              : isListening
              ? "radial-gradient(circle, rgba(59,130,246,.22), transparent 70%)"
              : "radial-gradient(circle, rgba(99,102,241,.18), transparent 70%)",
            pointerEvents: "none",
          }}
          animate={{
            opacity: isThinking ? [0.4, 0.7, 0.4] : isSpeaking ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
            scale: isThinking ? [1, 1.1, 1] : isSpeaking ? [1, 1.08, 1] : [1, 1.05, 1],
          }}
          transition={{ duration: isThinking ? 1.8 : isSpeaking ? 1.2 : 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Pulse rings */}
      {!rMotion && (isSpeaking || isListening || isThinking) && (
        <>
          <PulseRing delay={0} size={resolved} active={isSpeaking || isThinking} />
          <PulseRing delay={0.5} size={resolved} active={isSpeaking || isThinking} />
        </>
      )}

      <svg
        width={resolved}
        height={resolved}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{
          display: "block",
          borderRadius: "50%",
          overflow: "visible",
          boxShadow: "0 22px 60px rgba(0,0,0,.45), inset 0 2px 10px rgba(255,255,255,.06)",
        }}
      >
        <defs>
          <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06060C" />
            <stop offset="45%" stopColor="#0F1030" />
            <stop offset="100%" stopColor="#4338F2" />
          </linearGradient>
          <radialGradient id="vignette" cx="50%" cy="50%" r="65%">
            <stop offset="65%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,.18)" />
          </radialGradient>
          <clipPath id="clipCircle">
            <circle cx="50" cy="50" r="49" />
          </clipPath>
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Body */}
        <g clipPath="url(#clipCircle)">
          <circle cx="50" cy="50" r="49" fill="url(#orbGrad)" />
          {!rMotion && (
            <motion.circle
              cx="50"
              cy="50"
              r="49"
              fill="url(#shimmer)"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <circle cx="50" cy="50" r="49" fill="url(#vignette)" />

          {/* Note: some browsers ignore CSS gradients on SVG fill; if yours is fine, keep it. */}
          {!rMotion && (
            <motion.circle
              cx="50"
              cy="50"
              r="49"
              fill="radial-gradient(circle at 30% 30%, rgba(67,56,242,.08), transparent 60%)"
              animate={{ cx: [45, 55, 45], cy: [45, 55, 45] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </g>

        {/* Rim pulse */}
        <motion.circle
          cx="50"
          cy="50"
          r="49"
          fill="none"
          stroke="rgba(255,255,255,.10)"
          strokeWidth="0.7"
          animate={
            !rMotion
              ? {
                  strokeWidth: isThinking ? [0.7, 1.2, 0.7] : [0.7, 0.9, 0.7],
                  opacity: isThinking ? [0.1, 0.3, 0.1] : [0.1, 0.15, 0.1],
                }
              : {}
          }
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Face */}
        {isThinking ? <EyesSpinnerOrbit /> : <Eyes isListening={isListening} isSpeaking={isSpeaking} />}

        {/* Ambient particles */}
        {!rMotion && <AmbientParticles isActive={isSpeaking || isListening || isThinking} />}
      </svg>

      {/* Breathing glow */}
      {!rMotion && (
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            filter: "blur(60px)",
            mixBlendMode: "screen",
            background: "radial-gradient(40% 40% at 70% 70%, rgba(99,102,241,.28), transparent 60%)",
            pointerEvents: "none",
          }}
          animate={{ opacity: isSpeaking ? [0.5, 0.75, 0.5] : [0.35, 0.55, 0.35], scale: isSpeaking ? [1, 1.05, 1] : [1, 1.03, 1] }}
          transition={{ duration: isSpeaking ? 1.5 : 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Specular sweep */}
      {!rMotion && (
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,.12) 50%, transparent 70%)",
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}

/* ---------- Pulse Rings ---------- */
function PulseRing({ delay, size, active }) {
  return (
    <motion.div
      aria-hidden
      style={{
        position: "absolute",
        inset: "-20px",
        borderRadius: "50%",
        border: "2px solid rgba(99,102,241,.4)",
        pointerEvents: "none",
      }}
      initial={{ scale: 1, opacity: 0 }}
      animate={{ scale: [1, 1.3, 1.5], opacity: [0, 0.6, 0] }}
      transition={{ duration: active ? 2 : 3, repeat: Infinity, ease: "easeOut", delay }}
    />
  );
}

/* ---------- Particles ---------- */
function AmbientParticles({ isActive }) {
  const particles = Array.from({ length: 8 }, (_, i) => i);
  return (
    <g opacity={isActive ? 0.4 : 0.2}>
      {particles.map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 38;
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="0.8"
            fill="rgba(255,255,255,.6)"
            initial={{ opacity: 0.3, scale: 0.8 }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.3, 0.8],
              cx: [x, x + Math.cos(angle) * 3, x],
              cy: [y, y + Math.sin(angle) * 3, y],
            }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: (i % 4) * 0.3 }}
          />
        );
      })}
    </g>
  );
}

/* ---------- Eyes (blink + tracking + speaking bobble) ---------- */
function Eyes({ isListening, isSpeaking }) {
  const gap = 34;
  const cxL = 50 - gap / 2;
  const cxR = 50 + gap / 2;
  const cy = 50;

  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const getRange = () => (isSpeaking ? { x: 2.5, y: 2, ms: 600 } : isListening ? { x: 1.5, y: 1.2, ms: 1800 } : { x: 3, y: 2.5, ms: 2500 });
    const { x, y, ms } = getRange();
    const move = () => setLookOffset({ x: (Math.random() - 0.5) * 2 * x, y: (Math.random() - 0.5) * 2 * y });
    move();
    const id = setInterval(move, ms);
    return () => clearInterval(id);
  }, [isSpeaking, isListening]);

  return (
    // Speaking bobble (subtle nod & squint rhythm)
    <motion.g
      animate={
        isSpeaking
          ? { scaleY: [1, 0.95, 1.02, 1], rotate: [0, -0.6, 0.6, 0] }
          : isListening
          ? { scaleY: [1, 1.03, 1], rotate: 0 }
          : {}
      }
      transition={{ duration: isSpeaking ? 0.9 : 1.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.g animate={{ x: lookOffset.x, y: lookOffset.y }} transition={{ duration: 0.8, ease: "easeInOut" }}>
        <BlinkingEye cx={cxL} cy={cy} delay={0} isListening={isListening} isSpeaking={isSpeaking} />
        <BlinkingEye cx={cxR} cy={cy} delay={0.06} isListening={isListening} isSpeaking={isSpeaking} />
      </motion.g>
    </motion.g>
  );
}

/* ---------- Single Eye with true blink ---------- */
function BlinkingEye({ cx, cy, delay = 0, isListening }) {
  const [ry, setRy] = useState(11);
  const rMotion = useReducedMotion();
  const baseRx = 8;
  const baseRy = 11;

  useEffect(() => {
    if (rMotion) return;
    let mounted = true;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const blinkOnce = async () => {
      setRy(0.8);
      await sleep(60);
      if (mounted) setRy(baseRy);
    };

    const loop = async () => {
      if (delay) await sleep(delay * 1000);
      while (mounted) {
        const base = 2000;
        const jitter = Math.random() * 1500;
        await sleep(base + jitter);
        if (!mounted) break;
        await blinkOnce();
        if (Math.random() < 0.3 && mounted) {
          await sleep(150);
          await blinkOnce();
        }
      }
    };

    loop();
    return () => {
      mounted = false;
    };
  }, [rMotion, delay]);

  const listenScale = isListening ? 1.05 : 1.0;

  return (
    <motion.ellipse
      cx={cx}
      cy={cy}
      rx={baseRx}
      // Animate ry explicitly so the blink is interpolated (open→close→open)
      animate={{ ry, scaleX: listenScale, scaleY: listenScale }}
      fill="#FFFFFF"
      style={{ transformOrigin: `${cx}px ${cy}px` }}
      transition={{
        ry: { duration: 0.09, ease: "easeInOut" },
        scaleX: { duration: 0.25 },
        scaleY: { duration: 0.25 },
      }}
    />
  );
}

/* ---------- Thinking: orbital eyes ---------- */
function EyesSpinnerOrbit() {
  const R = 36;
  const eyeRx = 8;
  const eyeRy = 11;

  return (
    <g>
      <motion.circle
        cx="50"
        cy="50"
        r={R}
        fill="none"
        stroke="rgba(255,255,255,.08)"
        strokeWidth="0.5"
        strokeDasharray="4 4"
        initial={{ rotate: 0 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      />
      <motion.circle
        cx="50"
        cy="50"
        r={R - 5}
        fill="none"
        stroke="rgba(138,43,226,.12)"
        strokeWidth="0.3"
        strokeDasharray="2 6"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      <motion.g initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "50px 50px" }}>
        <motion.ellipse
          cx={50 + R}
          cy={50}
          rx={eyeRx + 3}
          ry={eyeRy + 3}
          fill="rgba(138,43,226,.25)"
          animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${50 + R}px 50px` }}
        />
        <ellipse cx={50 + R} cy={50} rx={eyeRx} ry={eyeRy} fill="#FFFFFF" />

        <motion.ellipse
          cx={50 - R}
          cy={50}
          rx={eyeRx + 3}
          ry={eyeRy + 3}
          fill="rgba(138,43,226,.25)"
          animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          style={{ transformOrigin: `${50 - R}px 50px` }}
        />
        <ellipse cx={50 - R} cy={50} rx={eyeRx} ry={eyeRy} fill="#FFFFFF" />
      </motion.g>

      <motion.circle cx="50" cy="50" r="5" fill="rgba(138,43,226,.15)" animate={{ scale: [1, 1.6, 1], opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} />
      <motion.circle cx="50" cy="50" r="3" fill="rgba(255,255,255,.7)" animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} />
      {[0, 1, 2].map((i) => (
        <motion.circle key={`wave-${i}`} cx="50" cy="50" r="0" fill="none" stroke="rgba(138,43,226,.3)" strokeWidth="1" animate={{ r: [0, R + 10], opacity: [0.3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: i * 0.7 }} />
      ))}
    </g>
  );
}
