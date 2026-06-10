import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const count = await prisma.audit.count({ where: { status: "COMPLETE" } });
  return NextResponse.json({ count });
}
