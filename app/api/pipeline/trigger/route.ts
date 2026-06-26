import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { waitUntil } from "@vercel/functions";
import { runOutreachPipeline } from "@/lib/pipeline/outreach-pipeline";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const count = body.count ?? 10;

  waitUntil(
    runOutreachPipeline(count).then((result) => {
      console.log("[Manual] Pipeline complete:", result);
    })
  );

  return NextResponse.json({ message: `Pipeline started — finding ${count} prospects in the background` });
}
