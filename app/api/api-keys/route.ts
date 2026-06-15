import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, key: true, lastUsed: true, createdAt: true },
  });

  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (dbUser.plan === "FREE" || dbUser.plan === "STARTER") {
    return NextResponse.json({ error: "API access requires Growth or Agency plan" }, { status: 403 });
  }

  const existing = await prisma.apiKey.count({ where: { userId: dbUser.id } });
  const limit = dbUser.plan === "AGENCY" ? 10 : 3;
  if (existing >= limit) {
    return NextResponse.json({ error: `Max ${limit} API keys for your plan` }, { status: 400 });
  }

  const { name } = await req.json();
  const key = `pl_live_${randomBytes(24).toString("hex")}`;

  const apiKey = await prisma.apiKey.create({
    data: { userId: dbUser.id, name: name || "Default", key },
    select: { id: true, name: true, key: true, createdAt: true },
  });

  return NextResponse.json({ apiKey });
}
