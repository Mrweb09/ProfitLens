import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, url } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  try {
    await prisma.lead.create({ data: { email: email.toLowerCase().trim(), url } });
  } catch {
    // ignore duplicate
  }
  return NextResponse.json({ ok: true });
}
