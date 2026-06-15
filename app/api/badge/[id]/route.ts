import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const audit = await prisma.audit.findFirst({
    where: { id, isPublic: true, status: "COMPLETE" },
    select: { overallScore: true, url: true },
  });

  if (!audit || audit.overallScore === null) {
    return new NextResponse("Not found", { status: 404 });
  }

  const score = audit.overallScore;
  const color = score >= 70 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
  const label = score >= 70 ? "Good" : score >= 50 ? "Needs Work" : "Critical";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f0a1a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="40" rx="8" fill="url(#bg)" stroke="rgba(124,58,237,0.4)" stroke-width="1"/>
  <text x="12" y="15" font-family="sans-serif" font-size="10" fill="rgba(255,255,255,0.5)">Audited by Profitlens</text>
  <text x="12" y="31" font-family="sans-serif" font-size="12" font-weight="bold" fill="white">Score: </text>
  <text x="53" y="31" font-family="sans-serif" font-size="12" font-weight="bold" fill="${color}">${score}/100 — ${label}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
