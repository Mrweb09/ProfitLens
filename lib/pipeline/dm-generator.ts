import Anthropic from "@anthropic-ai/sdk";
import type { AuditFinding } from "@/lib/audit-engine";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

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

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Write a casual Instagram DM to ${brandName} (${url}).

Their website audit score: ${score}/100
Biggest problem found: [${topIssue?.category}] ${topIssue?.issue}
Suggested fix: ${topIssue?.fix}
Other issues spotted: ${otherIssues || "a few UX/conversion gaps"}

Rules:
- Open with their specific problem — not "love your brand" or generic flattery
- Sound like a real person who genuinely looked at their site, not a bot
- Mention one specific thing you noticed (use the biggest problem above)
- Briefly mention you ran a full audit and found more
- Offer to send the full free report
- Soft CTA at the end — "want me to send it over?" or similar
- Under 150 words total
- No emojis at the start
- Conversational, not salesy`,
      },
    ],
  });

  return (response.content[0] as { text: string }).text.trim();
}
