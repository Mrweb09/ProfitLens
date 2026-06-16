import { prisma } from "@/lib/prisma";
import { ScoreRing } from "@/components/audit/score-ring";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Globe, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 3600;

export const metadata = {
  title: "Leaderboard — AuditRoast",
  description: "The highest-converting websites as rated by AI. See how your site compares.",
};

export default async function LeaderboardPage() {
  const audits = await prisma.audit.findMany({
    where: { isPublic: true, status: "COMPLETE", overallScore: { not: null } },
    orderBy: { overallScore: "desc" },
    take: 50,
    select: {
      id: true,
      url: true,
      overallScore: true,
      trustScore: true,
      uxScore: true,
      seoScore: true,
      mobileScore: true,
      revenueOpportunity: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#09090b]">
      <nav className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">AuditRoast</span>
          </Link>
          <Link href="/sign-up">
            <Button variant="gradient" size="sm">Audit My Site Free</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-1.5 text-sm text-yellow-300 mb-6">
            <Trophy className="w-4 h-4" /> Top Converting Websites
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Conversion <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            The highest-scoring websites as rated by our AI. Share your audit to appear here.
          </p>
        </div>

        {audits.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No public audits yet. Be the first!</div>
        ) : (
          <div className="space-y-3">
            {audits.map((audit, i) => (
              <Link key={audit.id} href={`/audit/${audit.id}`}>
                <Card className="hover:border-violet-500/30 transition-all cursor-pointer group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-8 text-center shrink-0">
                      {i === 0 ? <span className="text-2xl">🥇</span>
                        : i === 1 ? <span className="text-2xl">🥈</span>
                        : i === 2 ? <span className="text-2xl">🥉</span>
                        : <span className="text-gray-500 font-bold text-sm">#{i + 1}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="text-white font-medium text-sm truncate group-hover:text-violet-300 transition-colors">{audit.url}</span>
                      </div>
                      {audit.revenueOpportunity && (
                        <div className="text-xs text-green-400">+{formatCurrency(audit.revenueOpportunity)}/mo opportunity</div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {[
                        { label: "T", score: audit.trustScore },
                        { label: "UX", score: audit.uxScore },
                        { label: "SEO", score: audit.seoScore },
                        { label: "M", score: audit.mobileScore },
                      ].map((s) => s.score !== null && (
                        <div key={s.label} className="text-center hidden sm:block">
                          <div className="text-xs text-gray-500">{s.label}</div>
                          <div className="text-sm font-bold text-white">{s.score}</div>
                        </div>
                      ))}
                      <ScoreRing score={audit.overallScore ?? 0} label="Overall" size="sm" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Want to appear here?</h2>
          <p className="text-gray-400 mb-6">Run a free audit on your site and share the results to get on the leaderboard.</p>
          <Link href="/sign-up">
            <Button variant="gradient" size="lg">Get My Score →</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

