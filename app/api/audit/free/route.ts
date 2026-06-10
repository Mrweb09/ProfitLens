import { NextRequest, NextResponse } from "next/server";
import { analyzeWebsite } from "@/lib/audit-engine";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  url: z.url(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";

  const existing = await prisma.freeAuditLog.findUnique({ where: { ip } });
  if (existing) {
    return NextResponse.json({ error: "You've already used your free audit. Sign up for more." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid URL" }, { status: 400 });
  }

  try {
    await prisma.freeAuditLog.create({ data: { ip } });
    const result = await analyzeWebsite(parsed.data.url);
    return NextResponse.json(result);
  } catch {
    await prisma.freeAuditLog.delete({ where: { ip } }).catch(() => null);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
