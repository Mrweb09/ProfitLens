import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { analyzeWebsite, generateActionPlan } from "@/lib/audit-engine";
import { sendAuditCompleteEmail } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  url: z.url(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = (() => { try { return (JSON.parse(parsed.error.message) as Array<{message: string}>)[0]?.message; } catch { return "Invalid URL"; } })();
    return NextResponse.json({ error: msg ?? "Invalid input" }, { status: 400 });
  }

  const { url } = parsed.data;

  let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found. Please refresh the page." }, { status: 404 });
  }

  if (dbUser.auditsLimit !== -1 && dbUser.auditsUsed >= dbUser.auditsLimit) {
    return NextResponse.json({ error: "Audit limit reached. Please upgrade your plan." }, { status: 403 });
  }

  const audit = await prisma.audit.create({
    data: { userId: dbUser.id, url, status: "ANALYZING" },
  });

  (async () => {
    try {
      const result = await analyzeWebsite(url);

      await prisma.audit.update({
        where: { id: audit.id },
        data: {
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

      // Save score history for tracking
      await prisma.scoreHistory.create({
        data: {
          userId: dbUser!.id,
          url,
          auditId: audit.id,
          overallScore: result.overallScore,
          trustScore: result.trustScore,
          uxScore: result.uxScore,
          seoScore: result.seoScore,
          mobileScore: result.mobileScore,
          revenueScore: result.revenueScore,
        },
      });

      // Send audit complete email
      if (dbUser!.email) {
        sendAuditCompleteEmail({
          to: dbUser!.email,
          name: dbUser!.name,
          url,
          auditId: audit.id,
          overallScore: result.overallScore,
          revenueOpportunity: result.revenueOpportunity,
          findings: result.findings,
        }).catch(() => null);
      }

      // Generate action plan
      const tasks = await generateActionPlan(url, result.findings);
      await prisma.actionItem.createMany({
        data: tasks.map((t: { title: string; detail: string; priority: string; category: string; order: number }) => ({
          auditId: audit.id,
          title: t.title,
          detail: t.detail,
          priority: t.priority,
          category: t.category,
          order: t.order,
        })),
      });

      await prisma.user.update({
        where: { id: dbUser!.id },
        data: { auditsUsed: { increment: 1 } },
      });
    } catch (err) {
      console.error("Audit failed:", err);
      await prisma.audit.update({
        where: { id: audit.id },
        data: { status: "FAILED" },
      });
    }
  })();

  return NextResponse.json({ id: audit.id });
}
