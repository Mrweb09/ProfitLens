import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { groq } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { auditId, question, history } = await req.json();

  const audit = await prisma.audit.findFirst({
    where: { id: auditId, userId: dbUser.id },
  });
  if (!audit) return NextResponse.json({ error: "Audit not found" }, { status: 404 });

  const context = `
Website: ${audit.url}
Overall Score: ${audit.overallScore}/100
Trust: ${audit.trustScore} | UX: ${audit.uxScore} | SEO: ${audit.seoScore} | Mobile: ${audit.mobileScore}
Revenue Opportunity: £${audit.revenueOpportunity?.toLocaleString()}/month
Key findings: ${JSON.stringify(audit.findings)?.slice(0, 1500)}
`;

  const messages = [
    {
      role: "system" as const,
      content: `You are a conversion rate optimization expert helping a business owner understand their website audit results. Be specific, practical, and concise. Always refer to their actual audit data.

Audit Context:
${context}`,
    },
    ...(history || []),
    { role: "user" as const, content: question },
  ];

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.6,
    max_tokens: 800,
  });

  return NextResponse.json({ answer: response.choices[0].message.content });
}
