import type { AuditFinding } from "@/lib/audit-engine";

export async function generateDM(
  _brandName: string,
  _url: string,
  _score: number,
  findings: AuditFinding[]
): Promise<string> {
  const topIssue = findings[0];
  if (!topIssue) return "";

  // Lowercase the issue and trim trailing punctuation for natural flow
  const issue = topIssue.issue.replace(/\.$/, "").toLowerCase();

  return `hey, just had a look at your site - noticed ${issue}. ran a full audit on it and found a few other things that could be improved too. want me to send it over? it's free`;
}
