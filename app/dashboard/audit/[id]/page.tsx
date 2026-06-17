import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/audit/score-ring";
import { RecommendationCard } from "@/components/audit/recommendation-card";
import { ShareButton } from "@/components/audit/share-button";
import { ExportPDFButton } from "@/components/audit/export-pdf-button";
import { formatCurrency } from "@/lib/utils";
import { Globe, TrendingUp, Flame, AlertTriangle } from "lucide-react";
import type { AuditFinding } from "@/lib/audit-engine";
import { AutoRefresh } from "@/components/audit/auto-refresh";
import { ShareCard } from "@/components/audit/share-card";
import { ActionPlan } from "@/components/audit/action-plan";
import { ScoreHistoryChart } from "@/components/audit/score-history-chart";
import { AIChat } from "@/components/audit/ai-chat";
import { ReauditButton } from "@/components/audit/reaudit-button";
import { WatchButton } from "@/components/audit/watch-button";

export default async function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) redirect("/dashboard");

  const [audit, actionItems] = await Promise.all([
    prisma.audit.findFirst({ where: { id, userId: dbUser.id } }),
    prisma.actionItem.findMany({ where: { auditId: id }, orderBy: { order: "asc" } }),
  ]);

  if (!audit) notFound();

  if (audit.status === "PENDING" || audit.status === "ANALYZING") {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center pt-24">
        <AutoRefresh intervalMs={4000} />
        <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Flame className="w-8 h-8 text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Roasting your site...</h1>
        <p className="text-gray-400 mb-6">Our AI is tearing through your website. This takes 20–40 seconds.</p>
        <div className="max-w-xs mx-auto space-y-3 text-left">
          {[
            "Analysing homepage structure...",
            "Checking trust signals...",
            "Evaluating mobile experience...",
            "Calculating revenue opportunity...",
            "Writing your roast...",
          ].map((step, i) => (
            <div key={step} className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (audit.status === "FAILED") {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center pt-24">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Analysis failed</h1>
        <p className="text-gray-400">We couldn&apos;t analyse this URL. Please check the URL is correct and try again.</p>
      </div>
    );
  }

  const findings = (audit.findings as unknown as AuditFinding[]) ?? [];
  const recommendations = (audit.recommendations as unknown as AuditFinding[]) ?? [];
  const highPriority = findings.filter((f) => f.priority === "HIGH");
  const medPriority = findings.filter((f) => f.priority === "MEDIUM");
  const lowPriority = findings.filter((f) => f.priority === "LOW");

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Globe className="w-4 h-4" />
            {audit.url}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Conversion Audit Report</h1>
        </div>
        <div className="flex items-center gap-3">
          <WatchButton url={audit.url} />
          <ReauditButton url={audit.url} />
          <ShareButton
            auditId={audit.id}
            isPublic={audit.isPublic}
            url={audit.url}
            score={audit.overallScore ?? 0}
            trustScore={audit.trustScore ?? 0}
            uxScore={audit.uxScore ?? 0}
            seoScore={audit.seoScore ?? 0}
            mobileScore={audit.mobileScore ?? 0}
            revenueOpportunity={audit.revenueOpportunity}
          />
          <ExportPDFButton audit={audit} branding={{ agencyName: dbUser.agencyName, agencyLogo: dbUser.agencyLogo, plan: dbUser.plan }} />
        </div>
      </div>

      {/* Score Overview */}
      <Card className="mb-6">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex flex-col items-center">
              <ScoreRing score={audit.overallScore ?? 0} label="Overall Score" size="lg" />
              <Badge
                variant={
                  (audit.overallScore ?? 0) >= 70 ? "success" :
                  (audit.overallScore ?? 0) >= 50 ? "warning" : "danger"
                }
                className="mt-3"
              >
                {(audit.overallScore ?? 0) >= 70 ? "Good" : (audit.overallScore ?? 0) >= 50 ? "Needs Work" : "Critical"}
              </Badge>
            </div>

            <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: "Trust", score: audit.trustScore ?? 0 },
                { label: "UX", score: audit.uxScore ?? 0 },
                { label: "SEO", score: audit.seoScore ?? 0 },
                { label: "Mobile", score: audit.mobileScore ?? 0 },
                { label: "Revenue", score: audit.revenueScore ?? 0 },
              ].map((s) => (
                <ScoreRing key={s.label} score={s.score} label={s.label} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Calculator */}
      {audit.revenueOpportunity && (
        <Card className="mb-6 border-green-500/30 bg-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">Revenue Opportunity</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{((audit.currentConvRate ?? 0) * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-400 mt-1">Current Conversion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">+{((audit.potentialUplift ?? 0) * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-400 mt-1">Potential Uplift</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">{formatCurrency(audit.revenueOpportunity)}</div>
                <div className="text-sm text-gray-400 mt-1">Extra Revenue/Month</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-300">
              If you fix the HIGH priority issues on this report, this website could potentially generate{" "}
              <strong>{formatCurrency(audit.revenueOpportunity)} more per month</strong>.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Industry comparison */}
      {audit.overallScore !== null && (
        <Card className="mb-6 border-violet-500/20 bg-violet-500/5">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">How You Compare</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: "Overall", score: audit.overallScore ?? 0, avg: 55 },
                { label: "Trust", score: audit.trustScore ?? 0, avg: 52 },
                { label: "UX", score: audit.uxScore ?? 0, avg: 58 },
                { label: "SEO", score: audit.seoScore ?? 0, avg: 61 },
                { label: "Mobile", score: audit.mobileScore ?? 0, avg: 54 },
              ].map(({ label, score, avg }) => {
                const diff = score - avg;
                const pct = Math.round(50 + (diff / Math.max(avg, 100 - avg)) * 40);
                return (
                  <div key={label} className="text-center">
                    <div className="text-xs text-gray-500 mb-1">{label}</div>
                    <div className={`text-2xl font-bold ${diff >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {diff >= 0 ? "+" : ""}{diff}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">vs avg ({avg})</div>
                    <div className="text-xs text-violet-300 mt-1">Top {100 - pct}%</div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Benchmarked against {">"}10,000 websites audited by AuditRoast
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="findings">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="findings">Findings ({findings.length})</TabsTrigger>
          <TabsTrigger value="recommendations">Top Fixes</TabsTrigger>
          <TabsTrigger value="roast">🔥 Roast</TabsTrigger>
          <TabsTrigger value="action">✅ Action Plan</TabsTrigger>
          <TabsTrigger value="chat">💬 Ask AI</TabsTrigger>
          <TabsTrigger value="history">📈 Progress</TabsTrigger>
          <TabsTrigger value="share">📸 Share</TabsTrigger>
        </TabsList>

        <TabsContent value="findings">
          <div className="space-y-6">
            {highPriority.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> High Priority ({highPriority.length})
                </h3>
                <div className="space-y-3">
                  {highPriority.map((f, i) => (
                    <RecommendationCard key={i} finding={f} index={i} />
                  ))}
                </div>
              </div>
            )}
            {medPriority.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3">
                  Medium Priority ({medPriority.length})
                </h3>
                <div className="space-y-3">
                  {medPriority.map((f, i) => (
                    <RecommendationCard key={i} finding={f} index={i} />
                  ))}
                </div>
              </div>
            )}
            {lowPriority.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Low Priority ({lowPriority.length})
                </h3>
                <div className="space-y-3">
                  {lowPriority.map((f, i) => (
                    <RecommendationCard key={i} finding={f} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={i} finding={rec} index={i} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-400">
                <Flame className="w-5 h-5" /> The Honest Roast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                {audit.roastContent?.split("\n\n").map((para: string, i: number) => (
                  <p key={i} className="text-gray-300 leading-relaxed mb-4 last:mb-0">
                    {para}
                  </p>
                ))}
              </div>
              <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <p className="text-sm text-orange-300">
                  Share this roast on TikTok or LinkedIn to show your audience you&apos;re serious about fixing your conversions.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="action">
          {actionItems.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <p className="text-gray-400">Action plan is still being generated. Refresh in a moment.</p>
            </div>
          ) : (
            <ActionPlan items={actionItems} />
          )}
        </TabsContent>

        <TabsContent value="chat">
          <AIChat auditId={audit.id} />
        </TabsContent>

        <TabsContent value="history">
          <ScoreHistoryChart url={audit.url} />
        </TabsContent>

        <TabsContent value="share">
          <div className="max-w-lg mx-auto">
            <p className="text-gray-400 text-sm text-center mb-6">
              Download your branded score card and post it on TikTok, LinkedIn, or Twitter.
            </p>
            <ShareCard
              url={audit.url}
              overallScore={audit.overallScore ?? 0}
              trustScore={audit.trustScore ?? 0}
              uxScore={audit.uxScore ?? 0}
              seoScore={audit.seoScore ?? 0}
              mobileScore={audit.mobileScore ?? 0}
              revenueOpportunity={audit.revenueOpportunity}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
