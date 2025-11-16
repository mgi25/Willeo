// src/components/AnimatedGrid.jsx
import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedGrid({
  active = false,
  fast = false,
  cell = 28,
  line = "rgba(255,255,255,0.06)",
  lineStrong = "rgba(124,205,255,0.12)",
}) {
  const prefersReducedMotion = useReducedMotion();
  const size = `${cell}px ${cell}px`;

  const baseBG =
    `linear-gradient(to right, ${line} 1px, transparent 1px),
     linear-gradient(to bottom, ${line} 1px, transparent 1px)`;

  const animBG =
    `linear-gradient(to right, ${lineStrong} 1px, transparent 1px),
     linear-gradient(to bottom, ${lineStrong} 1px, transparent 1px)`;

  const drift = fast ? 10 : 16;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1, // above aurora, below Orb
        overflow: "hidden",
      }}
    >
      {/* Static grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: baseBG,
          backgroundSize: `${size}, ${size}`,
          backgroundPosition: "0 0, 0 0",
          opacity: 1,
        }}
      />

      {/* Animated grid drift */}
      {!prefersReducedMotion && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: animBG,
            backgroundSize: `${size}, ${size}`,
          }}
          animate={{
            backgroundPosition: active
              ? [`0px 0px, 0px 0px`, `${cell}px ${cell}px, ${cell}px ${cell}px`]
              : [`0px 0px, 0px 0px`, `0px 0px, 0px 0px`],
            opacity: active ? 0.9 : 0.35,
            scale: active ? 1.002 : 1.0,
          }}
          transition={{ duration: drift, ease: "linear", repeat: Infinity }}
        />
      )}

      {/* Soft scanning sweep */}
      {!prefersReducedMotion && (
        <motion.div
          style={{
            position: "absolute",
            inset: "-20% 0 -20% 0",
            background:
              "linear-gradient(180deg, transparent 0%, rgba(127,90,240,0.10) 50%, transparent 100%)",
            mixBlendMode: "screen",
          }}
          animate={{
            backgroundPosition: ["0% -200%", "0% 200%"],
            opacity: active ? 0.55 : 0.25,
          }}
          transition={{ duration: fast ? 2.6 : 3.6, ease: "linear", repeat: Infinity }}
        />
      )}
    </div>
  );
}
