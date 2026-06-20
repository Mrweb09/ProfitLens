import { TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const scores = [
  { label: "Overall", score: 60, color: "text-yellow-400", ring: "#eab308" },
  { label: "Trust", score: 80, color: "text-green-400", ring: "#22c55e" },
  { label: "UX", score: 50, color: "text-orange-400", ring: "#f97316" },
  { label: "SEO", score: 70, color: "text-yellow-400", ring: "#eab308" },
  { label: "Mobile", score: 40, color: "text-red-400", ring: "#ef4444" },
  { label: "Revenue", score: 30, color: "text-red-400", ring: "#ef4444" },
];

const findings = [
  { priority: "HIGH", issue: "No mobile-optimised checkout flow", impact: "+£800/mo", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  { priority: "HIGH", issue: "Product pages missing social proof and reviews", impact: "+£600/mo", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  { priority: "MEDIUM", issue: "CTA buttons lack urgency and contrast", impact: "+£400/mo", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
];

function ScoreRing({ score, color, ring, label }: { score: number; color: string; ring: string; label: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={radius} fill="none"
            stroke={ring} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${color}`}>
          {score}
        </div>
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

export function AuditExample() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 text-sm text-green-300 mb-4">
            <CheckCircle2 className="w-4 h-4" /> Real audit example
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Here&apos;s what you get in 60 seconds
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            This is a real audit from PuzzleLair.com — an actual business with real conversion problems the AI caught instantly.
          </p>
        </div>

        {/* Audit card */}
        <div className="bg-[#0f0f13] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-0.5">puzzlelair.com</div>
              <div className="text-white font-bold text-lg">Conversion Audit Report</div>
            </div>
            <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-3 py-1 rounded-full font-medium">Needs Work</span>
          </div>

          {/* Scores */}
          <div className="px-6 py-8 border-b border-white/5">
            <div className="flex items-center justify-around flex-wrap gap-4">
              {scores.map((s) => (
                <ScoreRing key={s.label} {...s} />
              ))}
            </div>
          </div>

          {/* Revenue opportunity */}
          <div className="px-6 py-5 border-b border-white/5 bg-green-500/5">
            <div className="flex items-center gap-2 text-green-400 font-semibold mb-3">
              <TrendingUp className="w-4 h-4" /> Revenue Opportunity
            </div>
            <div className="flex items-center gap-8 flex-wrap">
              <div>
                <div className="text-gray-400 text-xs mb-1">Current Conversion Rate</div>
                <div className="text-white font-bold text-xl">1.0%</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Potential Uplift</div>
                <div className="text-green-400 font-bold text-xl">+2.0%</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Extra Revenue/Month</div>
                <div className="text-violet-400 font-bold text-2xl">£2,000</div>
              </div>
            </div>
          </div>

          {/* Findings */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 text-white font-semibold mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Top Issues Found
            </div>
            <div className="space-y-3">
              {findings.map((f, i) => (
                <div key={i} className={`border rounded-xl p-4 ${f.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-current/10 border border-current/20">{f.priority}</span>
                      <span className="text-sm text-white">{f.issue}</span>
                    </div>
                    <span className="text-green-400 text-sm font-medium shrink-0 ml-2">{f.impact}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-xs mt-4 text-center">+ 8 more findings with exact fixes in the full report</p>
          </div>

          {/* CTA */}
          <div className="px-6 py-5 border-t border-white/5 bg-violet-600/5 flex items-center justify-between flex-wrap gap-4">
            <p className="text-gray-400 text-sm">Get this for your own site — free, no credit card needed.</p>
            <Link href="/sign-up">
              <Button variant="gradient">
                Audit My Site Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
