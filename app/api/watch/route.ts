import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  const existing = await prisma.watchedUrl.findUnique({
    where: { userId_url: { userId: dbUser.id, url } },
  });

  if (existing) {
    await prisma.watchedUrl.delete({ where: { id: existing.id } });
    return NextResponse.json({ watching: false });
  } else {
    await prisma.watchedUrl.create({ data: { userId: dbUser.id, url } });
    return NextResponse.json({ watching: true });
  }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ watching: false });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ watching: false });

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ watching: false });

  const existing = await prisma.watchedUrl.findUnique({
    where: { userId_url: { userId: dbUser.id, url } },
  });

  return NextResponse.json({ watching: !!existing });
}
