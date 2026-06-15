import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") ?? "yoursite.com";
  const score = parseInt(searchParams.get("score") ?? "0");
  const trust = parseInt(searchParams.get("trust") ?? "0");
  const ux = parseInt(searchParams.get("ux") ?? "0");
  const seo = parseInt(searchParams.get("seo") ?? "0");
  const mobile = parseInt(searchParams.get("mobile") ?? "0");
  const revenue = searchParams.get("revenue") ?? null;

  const scoreColor = score >= 70 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
  const scoreLabel = score >= 70 ? "Good" : score >= 50 ? "Needs Work" : "Critical";

  const subScores = [
    { label: "Trust", value: trust },
    { label: "UX", value: ux },
    { label: "SEO", value: seo },
    { label: "Mobile", value: mobile },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #09090b 0%, #0f0a1a 50%, #0d0d1a 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Purple glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 300,
            background: "radial-gradient(ellipse, rgba(124,58,237,0.3) 0%, transparent 70%)",
          }}
        />

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              🔥
            </div>
            <span style={{ color: "white", fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Profitlens</span>
          </div>
          <div
            style={{
              background: "rgba(124,58,237,0.2)",
              border: "1px solid rgba(124,58,237,0.4)",
              borderRadius: 999,
              padding: "6px 16px",
              color: "#c4b5fd",
              fontSize: 14,
            }}
          >
            AI Conversion Audit
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 60 }}>
          {/* Score circle */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, minWidth: 200 }}>
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                border: `8px solid ${scoreColor}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: `${scoreColor}15`,
              }}
            >
              <span style={{ color: scoreColor, fontSize: 64, fontWeight: 900, lineHeight: 1 }}>{score}</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 16 }}>/100</span>
            </div>
            <div
              style={{
                background: `${scoreColor}20`,
                border: `1px solid ${scoreColor}40`,
                borderRadius: 999,
                padding: "4px 14px",
                color: scoreColor,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {scoreLabel}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 20 }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, marginBottom: 6 }}>Conversion audit for</div>
              <div style={{ color: "white", fontSize: 32, fontWeight: 800, wordBreak: "break-all" }}>{url}</div>
            </div>

            {revenue && (
              <div
                style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: 12,
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ color: "#22c55e", fontSize: 22 }}>💰</span>
                <span style={{ color: "#22c55e", fontSize: 22, fontWeight: 700 }}>
                  +${parseInt(revenue).toLocaleString()}/mo revenue opportunity
                </span>
              </div>
            )}

            {/* Sub-scores */}
            <div style={{ display: "flex", gap: 16 }}>
              {subScores.map((s) => {
                const c = s.value >= 70 ? "#22c55e" : s.value >= 50 ? "#eab308" : "#ef4444";
                return (
                  <div
                    key={s.label}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      padding: "10px 16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ color: c, fontSize: 22, fontWeight: 800 }}>{s.value}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 30 }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            Get your free audit at profitlens.com
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
