import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeWebsite } from "@/lib/audit-engine";
import { sendWeeklyScoreEmail } from "@/lib/email";
import { sendWeeklySlackAlert } from "@/lib/slack";

type WatchedWithUser = {
  url: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    auditsUsed: number;
    auditsLimit: number;
    slackWebhookUrl?: string | null;
  };
};

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const watchedUrls = await prisma.watchedUrl.findMany({
    include: { user: true },
  }) as WatchedWithUser[];

  const results = await Promise.allSettled(
    watchedUrls.map(async (watched: WatchedWithUser) => {
      const { user, url } = watched;

      if (user.auditsLimit !== -1 && user.auditsUsed >= user.auditsLimit) return;

      const previous = await prisma.scoreHistory.findFirst({
        where: { userId: user.id, url },
        orderBy: { createdAt: "desc" },
      });

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

      await prisma.scoreHistory.create({
        data: {
          userId: user.id,
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

      await prisma.user.update({
        where: { id: user.id },
        data: { auditsUsed: { increment: 1 } },
      });

      await sendWeeklyScoreEmail({
        to: user.email,
        name: user.name,
        url,
        auditId: audit.id,
        currentScore: result.overallScore,
        previousScore: previous?.overallScore ?? result.overallScore,
      });

      if (user.slackWebhookUrl) {
        await sendWeeklySlackAlert({
          webhookUrl: user.slackWebhookUrl,
          url,
          currentScore: result.overallScore,
          previousScore: previous?.overallScore ?? result.overallScore,
          auditId: audit.id,
          appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://AuditRoast.com",
        }).catch(() => null);
      }
    })
  );

  const succeeded = results.filter((r: PromiseSettledResult<unknown>) => r.status === "fulfilled").length;
  const failed = results.filter((r: PromiseSettledResult<unknown>) => r.status === "rejected").length;

  return NextResponse.json({ processed: watchedUrls.length, succeeded, failed });
}

