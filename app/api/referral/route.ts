import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (dbUser.referralCode) {
    return NextResponse.json({ referralCode: dbUser.referralCode });
  }

  const referralCode = randomBytes(4).toString("hex").toUpperCase();
  const updated = await prisma.user.update({
    where: { id: dbUser.id },
    data: { referralCode },
    select: { referralCode: true },
  });

  return NextResponse.json({ referralCode: updated.referralCode });
}
