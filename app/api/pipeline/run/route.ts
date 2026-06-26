import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { runOutreachPipeline } from "@/lib/pipeline/outreach-pipeline";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Run pipeline in background so cron doesn't timeout
  waitUntil(
    runOutreachPipeline(30).then((result) => {
      console.log("[Cron] Pipeline complete:", result);
    })
  );

  return NextResponse.json({ message: "Pipeline started in background" });
}

// Allow manual trigger from dashboard
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const count = body.count ?? 10;

  waitUntil(
    runOutreachPipeline(count).then((result) => {
      console.log("[Manual] Pipeline complete:", result);
    })
  );

  return NextResponse.json({ message: `Pipeline started for ${count} prospects` });
}
