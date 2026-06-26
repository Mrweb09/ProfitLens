import { groq } from "@/lib/groq";
import type { AuditFinding } from "@/lib/audit-engine";

export async function generateDM(
  brandName: string,
  url: string,
  score: number,
  findings: AuditFinding[]
): Promise<string> {
  const topIssue = findings[0];
  const otherIssues = findings
    .slice(1, 3)
    .map((f) => f.issue)
    .join("; ");

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 300,
    temperature: 0.8,
    messages: [
      {
        role: "system",
        content: "You write casual, genuine Instagram DMs for outreach. Sound like a real person, not a bot or marketer.",
      },
      {
        role: "user",
        content: `Write a casual Instagram DM to ${brandName} (${url}).

Their website audit score: ${score}/100
Biggest problem found: [${topIssue?.category}] ${topIssue?.issue}
Suggested fix: ${topIssue?.fix}
Other issues spotted: ${otherIssues || "a few UX/conversion gaps"}

STRICT rules — breaking any of these ruins the message:
- The opening line must reference ONLY the exact problem listed above. Do not invent or assume anything else about the site.
- NEVER say "it's not clear what you sell" or "unclear value proposition" unless the biggest problem above explicitly says that. Use the EXACT issue described.
- Quote or closely paraphrase the actual finding — be specific, not generic
- Sound like a real person who genuinely looked at their site, not a bot
- Briefly mention you ran a full audit and found more issues
- Offer to send the full free report
- Soft CTA at the end — "want me to send it over?" or similar
- Under 150 words total
- No emojis at the start
- Conversational, not salesy`,
      },
    ],
  });

  return response.choices[0].message.content?.trim() ?? "";
}
