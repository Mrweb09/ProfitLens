import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const audit = await prisma.audit.findFirst({
    where: { id, userId: dbUser.id },
  });

  if (!audit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(audit);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const audit = await prisma.audit.updateMany({
    where: { id, userId: dbUser.id },
    data: {
      isPublic: body.isPublic,
    },
  });

  return NextResponse.json({ success: true });
}
