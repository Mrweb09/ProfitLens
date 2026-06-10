"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Flame, Zap, TrendingUp, Star } from "lucide-react";
import { AuditCounter } from "./audit-counter";
import type { AuditResult } from "@/lib/audit-engine";

export function Hero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeResult, setFreeResult] = useState<AuditResult | null>(null);
  const [freeError, setFreeError] = useState("");
  const router = useRouter();
  const { isSignedIn } = useUser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setFreeError("");

    if (isSignedIn) {
      try {
        const res = await fetch("/api/audit/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (data.id) router.push(`/dashboard/audit/${data.id}`);
      } catch {
        setLoading(false);
      }
    } else {
      try {
        const res = await fetch("/api/audit/free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (res.ok) {
          setFreeResult(data);
        } else {
          setFreeError(data.error ?? "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-[#09090b] to-purple-950/20" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-violet-600/10 border border-violet-500/30 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-8">
          <Flame className="w-4 h-4" />
          <span>AI-Powered Conversion Audits</span>
          <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">NEW</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Your website is{" "}
          <span className="gradient-text">losing money</span>
          <br />
          every single day
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Enter your URL and our AI will roast your site — then show you exactly
          how to fix it and how much extra revenue you could unlock.
        </p>

        {/* URL Input */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-6">
          <div className="flex gap-3 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <Input
              type="url"
              placeholder="https://yourwebsite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-base h-12"
              required
            />
            <Button
              type="submit"
              size="lg"
              variant="gradient"
              disabled={loading}
              className="pulse-glow shrink-0"
            >
              {loading ? "Analysing..." : <>Roast My Site <ArrowRight className="w-5 h-5" /></>}
            </Button>
          </div>
        </form>

        {freeError && (
          <p className="text-red-400 text-sm mb-4">{freeError}</p>
        )}

        {freeResult && (
          <div className="max-w-2xl mx-auto mb-8 glass rounded-2xl p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Your Free Audit Results</h3>
              <span className="text-3xl font-extrabold text-red-400">{freeResult.overallScore}/100</span>
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{freeResult.roastContent?.split("\n\n")[0]}</p>
            <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-4 mb-4">
              <div className="text-violet-300 text-sm font-medium mb-1">💰 Revenue Opportunity</div>
              <div className="text-white font-bold text-lg">+£{freeResult.revenueOpportunity?.toLocaleString()}/month if fixed</div>
            </div>
            <p className="text-gray-500 text-xs mb-3">Sign up free to see all {freeResult.findings?.length} findings, exact fixes, and your full report.</p>
            <a href="/sign-up">
              <Button variant="gradient" className="w-full">See Full Report Free →</Button>
            </a>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-4">
          {isSignedIn ? "Run a full audit from your dashboard." : "Try free — no account needed. Sign up for full results."}
        </p>
        <div className="mb-10">
          <AuditCounter />
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-gray-400 mb-16">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <span>4.9/5 from 500+ audits</span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-violet-400" />
            <span>Results in under 60 seconds</span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span>Average +£2,400/mo uplift</span>
          </div>
        </div>

        {/* Preview scores */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-3xl mx-auto">
          {[
            { label: "Overall", score: 34, color: "text-red-400", bg: "bg-red-400" },
            { label: "Trust", score: 28, color: "text-red-400", bg: "bg-red-400" },
            { label: "UX", score: 52, color: "text-orange-400", bg: "bg-orange-400" },
            { label: "SEO", score: 61, color: "text-yellow-400", bg: "bg-yellow-400" },
            { label: "Mobile", score: 43, color: "text-orange-400", bg: "bg-orange-400" },
            { label: "Revenue", score: 22, color: "text-red-400", bg: "bg-red-400" },
          ].map((item) => (
            <div key={item.label} className="glass rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${item.color}`}>{item.score}</div>
              <div className="text-xs text-gray-500 mt-1">{item.label}</div>
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.bg} rounded-full`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">↑ Example scores from a real audit</p>
      </div>
    </section>
  );
}
