"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScoreRing } from "@/components/audit/score-ring";
import { Plus, Loader2, Trophy, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SiteResult {
  url: string;
  overallScore: number;
  trustScore: number;
  uxScore: number;
  seoScore: number;
  mobileScore: number;
  analysis?: Record<string, string>;
  findings?: Array<{ category: string; issue: string; priority: string }>;
}

const SCORE_KEYS: { label: string; key: keyof SiteResult }[] = [
  { label: "Overall", key: "overallScore" },
  { label: "Trust", key: "trustScore" },
  { label: "UX", key: "uxScore" },
  { label: "SEO", key: "seoScore" },
  { label: "Mobile", key: "mobileScore" },
];

function WinIndicator({ mine, theirs }: { mine: number; theirs: number }) {
  if (mine > theirs) return <TrendingUp className="w-4 h-4 text-green-400" />;
  if (mine < theirs) return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-gray-500" />;
}

async function pollAudit(id: string, maxAttempts = 20): Promise<SiteResult | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(`/api/audit/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === "COMPLETE") return data;
    if (data.status === "FAILED") return null;
  }
  return null;
}

export default function CompetitorPage() {
  const [yourUrl, setYourUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");
  const [yourSite, setYourSite] = useState<SiteResult | null>(null);
  const [competitor, setCompetitor] = useState<SiteResult | null>(null);

  async function runComparison(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setYourSite(null);
    setCompetitor(null);

    try {
      setLoadingStep("Creating audit for your site...");
      const auditRes = await fetch("/api/audit/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: yourUrl }),
      });

      if (!auditRes.ok) {
        const d = await auditRes.json();
        setError(d.error || "Failed to audit your site");
        return;
      }

      const { id } = await auditRes.json();

      setLoadingStep("Analysing both sites...");
      const [auditData, compRes] = await Promise.all([
        pollAudit(id),
        fetch("/api/competitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auditId: id, url: competitorUrl }),
        }),
      ]);

      if (!auditData) {
        setError("Your site analysis failed or timed out. Please try again.");
        return;
      }

      if (!compRes.ok) {
        const d = await compRes.json();
        setError(d.error || "Failed to analyze competitor");
        return;
      }

      const compData = await compRes.json();
      setYourSite(auditData);
      setCompetitor({ ...compData, url: competitorUrl });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }

  const yourWins = yourSite && competitor
    ? SCORE_KEYS.filter((s) => (yourSite[s.key] as number) > (competitor[s.key] as number)).length
    : 0;
  const theirWins = yourSite && competitor
    ? SCORE_KEYS.filter((s) => (competitor[s.key] as number) > (yourSite[s.key] as number)).length
    : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Competitor Comparison</h1>
        <p className="text-gray-400">See exactly where your site beats the competition — and where you&apos;re losing.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Compare Websites
          </CardTitle>
          <CardDescription>Enter your site and a competitor&apos;s URL to get a side-by-side conversion comparison.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={runComparison} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Your Website</label>
              <Input
                type="url"
                placeholder="https://yoursite.com"
                value={yourUrl}
                onChange={(e) => setYourUrl(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Competitor URL</label>
              <Input
                type="url"
                placeholder="https://competitor.com"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <Button type="submit" variant="gradient" disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {loadingStep || "Analysing..."}</>
                ) : (
                  <><Plus className="w-4 h-4" /> Run Comparison</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {yourSite && competitor && (
        <div>
          {/* Summary bar */}
          <div className="glass rounded-2xl p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-green-400">{yourWins}</div>
              <div className="text-xs text-gray-400 mt-0.5">Your wins</div>
            </div>
            <div className="text-gray-500 text-sm font-medium">vs</div>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-red-400">{theirWins}</div>
              <div className="text-xs text-gray-400 mt-0.5">Their wins</div>
            </div>
            <div className="flex-1 text-center">
              {yourWins > theirWins
                ? <span className="text-green-400 font-semibold text-sm">You&apos;re ahead overall 🎉</span>
                : yourWins < theirWins
                ? <span className="text-red-400 font-semibold text-sm">Competitor is ahead — time to fix that</span>
                : <span className="text-gray-400 font-semibold text-sm">It&apos;s a tie</span>}
            </div>
          </div>

          {/* Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your site */}
            <Card className="border-violet-500/30">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-violet-400 truncate flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                  Your Site
                </CardTitle>
                <p className="text-xs text-gray-500 truncate">{yourSite.url}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {SCORE_KEYS.map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1">
                      <ScoreRing score={yourSite[s.key] as number} label={s.label} />
                      <WinIndicator mine={yourSite[s.key] as number} theirs={competitor[s.key] as number} />
                    </div>
                  ))}
                </div>
                {yourSite.findings && yourSite.findings.length > 0 && (
                  <div className="space-y-3 text-sm border-t border-white/5 pt-4">
                    {yourSite.findings.slice(0, 5).map((f, i) => (
                      <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <div className="text-violet-400 font-medium capitalize mb-1">{f.category}</div>
                        <div className="text-gray-400">{f.issue}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Competitor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-400 truncate flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
                  Competitor
                </CardTitle>
                <p className="text-xs text-gray-500 truncate">{competitor.url}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {SCORE_KEYS.map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1">
                      <ScoreRing score={competitor[s.key] as number} label={s.label} />
                      <WinIndicator mine={competitor[s.key] as number} theirs={yourSite[s.key] as number} />
                    </div>
                  ))}
                </div>

                {competitor.analysis && (
                  <div className="space-y-3 text-sm border-t border-white/5 pt-4">
                    {Object.entries(competitor.analysis).map(([key, value]) => (
                      <div key={key} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <div className="text-violet-400 font-medium capitalize mb-1">{key}</div>
                        <div className="text-gray-400">{value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
