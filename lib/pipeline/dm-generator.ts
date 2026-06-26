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
        content: "You write short, punchy Instagram DMs that sound like a real 20-something texting a brand. No corporate speak. No full sentences where a fragment works. Think casual friend, not marketer.",
      },
      {
        role: "user",
        content: `Write an Instagram DM to ${brandName}.

The specific problem found on their site: ${topIssue?.issue}

Write it like this example style (do NOT copy this, just match the tone and length):
"hey just had a look at your site - noticed [specific thing]. ran a full audit on it and spotted a few other things too. want me to send it over? it's free"

Rules:
- Max 3-4 sentences. Short. Punchy.
- Start with "hey" — lowercase, casual
- Reference ONLY the exact problem above — do not invent anything
- Do NOT explain what a value proposition is, do NOT use corporate words like "visitors", "UX", "conversion", "optimise"
- Mention you ran a full audit and found more
- End with a soft CTA like "want me to send it over? free btw" or similar
- Sound like a real person texting, not a tool or agency`,
      },
    ],
  });

  return response.choices[0].message.content?.trim() ?? "";
}
