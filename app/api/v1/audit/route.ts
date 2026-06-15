import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeWebsite } from "@/lib/audit-engine";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const key = authHeader?.replace("Bearer ", "").trim();

  if (!key) return NextResponse.json({ error: "Missing API key" }, { status: 401 });

  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: { user: true },
  });

  if (!apiKey) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

  const { user } = apiKey;

  if (user.auditsLimit !== -1 && user.auditsUsed >= user.auditsLimit) {
    return NextResponse.json({ error: "Audit limit reached" }, { status: 429 });
  }

  let url: string;
  try {
    const body = await req.json();
    url = body.url;
    if (!url) throw new Error("Missing url");
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid or missing url" }, { status: 400 });
  }

  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } });

  try {
    const result = await analyzeWebsite(url);

    const audit = await prisma.audit.create({
      data: {
        userId: user.id,
        url,
        status: "COMPLETE",
        overallScore: result.overallScore,
        trustScore: result.trustScore,
        uxScore: result.uxScore,
        seoScore: result.seoScore,
        mobileScore: result.mobileScore,
        revenueScore: result.revenueScore,
        monthlyVisitors: result.monthlyVisitors,
        currentConvRate: result.currentConvRate,
        potentialUplift: result.potentialUplift,
        revenueOpportunity: result.revenueOpportunity,
        findings: result.findings as unknown as never,
        recommendations: result.recommendations as unknown as never,
        roastContent: result.roastContent,
      },
    });

    await prisma.user.update({ where: { id: user.id }, data: { auditsUsed: { increment: 1 } } });

    return NextResponse.json({
      auditId: audit.id,
      url: audit.url,
      overallScore: audit.overallScore,
      trustScore: audit.trustScore,
      uxScore: audit.uxScore,
      seoScore: audit.seoScore,
      mobileScore: audit.mobileScore,
      revenueScore: audit.revenueScore,
      revenueOpportunity: audit.revenueOpportunity,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/audit/${audit.id}`,
    });
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
