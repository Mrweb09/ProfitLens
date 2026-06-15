import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/audit/score-ring";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Globe, TrendingUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const audit = await prisma.audit.findFirst({ where: { id, isPublic: true, status: "COMPLETE" } });
  if (!audit) return {};
  const title = `${audit.url} scored ${audit.overallScore}/100 on conversion`;
  const description = `Revenue opportunity: ${formatCurrency(audit.revenueOpportunity ?? 0)}/month. ${audit.roastContent?.split("\n\n")[0]?.slice(0, 120) ?? ""}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://profitlens.com";
  const ogImage = `${appUrl}/api/og?url=${encodeURIComponent(audit.url)}&score=${audit.overallScore ?? 0}&trust=${audit.trustScore ?? 0}&ux=${audit.uxScore ?? 0}&seo=${audit.seoScore ?? 0}&mobile=${audit.mobileScore ?? 0}${audit.revenueOpportunity ? `&revenue=${Math.round(audit.revenueOpportunity)}` : ""}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: ogImage, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function PublicAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await prisma.audit.findFirst({
    where: { id, isPublic: true, status: "COMPLETE" },
  });

  if (!audit) notFound();

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Profitlens</span>
          </Link>
          <Link href="/sign-up">
            <Button variant="gradient" size="sm">Audit My Site Free</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">Shared Audit Report</Badge>
          <h1 className="text-3xl font-bold text-white mb-2">Conversion Audit</h1>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Globe className="w-4 h-4" />
            <span>{audit.url}</span>
          </div>
        </div>

        {/* Scores */}
        <Card className="mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="flex flex-col items-center">
                <ScoreRing score={audit.overallScore ?? 0} label="Overall Score" size="lg" />
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

        {/* Revenue */}
        {audit.revenueOpportunity && (
          <Card className="mb-6 border-green-500/30 bg-green-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-bold text-white">Revenue Opportunity</h2>
              </div>
              <div className="text-4xl font-extrabold gradient-text text-center py-2">
                +{formatCurrency(audit.revenueOpportunity)}/month
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roast only for public — findings gated */}
        <Tabs defaultValue="roast">
          <TabsList className="mb-6">
            <TabsTrigger value="roast">🔥 The Roast</TabsTrigger>
            <TabsTrigger value="findings">
              <Lock className="w-3 h-3 mr-1" /> Full Findings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roast">
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                  <Flame className="w-5 h-5" /> The Honest Roast
                </CardTitle>
              </CardHeader>
              <CardContent>
                {audit.roastContent?.split("\n\n").map((para: string, i: number) => (
                  <p key={i} className="text-gray-300 leading-relaxed mb-4 last:mb-0">{para}</p>
                ))}
              </CardContent>
            </Card>

            {/* Social share + lead capture */}
            <div className="mt-4 flex gap-3 justify-center flex-wrap">
              {(() => {
                const auditUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://profitlens.com"}/audit/${audit.id}`;
                const tweet = `I just roasted my website with AI and scored ${audit.overallScore}/100 🔥\n\nHere's exactly what's killing my conversions:\n${auditUrl}`;
                return (
                  <>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        𝕏 Tweet my score
                      </Button>
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(auditUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        in Share on LinkedIn
                      </Button>
                    </a>
                  </>
                );
              })()}
            </div>

            <div className="mt-6 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="font-bold text-white text-lg mb-1">Want us to roast YOUR website?</div>
                <div className="text-gray-400 text-sm">Get a free audit and see exactly why visitors aren&apos;t converting — and how to fix it.</div>
              </div>
              <Link href="/sign-up" className="shrink-0">
                <Button variant="gradient" size="lg">Get My Free Audit</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="findings">
            <Card>
              <CardContent className="p-10 text-center">
                <Lock className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Full Report Locked</h3>
                <p className="text-gray-400 mb-6">Sign up for free to get your own full audit with all the findings, exact fixes, and your revenue opportunity.</p>
                <Link href="/sign-up">
                  <Button variant="gradient" size="lg">Get Your Free Audit →</Button>
                </Link>
                <p className="text-xs text-gray-600 mt-3">Free plan includes 1 audit. No credit card required.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
