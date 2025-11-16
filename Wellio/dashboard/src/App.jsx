// src/App.jsx
import React, { useEffect, useMemo, useRef, useState, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import heartbeat from "./assets/heartbeat.gif";

// Lazy-chat route (your existing chat page)
const VoiceAssistant = lazy(() =>
  import("./VoiceAssistant.jsx").catch(() => ({
    default: () => (
      <div style={{ padding: 24, color: "#E6F1FF" }}>Chat component not found.</div>
    ),
  }))
);

// Theme
const P = {
  bg: "#0B0D13",
  panel: "#0F131A",
  panelAlt: "#0D1118",
  card: "rgba(255,255,255,.045)",
  border: "rgba(255,255,255,.12)",
  text: "#E6F1FF",
  sub: "#A9B8D0",
  g1: "#7F5AF0",
  g2: "#00D4FF",
  g3: "#2CB67D",
  warn: "#F59E0B",
  red: "#FF6B6B",
};

export default function App() {
  const [route, setRoute] = useState("home"); // 'home' | 'chat'
  if (route === "chat") {
    return (
      <div style={{ minHeight: "100vh", background: P.bg }}>
        <Suspense
          fallback={
            <div
              style={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                color: P.text,
                background:
                  "radial-gradient(50% 40% at 30% 20%, rgba(127,90,240,.18), transparent 70%), radial-gradient(50% 35% at 80% 80%, rgba(0,212,255,.14), transparent 70%), #0B0D13",
              }}
            >
              Loading chat…
            </div>
          }
        >
          <VoiceAssistant />
        </Suspense>
      </div>
    );
  }
  return <Home onStartChat={() => setRoute("chat")} />;
}

/* -------------------------------- HOME -------------------------------- */

function Home({ onStartChat }) {
  // Section refs for header tabs
  const heroRef = useRef(null);
  const snapshotRef = useRef(null);
  const featuresRef = useRef(null);
  const howRef = useRef(null);
  const statusRef = useRef(null);
  const faqRef = useRef(null);

  const sections = useMemo(
    () => [
      { id: "home", label: "Home", ref: heroRef },
      { id: "snapshot", label: "Snapshot", ref: snapshotRef },
      { id: "features", label: "Features", ref: featuresRef },
      { id: "how", label: "How", ref: howRef },
      { id: "status", label: "Status", ref: statusRef },
      { id: "faq", label: "FAQ", ref: faqRef },
    ],
    []
  );

  // Active tab detection
  const [active, setActive] = useState("home");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.getAttribute("data-sec-id");
            if (id) setActive(id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 }
    );
    sections.forEach((s) => s.ref.current && obs.observe(s.ref.current));
    return () => obs.disconnect();
  }, [sections]);

  // Smooth scroll to section (account for sticky header height)
  const scrollTo = (ref) => {
    const y = (ref.current?.getBoundingClientRect().top || 0) + window.scrollY - 72;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  };

  return (
    <div
      style={{
        color: P.text,
        background:
          "radial-gradient(1200px 600px at -10% -20%, rgba(127,90,240,.12), transparent), radial-gradient(900px 500px at 110% 110%, rgba(0,212,255,.10), transparent), #0B0D13",
        fontFamily:
          "'Space Grotesk', Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <TopNav
        tabs={sections.map((s) => ({ id: s.id, label: s.label }))}
        active={active}
        onTab={(id) => {
          const s = sections.find((x) => x.id === id);
          if (s) scrollTo(s.ref);
        }}
        onStartChat={onStartChat}
      />

      {/* HERO ------------------------------------------------------------ */}
      <section
        ref={heroRef}
        data-sec-id="home"
        style={{
          minHeight: "100svh",
          display: "grid",
          alignItems: "center",
          padding: "10vh 6vw 8vh",
          position: "relative",
        }}
      >
        <SoftBlob
          width={860}
          height={860}
          top="-18%"
          left="-10%"
          colors={["rgba(127,90,240,.26)", "rgba(0,212,255,.18)"]}
        />
        <SoftBlob
          width={780}
          height={780}
          bottom="-20%"
          right="-12%"
          colors={["rgba(44,182,125,.25)", "rgba(127,90,240,.18)"]}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200 }}>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{
              fontSize: "clamp(40px,7.2vw,84px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontWeight: 900,
              textTransform: "uppercase",
              background:
                "linear-gradient(90deg,#E6F1FF,#A3E9FF 30%,#A7F3CE 60%,#E6F1FF)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              marginBottom: 14,
            }}
          >
            Wellio — Your Cinematic Health Companion
          </motion.h1>
          <p style={{ color: P.sub, fontSize: "clamp(16px,1.5vw,18px)", maxWidth: 820 }}>
            Talk or type. Get guidance that blends AI with gentle health signals —
            heart, sleep, mood — in a modern, friendly interface.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
            <PrimaryBtn onClick={onStartChat}>Start chatting</PrimaryBtn>
            <GhostBtn onClick={() => scrollTo(featuresRef)}>Explore features</GhostBtn>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
              gap: 12,
              marginTop: 28,
              maxWidth: 720,
            }}
          >
            <StatCard k="98%" v="Response clarity" />
            <StatCard k="<400ms" v="UI latency" />
            <StatCard k="24/7" v="Availability" />
          </div>
        </div>

        <StickyCta onClick={onStartChat} />
      </section>

      {/* SNAPSHOT -------------------------------------------------------- */}
      <section
        ref={snapshotRef}
        data-sec-id="snapshot"
        style={{
          padding: "72px 6vw 56px",
          borderTop: `1px solid ${P.border}`,
          background: P.panel,
        }}
      >
        <SectionHeader
          title="Wellness snapshot"
          subtitle="A quick view of your core signals — clean, readable, and friendly."
        />
        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            marginTop: 18,
          }}
        >
          <MetricCard title="Heart rate" value="72 bpm" hint="Resting" accent={P.red} />
          <MetricCard title="SpO₂" value="98%" hint="Normal" accent={P.g3} />
          <MetricCard title="Sleep" value="7h 42m" hint="Deep 21%" accent={P.g1} />
          <MetricCard title="Stress" value="Low" hint="Balanced" accent={P.warn} />
          <RangeCard title="Daily steps" value={8420} max={10000} accent={P.g2} />
          <RangeCard title="Move ring" value={560} max={800} accent={P.g1} />
        </div>
      </section>

      {/* FEATURES -------------------------------------------------------- */}
      <section
        ref={featuresRef}
        data-sec-id="features"
        style={{
          padding: "72px 6vw 56px",
          borderTop: `1px solid ${P.border}`,
          background: P.panelAlt,
        }}
      >
        <SectionHeader
          title="Built for flow"
          subtitle="Ant-Design-like surface, micro-interactions, and privacy-minded defaults."
        />
        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            marginTop: 18,
          }}
        >
          <FeatureCard
            title="Voice-first"
            body="Tap the mic and speak naturally. Subtle motion mirrors how you talk — human, not clinical."
            chip="Realtime"
          />
          <FeatureCard
            title="Smart insights"
            body="Blends lightweight signals with your prompts to tailor guidance without feeling heavy."
            chip="Context-aware"
          />
          <FeatureCard
            title="Private by design"
            body="Minimal network chatter, clear states, transparent UI. You control what’s shared."
            chip="Privacy"
          />
        </div>

        {/* Integrations row */}
        <div style={{ marginTop: 26 }}>
          <SectionSubHeader title="Integrations" subtitle="Bring your data along." />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginTop: 12,
            }}
          >
            {["Apple Health", "Fitbit", "Garmin", "Zepp/Amazfit", "Google Fit"].map(
              (name) => (
                <LogoPill key={name} name={name} />
              )
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS ---------------------------------------------------- */}
      <section
        ref={howRef}
        data-sec-id="how"
        style={{
          padding: "72px 6vw 56px",
          borderTop: `1px solid ${P.border}`,
          background: P.panel,
        }}
      >
        <SectionHeader title="How it works" subtitle="Three steps — speak, see, and act." />
        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            marginTop: 18,
          }}
        >
          <StepCard n="01" title="Speak or type" body="Tell Wellio what’s up — quick check-ins or deep dives." />
          <StepCard n="02" title="Get a clear answer" body="Responds with warmth, clarity, and next steps." />
          <StepCard n="03" title="Track tiny wins" body="See gentle trends over time. Celebrate consistency." />
        </div>
      </section>

      {/* STATUS ---------------------------------------------------------- */}
      <section
        ref={statusRef}
        data-sec-id="status"
        style={{
          padding: "72px 6vw 56px",
          borderTop: `1px solid ${P.border}`,
          background: P.panelAlt,
        }}
      >
        <SectionHeader
          title="System status"
          subtitle="Live service health for peace of mind."
        />
        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            marginTop: 18,
          }}
        >
          <StatusCard name="API" status="Operational" color={P.g3} uptime="99.97%" />
          <StatusCard name="Voice (STT)" status="Operational" color={P.g3} uptime="99.94%" />
          <StatusCard name="Speech (TTS)" status="Degraded" color={P.warn} uptime="99.51%" />
          <StatusCard name="Auth" status="Operational" color={P.g3} uptime="100%" />
        </div>
        <div style={{ marginTop: 14, color: P.sub, fontSize: 13 }}>
          Status is illustrative (demo). For incidents, we show a banner and fallback flows.
        </div>
      </section>

      {/* FAQ ------------------------------------------------------------- */}
      <section
        ref={faqRef}
        data-sec-id="faq"
        style={{
          padding: "72px 6vw 72px",
          borderTop: `1px solid ${P.border}`,
          background: P.panel,
        }}
      >
        <SectionHeader title="FAQ" subtitle="Quick answers to common questions." />
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            marginTop: 18,
          }}
        >
          <FaqItem q="Is my data private?" a="Yes. You control what’s shared. We keep processing minimal and transparent." />
          <FaqItem q="Can I use voice only?" a="Absolutely. The UI is voice-first with a friendly type experience as well." />
          <FaqItem q="Does it work offline?" a="Core UI works; some features (STT/TTS) need connectivity. We handle fallbacks." />
          <FaqItem q="Is Wellio a medical device?" a="No. It’s an assistant for daily wellness — not a substitute for medical advice." />
        </div>
      </section>

      {/* CTA STRIP ------------------------------------------------------- */}
      <section
        style={{
          padding: "40px 6vw",
          borderTop: `1px solid ${P.border}`,
          background:
            "linear-gradient(135deg, rgba(44,182,125,.25), rgba(127,90,240,.25))",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 18,
            alignItems: "center",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "clamp(20px,2.8vw,28px)",
                fontWeight: 900,
                letterSpacing: "-0.01em",
              }}
            >
              Ready to feel lighter about your day?
            </h3>
            <p style={{ color: P.sub, marginTop: 6 }}>
              Open the chat — your companion is here.
            </p>
          </div>
          <PrimaryBtn onClick={onStartChat}>Open chat</PrimaryBtn>
        </div>
      </section>

      {/* FOOTER ---------------------------------------------------------- */}
      <footer
        style={{
          padding: "42px 6vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: P.sub,
          borderTop: `1px solid ${P.border}`,
          background: P.panelAlt,
        }}
      >
        <span>© {new Date().getFullYear()} Wellio</span>
        <div style={{ display: "flex", gap: 14 }}>
          <a style={linkStyle} href="#">Privacy</a>
          <a style={linkStyle} href="#">Terms</a>
          <a style={linkStyle} href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------ NAV / CTA ----------------------------- */

function TopNav({ tabs, active, onTab, onStartChat }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 8,
        backdropFilter: "blur(10px)",
        background: "linear-gradient(180deg, rgba(15,19,26,.78), rgba(15,19,26,.35))",
        borderBottom: `1px solid ${P.border}`,
      }}
    >
      <div
        style={{
          height: 64,
          display: "grid",
          gridTemplateColumns: "200px 1fr auto", // brand / tabs / right cluster
          alignItems: "center",
          padding: "0 6vw",
          gap: 12,
        }}
      >
        {/* LEFT — Brand (unchanged) */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            fontWeight: 900,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            background:
              "linear-gradient(90deg,#E6F1FF,#A3E9FF 30%,#A7F3CE 60%,#E6F1FF)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            cursor: "pointer",
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          W e l l i o
        </motion.div>

        {/* CENTER — Tabs (unchanged) */}
        <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <TabBtn
              key={t.id}
              active={active === t.id}
              onClick={() => onTab(t.id)}
              label={t.label}
            />
          ))}
        </nav>

        {/* RIGHT — Heartbeat GIF + Docs + Open chat */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
            minWidth: 360,
          }}
        >
          <img
            src={heartbeat}
            alt=""
            style={{
              height: 34,
              width: "auto",
              opacity: 0.92,
              filter: "drop-shadow(0 0 14px rgba(163,230,255,0.35))",
              pointerEvents: "none",
            }}
          />
          <GhostBtn>Docs</GhostBtn>
          <PrimaryBtn onClick={onStartChat}>Open chat</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}


function StickyCta({ onClick }) {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 18,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.98 }}
        style={{
          pointerEvents: "auto",
          padding: "14px 22px",
          borderRadius: 999,
          border: `1px solid ${P.border}`,
          background:
            "linear-gradient(135deg, rgba(44,182,125,.55), rgba(127,90,240,.55))",
          color: P.text,
          fontWeight: 700,
          letterSpacing: "0.02em",
          boxShadow:
            "0 8px 24px rgba(127,90,240,.25), 0 4px 16px rgba(0,212,255,.15)",
          backdropFilter: "blur(6px)",
        }}
      >
        Start chatting
      </motion.button>
    </div>
  );
}

/* ----------------------------- UI Elements ---------------------------- */

function PrimaryBtn({ children, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        padding: "14px 20px",
        borderRadius: 12,
        border: `1px solid ${P.border}`,
        background:
          "linear-gradient(135deg, rgba(44,182,125,.55), rgba(127,90,240,.55))",
        color: P.text,
        fontWeight: 700,
        letterSpacing: "0.02em",
        cursor: "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}

function GhostBtn({ children, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        padding: "14px 18px",
        borderRadius: 12,
        border: `1px solid ${P.border}`,
        background: "rgba(255,255,255,.05)",
        color: P.text,
        letterSpacing: "0.02em",
        cursor: "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}

function TabBtn({ active, onClick, label }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }}
      style={{
        padding: "10px 14px",
        borderRadius: 999,
        border: `1px solid ${active ? "transparent" : P.border}`,
        background: active
          ? "linear-gradient(135deg, rgba(44,182,125,.55), rgba(127,90,240,.55))"
          : "rgba(255,255,255,.05)",
        color: P.text,
        fontSize: 14,
        letterSpacing: "0.02em",
        cursor: "pointer",
      }}
    >
      {label}
    </motion.button>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div>
      <h2
        style={{
          fontSize: "clamp(22px,3.2vw,34px)",
          fontWeight: 900,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h2>
      <p style={{ color: P.sub, marginTop: 6 }}>{subtitle}</p>
    </div>
  );
}

function SectionSubHeader({ title, subtitle }) {
  return (
    <div style={{ marginTop: 8 }}>
      <h3
        style={{
          fontSize: "clamp(16px,2.3vw,20px)",
          fontWeight: 800,
          letterSpacing: "-0.01em",
          margin: 0,
        }}
      >
        {title}
      </h3>
      {subtitle && <p style={{ color: P.sub, marginTop: 4 }}>{subtitle}</p>}
    </div>
  );
}

function StatCard({ k, v }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        border: `1px solid ${P.border}`,
        background: P.card,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{k}</div>
      <div style={{ color: P.sub, fontSize: 12, marginTop: 4 }}>{v}</div>
    </motion.div>
  );
}

function MetricCard({ title, value, hint, accent }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{
        padding: 16,
        borderRadius: 14,
        border: `1px solid ${P.border}`,
        background: P.card,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        aria-hidden
        animate={{ x: ["-20%", "100%"] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(135deg, ${accent}, transparent)`,
          opacity: 0.7,
        }}
      />
      <div style={{ fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{value}</div>
      <div style={{ color: P.sub, fontSize: 12 }}>{hint}</div>
    </motion.div>
  );
}

function RangeCard({ title, value, max, accent }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{
        padding: 16,
        borderRadius: 14,
        border: `1px solid ${P.border}`,
        background: P.card,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: "rgba(255,255,255,.08)",
          overflow: "hidden",
          border: `1px solid ${P.border}`,
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }}
          style={{
            height: "100%",
            background: `linear-gradient(90deg, ${accent}, ${P.g1})`,
          }}
        />
      </div>
      <div style={{ marginTop: 6, color: P.sub, fontSize: 12 }}>
        {value.toLocaleString()} / {max.toLocaleString()} • {pct}%
      </div>
    </motion.div>
  );
}

function FeatureCard({ title, body, chip }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{
        padding: 18,
        borderRadius: 14,
        border: `1px solid ${P.border}`,
        background: P.card,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Tag>{chip}</Tag>
        <h3
          style={{
            fontSize: "clamp(18px,2.2vw,22px)",
            fontWeight: 800,
            letterSpacing: "-0.01em",
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <p style={{ color: P.sub, marginTop: 8 }}>{body}</p>
    </motion.div>
  );
}

function StepCard({ n, title, body }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{
        padding: 18,
        borderRadius: 14,
        border: `1px solid ${P.border}`,
        background: P.card,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span
          style={{
            fontWeight: 900,
            color: P.g2,
            letterSpacing: "0.06em",
          }}
        >
          {n}
        </span>
        <h4 style={{ fontSize: 18, margin: 0 }}>{title}</h4>
      </div>
      <p style={{ color: P.sub, marginTop: 6 }}>{body}</p>
    </motion.div>
  );
}

function StatusCard({ name, status, color, uptime }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={{
        padding: 16,
        borderRadius: 14,
        border: `1px solid ${P.border}`,
        background: P.card,
        display: "grid",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
        <strong>{name}</strong>
      </div>
      <div style={{ color: P.sub, fontSize: 14 }}>{status}</div>
      <div style={{ color: P.sub, fontSize: 12 }}>30-day uptime: {uptime}</div>
    </motion.div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      style={{
        border: `1px solid ${P.border}`,
        borderRadius: 14,
        background: P.card,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((s) => !s)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: 16,
          background: "transparent",
          border: 0,
          color: P.text,
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        {q}
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px", color: P.sub, lineHeight: 1.6 }}>{a}</div>
      )}
    </motion.div>
  );
}

function LogoPill({ name }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        border: `1px solid ${P.border}`,
        background: "rgba(255,255,255,.05)",
      }}
    >
      <i
        style={{
          width: 18,
          height: 18,
          borderRadius: 6,
          background:
            "linear-gradient(135deg, rgba(127,90,240,1), rgba(0,212,255,1))",
        }}
      />
      <span style={{ color: P.text, fontSize: 14 }}>{name}</span>
    </motion.div>
  );
}

function Tag({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${P.border}`,
        background: "rgba(255,255,255,.05)",
        color: P.text,
        fontSize: 12,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      <i
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(127,90,240,1), rgba(0,212,255,1))",
          boxShadow: "0 0 10px rgba(127,90,240,.6)",
        }}
      />
      {children}
    </span>
  );
}

const linkStyle = {
  color: P.sub,
  textDecoration: "none",
  fontSize: 14,
};

function SoftBlob({ width, height, top, left, bottom, right, colors }) {
  return (
    <motion.div
      aria-hidden
      animate={{ scale: [1, 1.04, 1], rotate: [0, 4, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        width,
        height,
        top,
        left,
        bottom,
        right,
        borderRadius: "50%",
        filter: "blur(70px)",
        background: `radial-gradient(60% 60% at 50% 50%, ${colors[0]}, transparent 70%), radial-gradient(40% 40% at 70% 30%, ${colors[1]}, transparent 70%)`,
        opacity: 0.9,
      }}
    />
  );
}
