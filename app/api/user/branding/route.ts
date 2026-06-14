import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!["GROWTH", "AGENCY"].includes(dbUser.plan)) {
    return NextResponse.json({ error: "White-label requires Growth or Agency plan" }, { status: 403 });
  }

  const { agencyName, agencyLogo } = await req.json();
  await prisma.user.update({
    where: { id: dbUser.id },
    data: { agencyName: agencyName?.trim() || null, agencyLogo: agencyLogo?.trim() || null },
  });

  return NextResponse.json({ ok: true });
}
