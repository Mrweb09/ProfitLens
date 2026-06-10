import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { analyzeCompetitor, generateCompetitorGapReport } from "@/lib/audit-engine";
import { z } from "zod";

const schema = z.object({
  auditId: z.string(),
  url: z.url(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { auditId, url } = parsed.data;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (dbUser.plan === "FREE") {
    return NextResponse.json({ error: "Upgrade to Starter to use competitor comparison" }, { status: 403 });
  }

  const audit = await prisma.audit.findFirst({
    where: { id: auditId, userId: dbUser.id },
  });
  if (!audit) return NextResponse.json({ error: "Audit not found" }, { status: 404 });

  const [result, gapReport] = await Promise.all([
    analyzeCompetitor(url),
    dbUser.plan === "AGENCY"
      ? generateCompetitorGapReport(audit.url, url, audit.overallScore ?? 0, 0)
      : Promise.resolve(null),
  ]);

  const competitor = await prisma.competitor.create({
    data: {
      auditId,
      url,
      overallScore: result.overallScore,
      trustScore: result.trustScore,
      uxScore: result.uxScore,
      seoScore: result.seoScore,
      mobileScore: result.mobileScore,
      analysis: result.analysis as unknown as never,
      gapReport: gapReport as unknown as never,
    },
  });

  return NextResponse.json(competitor);
}
