import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeWebsite } from "@/lib/audit-engine";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (dbUser.plan !== "AGENCY") {
    return NextResponse.json({ error: "Bulk auditing requires Agency plan" }, { status: 403 });
  }

  const { urls } = await req.json() as { urls: string[] };
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "Provide an array of urls" }, { status: 400 });
  }
  if (urls.length > 20) {
    return NextResponse.json({ error: "Max 20 URLs per bulk request" }, { status: 400 });
  }

  const remaining = dbUser.auditsLimit === -1 ? urls.length : dbUser.auditsLimit - dbUser.auditsUsed;
  const toProcess = urls.slice(0, remaining);

  const results = await Promise.allSettled(
    toProcess.map(async (url: string) => {
      try { new URL(url); } catch { throw new Error(`Invalid URL: ${url}`); }

      const result = await analyzeWebsite(url);
      const audit = await prisma.audit.create({
        data: {
          userId: dbUser.id,
          url,
          status: "COMPLETE",
          overallScore: result.overallScore,
          trustScore: result.trustScore,
          uxScore: result.uxScore,
          seoScore: result.seoScore,
          mobileScore: result.mobileScore,
          revenueScore: result.revenueScore,
          revenueOpportunity: result.revenueOpportunity,
          findings: result.findings as unknown as never,
          recommendations: result.recommendations as unknown as never,
          roastContent: result.roastContent,
        },
      });
      return { url, auditId: audit.id, overallScore: audit.overallScore, status: "success" };
    })
  );

  if (toProcess.length > 0) {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { auditsUsed: { increment: toProcess.length } },
    });
  }

  const output = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { url: toProcess[i], status: "error", error: r.reason?.message }
  );

  return NextResponse.json({ results: output, skipped: urls.length - toProcess.length });
}
