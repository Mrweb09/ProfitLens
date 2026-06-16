"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getScoreColor } from "@/lib/utils";

interface ShareCardProps {
  url: string;
  overallScore: number;
  trustScore: number;
  uxScore: number;
  seoScore: number;
  mobileScore: number;
  revenueOpportunity?: number | null;
}

export function ShareCard({ url, overallScore, trustScore, uxScore, seoScore, mobileScore, revenueOpportunity }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function downloadCard() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#09090b",
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `AuditRoast-audit-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  const scores = [
    { label: "Trust", value: trustScore },
    { label: "UX", value: uxScore },
    { label: "SEO", value: seoScore },
    { label: "Mobile", value: mobileScore },
  ];

  const scoreColor = (s: number) =>
    s >= 80 ? "#22c55e" : s >= 60 ? "#eab308" : s >= 40 ? "#f97316" : "#ef4444";

  return (
    <div className="space-y-4">
      {/* The card */}
      <div
        ref={cardRef}
        className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #09090b 100%)", border: "1px solid rgba(124,58,237,0.3)", padding: "32px" }}
      >
        <div className="flex items-center gap-2 mb-6">
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #7c3aed, #9333ea)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 16 }}>🔥</span>
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: 18 }}>AuditRoast</span>
        </div>

        <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 8 }}>Conversion Audit for</div>
        <div style={{ color: "white", fontWeight: 600, fontSize: 15, marginBottom: 24, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</div>

        {/* Big score */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 80, fontWeight: 900, color: scoreColor(overallScore), lineHeight: 1 }}>{overallScore}</div>
          <div style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>Overall Conversion Score</div>
        </div>

        {/* Sub scores */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          {scores.map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: scoreColor(s.value) }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {revenueOpportunity && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ color: "#86efac", fontSize: 13 }}>Revenue Opportunity</div>
            <div style={{ color: "#4ade80", fontWeight: 700, fontSize: 22 }}>+£{revenueOpportunity.toLocaleString()}/month</div>
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: "center", color: "#6b7280", fontSize: 12 }}>
          AuditRoast.com — AI Website Conversion Auditor
        </div>
      </div>

      <Button onClick={downloadCard} disabled={downloading} variant="secondary" className="w-full">
        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Download Share Card
      </Button>
    </div>
  );
}

