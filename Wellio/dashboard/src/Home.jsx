export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0B0D13,#0F131A)",
        color: "#E6F1FF",
        display: "grid",
        placeItems: "center",
        fontFamily: "'Space Grotesk', Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: 12 }}>Wellio — Home</h1>
        <p style={{ opacity: 0.8, marginBottom: 20 }}>
          Routing smoke test. You should see this.
        </p>
        <a
          href="/chat"
          style={{
            padding: "12px 18px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.15)",
            background:
              "linear-gradient(135deg, rgba(44,182,125,.45), rgba(127,90,240,.45))",
            color: "#E6F1FF",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Go to Chat
        </a>
      </div>
    </div>
  );
}
