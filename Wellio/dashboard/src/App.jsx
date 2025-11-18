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
      { id: "snapshot", label: "For you", ref: snapshotRef },
      { id: "features", label: "Spaces", ref: featuresRef },
      { id: "how", label: "Getting started", ref: howRef },
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
          "radial-gradient(1200px 600px at -10% -20%, rgba(127,90,240,.22), transparent), radial-gradient(900px 500px at 110% 110%, rgba(0,212,255,.14), transparent), #0B0D13",
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

      <main>
        {/* HERO ------------------------------------------------------------ */}
        <section
          ref={heroRef}
          data-sec-id="home"
          style={{
            minHeight: "100svh",
            padding: "88px 6vw 72px",
            position: "relative",
            display: "flex",
            alignItems: "center",
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

          <div
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: 1220,
              margin: "0 auto",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.45fr) minmax(0,1fr)",
                gap: 32,
                alignItems: "center",
              }}
            >
              {/* LEFT: Copy */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: `1px solid ${P.border}`,
                    background: "rgba(8,12,20,0.75)",
                    marginBottom: 12,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: P.sub,
                  }}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background:
                        "conic-gradient(from 0deg, #7F5AF0, #00D4FF, #2CB67D, #7F5AF0)",
                      boxShadow: "0 0 12px rgba(127,90,240,.9)",
                    }}
                  />
                  Wellio Original • Daily Companion
                </div>

                <motion.h1
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.05 }}
                  style={{
                    fontSize: "clamp(42px,7.2vw,86px)",
                    lineHeight: 1.02,
                    letterSpacing: "-0.03em",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    background:
                      "linear-gradient(90deg,#E6F1FF,#A3E9FF 30%,#A7F3CE 60%,#E6F1FF)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    marginBottom: 14,
                  }}
                >
                  Your health,
                  <br />
                  streaming in tiny moments.
                </motion.h1>

                <p
                  style={{
                    color: P.sub,
                    fontSize: "clamp(16px,1.6vw,18px)",
                    maxWidth: 640,
                  }}
                >
                  Ask anything. See heart, sleep, and stress stitched into one
                  clean, interactive view — like your favourite show, but for your day.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 26,
                    flexWrap: "wrap",
                  }}
                >
                  <PrimaryBtn onClick={onStartChat}>Start chatting</PrimaryBtn>
                  <GhostBtn onClick={() => scrollTo(snapshotRef)}>
                    Browse wellness rows
                  </GhostBtn>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    marginTop: 24,
                    flexWrap: "wrap",
                  }}
                >
                  <HeroChip label="Works with your smartwatch" />
                  <HeroChip label="Voice and text together" />
                  <HeroChip label="No complex setup" />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 18,
                    marginTop: 22,
                    flexWrap: "wrap",
                  }}
                >
                  <HeroStat k="98%" v="Response clarity" />
                  <HeroStat k="<400 ms" v="UI latency" />
                  <HeroStat k="24/7" v="Availability" />
                </div>
              </motion.div>

              {/* RIGHT: Preview panel */}
              <HeroPreview />
            </div>
          </div>

          <StickyCta onClick={onStartChat} />
        </section>

        {/* SNAPSHOT: NETFLIX-LIKE ROWS ----------------------------------- */}
        <section
          ref={snapshotRef}
          data-sec-id="snapshot"
          style={{
            padding: "32px 6vw 40px",
            borderTop: `1px solid ${P.border}`,
            background: P.panel,
          }}
        >
          <SectionHeader
            title="For you today"
            subtitle="Swipe through quick wellness rows tuned to your daily rhythm."
          />

          <div style={{ marginTop: 22 }}>
            <CarouselRow
              title="Today on Wellio"
              subtitle="Tiny check-ins curated from your recent patterns."
            >
              <PosterCard
                title="Morning reset"
                meta="2-min mood check • Recommended"
                badge="New"
                tone="green"
              />
              <PosterCard
                title="Focus block"
                meta="Breathing • 5 minutes"
                badge="Popular"
                tone="violet"
              />
              <PosterCard
                title="Wind-down"
                meta="Sleep prep • 7 minutes"
                badge="Tonight"
                tone="blue"
              />
              <PosterCard
                title="Stress scan"
                meta="Heart + stress trend"
                badge="Insight"
                tone="amber"
              />
            </CarouselRow>

            <CarouselRow
              title="Signals overview"
              subtitle="Core metrics, laid out like a watchboard."
            >
              <MetricCard
                title="Heart rate"
                value="72 bpm"
                hint="Resting, steady"
                accent={P.red}
                style={{ minWidth: 220 }}
              />
              <MetricCard
                title="SpO₂"
                value="98%"
                hint="Within normal range"
                accent={P.g3}
                style={{ minWidth: 220 }}
              />
              <MetricCard
                title="Sleep"
                value="7h 42m"
                hint="Deep 21% • Quality good"
                accent={P.g1}
                style={{ minWidth: 220 }}
              />
              <MetricCard
                title="Stress"
                value="Low"
                hint="Calm for most of today"
                accent={P.warn}
                style={{ minWidth: 220 }}
              />
            </CarouselRow>

            <CarouselRow
              title="Activity streaks"
              subtitle="Progress bars you can actually read."
            >
              <RangeCard
                title="Daily steps"
                value={8420}
                max={10000}
                accent={P.g2}
                style={{ minWidth: 260 }}
              />
              <RangeCard
                title="Move ring"
                value={560}
                max={800}
                accent={P.g1}
                style={{ minWidth: 260 }}
              />
              <RangeCard
                title="Stand goals"
                value={11}
                max={12}
                accent={P.g3}
                style={{ minWidth: 260 }}
              />
            </CarouselRow>
          </div>
        </section>

        {/* FEATURES / SPACES --------------------------------------------- */}
        <section
          ref={featuresRef}
          data-sec-id="features"
          style={{
            padding: "40px 6vw 40px",
            borderTop: `1px solid ${P.border}`,
            background: P.panelAlt,
          }}
        >
          <SectionHeader
            title="Browse wellness spaces"
            subtitle="Different ‘rows’ for different parts of your day."
          />

          <div style={{ marginTop: 22 }}>
            <CarouselRow
              title="Wellio spaces"
              subtitle="Pick a space and let the assistant adapt."
            >
              <FeatureCard
                title="Calm mornings"
                body="Short check-ins with heart and breath focus."
                chip="AM"
                style={{ minWidth: 260 }}
              />
              <FeatureCard
                title="Deep work"
                body="Focus-first guidance with fewer interruptions."
                chip="Focus"
                style={{ minWidth: 260 }}
              />
              <FeatureCard
                title="Evening wind-down"
                body="Unwind with sleep-ready routines and soft prompts."
                chip="PM"
                style={{ minWidth: 260 }}
              />
              <FeatureCard
                title="On-the-go"
                body="Quick prompts tuned for commute and in-between time."
                chip="Mobile"
                style={{ minWidth: 260 }}
              />
            </CarouselRow>

            <SectionSubHeader
              title="Integrations"
              subtitle="Plug in your existing health data. No spreadsheets needed."
            />
            <CarouselRow title="" subtitle="">
              {["Apple Health", "Fitbit", "Garmin", "Zepp/Amazfit", "Google Fit"].map(
                (name) => (
                  <LogoPill key={name} name={name} />
                )
              )}
            </CarouselRow>
          </div>
        </section>

        {/* HOW IT WORKS -------------------------------------------------- */}
        <section
          ref={howRef}
          data-sec-id="how"
          style={{
            padding: "40px 6vw 40px",
            borderTop: `1px solid ${P.border}`,
            background: P.panel,
          }}
        >
          <SectionHeader
            title="Getting started"
            subtitle="Three simple steps — like pressing play."
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            viewport={{ once: true, amount: 0.4 }}
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              marginTop: 22,
            }}
          >
            <StepCard
              n="01"
              title="Speak or type"
              body="Tell Wellio what is going on — from quick questions to deeper worries."
            />
            <StepCard
              n="02"
              title="Watch the answer unfold"
              body="The assistant blends your signals with your words and replies clearly."
            />
            <StepCard
              n="03"
              title="Track your tiny wins"
              body="Over time, see stress ease, sleep smooth out, and streaks stay alive."
            />
          </motion.div>

          <div style={{ marginTop: 26 }}>
            <SectionSubHeader
              title="Quick actions"
              subtitle="Start with one tap, like choosing an episode."
            />
            <CarouselRow title="" subtitle="">
              <QuickActionCard label="I feel off today" hint="Scan stress, sleep, and mood." />
              <QuickActionCard label="Help me sleep better" hint="Gentle sleep checklist." />
              <QuickActionCard label="Check my heart trend" hint="Last 7 days in one glance." />
              <QuickActionCard label="Plan a calmer week" hint="Micro-habits based on your data." />
            </CarouselRow>
          </div>
        </section>

        {/* STATUS -------------------------------------------------------- */}
        <section
          ref={statusRef}
          data-sec-id="status"
          style={{
            padding: "40px 6vw 34px",
            borderTop: `1px solid ${P.border}`,
            background: P.panelAlt,
          }}
        >
          <SectionHeader
            title="System status"
            subtitle="Live service health for peace of mind."
          />
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.4 }}
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              marginTop: 18,
            }}
          >
            <StatusCard name="API" status="Operational" color={P.g3} uptime="99.97%" />
            <StatusCard name="Voice (STT)" status="Operational" color={P.g3} uptime="99.94%" />
            <StatusCard
              name="Speech (TTS)"
              status="Degraded"
              color={P.warn}
              uptime="99.51%"
            />
            <StatusCard name="Auth" status="Operational" color={P.g3} uptime="100%" />
          </motion.div>
          <div style={{ marginTop: 14, color: P.sub, fontSize: 13 }}>
            Status is illustrative (demo). For incidents, we show a banner and clear fallback
            flows.
          </div>
        </section>

        {/* FAQ ----------------------------------------------------------- */}
        <section
          ref={faqRef}
          data-sec-id="faq"
          style={{
            padding: "40px 6vw 60px",
            borderTop: `1px solid ${P.border}`,
            background: P.panel,
          }}
        >
          <SectionHeader
            title="FAQ"
            subtitle="Quick answers before you press “play” on your health."
          />
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              marginTop: 18,
            }}
          >
            <FaqItem
              q="Is my data private?"
              a="Yes. You control what is shared. We keep processing minimal, show you what is happening, and let you pause or clear data at any time."
            />
            <FaqItem
              q="Can I use voice only?"
              a="Yes. The assistant is voice-first with a smooth typing experience if you prefer not to talk out loud."
            />
            <FaqItem
              q="Does it work offline?"
              a="The UI works; some features like speech and deeper AI need connectivity. When offline, we show simple fallback prompts."
            />
            <FaqItem
              q="Is Wellio a medical device?"
              a="No. It is a daily wellness companion, not a medical tool. It does not replace professional medical advice, diagnosis, or treatment."
            />
          </div>
        </section>

        {/* CTA STRIP ----------------------------------------------------- */}
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
                Open the chat — your companion is already listening.
              </p>
            </div>
            <PrimaryBtn onClick={onStartChat}>Open chat</PrimaryBtn>
          </div>
        </section>

        {/* FOOTER -------------------------------------------------------- */}
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
            <a style={linkStyle} href="#">
              Privacy
            </a>
            <a style={linkStyle} href="#">
              Terms
            </a>
            <a style={linkStyle} href="#">
              Contact
            </a>
          </div>
        </footer>
      </main>
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
        background:
          "linear-gradient(180deg, rgba(15,19,26,.88), rgba(15,19,26,.36))",
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
        {/* LEFT — Brand */}
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

        {/* CENTER — Tabs */}
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
};  

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

/* ----------------------------- HERO PIECES ---------------------------- */

function HeroChip({ label }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${P.border}`,
        background: "rgba(10,14,22,.9)",
        color: P.sub,
        fontSize: 12,
      }}
    >
      <i
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(127,90,240,1), rgba(0,212,255,1))",
        }}
      />
      {label}
    </span>
  );
}

function HeroStat({ k, v }) {
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: 12,
        border: `1px solid ${P.border}`,
        background: "rgba(8,12,20,0.9)",
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{k}</div>
      <div style={{ color: P.sub, fontSize: 11, marginTop: 3 }}>{v}</div>
    </div>
  );
}

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
      style={{
        justifySelf: "stretch",
        maxWidth: 420,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Glow behind card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          translate: "0 20px",
          filter: "blur(40px)",
          background:
            "radial-gradient(60% 60% at 50% 10%, rgba(127,90,240,.55), transparent 70%)",
          opacity: 0.8,
        }}
      />

      <motion.div
        whileHover={{ y: -4 }}
        style={{
          position: "relative",
          borderRadius: 26,
          border: `1px solid ${P.border}`,
          background:
            "linear-gradient(150deg, rgba(8,12,20,0.96), rgba(12,18,28,0.96))",
          padding: 18,
          boxShadow:
            "0 24px 40px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,0.03)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: P.sub,
            }}
          >
            Now playing
          </span>
          <span
            style={{
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 11,
              border: `1px solid ${P.border}`,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            Your daily snapshot
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background:
                "conic-gradient(from 220deg, #7F5AF0, #00D4FF, #2CB67D, #7F5AF0)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 32px rgba(127,90,240,.8)",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#05070B",
              }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Today looks balanced</div>
            <div style={{ fontSize: 12, color: P.sub, marginTop: 2 }}>
              Heart, sleep, and stress are in a healthy band.
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          <MiniMetric title="Heart rate" value="72 bpm" tag="Resting" />
          <MiniMetric title="SpO₂" value="98%" tag="Normal" />
          <MiniMetric title="Sleep" value="7h 42m" tag="Good" />
          <MiniMetric title="Stress" value="Low" tag="Calm" />
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 11, color: P.sub }}>
            Tap <span style={{ color: P.text }}>Start chatting</span> to dive deeper.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: P.sub,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: P.g3,
                boxShadow: `0 0 10px ${P.g3}`,
              }}
            />
            Live
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MiniMetric({ title, value, tag }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${P.border}`,
        background: "rgba(8,12,20,.96)",
        padding: 10,
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.09em",
          color: P.sub,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: P.sub }}>{tag}</div>
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
  if (!title && !subtitle) return null;
  return (
    <div style={{ marginTop: 8 }}>
      {title && (
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
      )}
      {subtitle && <p style={{ color: P.sub, marginTop: 4 }}>{subtitle}</p>}
    </div>
  );
}

/* ----------------------------- CAROUSEL ROW --------------------------- */

function CarouselRow({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 26 }}>
      {(title || subtitle) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 12,
          }}
        >
          {title && (
            <h3
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <span style={{ color: P.sub, fontSize: 12 }}>{subtitle}</span>
          )}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45 }}
        style={{
          marginTop: 10,
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 6,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function PosterCard({ title, meta, badge, tone }) {
  const gradientByTone = {
    green: `linear-gradient(135deg, rgba(44,182,125,.85), rgba(16,24,40,1))`,
    violet: `linear-gradient(135deg, rgba(127,90,240,.9), rgba(10,14,25,1))`,
    blue: `linear-gradient(135deg, rgba(0,212,255,.9), rgba(10,16,30,1))`,
    amber: `linear-gradient(135deg, rgba(245,158,11,.95), rgba(18,12,4,1))`,
  };
  const bg = gradientByTone[tone] || gradientByTone.violet;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{
        minWidth: 260,
        maxWidth: 280,
        borderRadius: 18,
        background: bg,
        padding: 14,
        position: "relative",
        boxShadow: "0 14px 30px rgba(0,0,0,0.55)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.2), transparent 55%)",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 999,
            background: "rgba(0,0,0,.35)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#F9FAFB",
          }}
        >
          {badge}
        </span>
        <span style={{ fontSize: 11, color: "rgba(241,245,249,0.8)" }}>
          2–7 min
        </span>
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#F9FAFB",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            color: "rgba(241,245,249,0.85)",
          }}
        >
          {meta}
        </div>
      </div>
    </motion.div>
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

function MetricCard({ title, value, hint, accent, style }) {
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
        ...style,
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

function RangeCard({ title, value, max, accent, style }) {
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
        ...style,
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

function FeatureCard({ title, body, chip, style }) {
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
        ...style,
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
        <div style={{ padding: "0 16px 16px", color: P.sub, lineHeight: 1.6 }}>
          {a}
        </div>
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
        minWidth: 180,
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

function QuickActionCard({ label, hint }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      style={{
        minWidth: 230,
        borderRadius: 14,
        border: `1px solid ${P.border}`,
        background: "rgba(10,13,20,0.96)",
        padding: 14,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 12, color: P.sub, marginTop: 4 }}>{hint}</div>
    </motion.div>
  );
}

const linkStyle = {
  color: P.sub,
  textDecoration: "none",
  fontSize: 14,
};

/* ---------------------------- BACKGROUND BLOB ------------------------- */

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
