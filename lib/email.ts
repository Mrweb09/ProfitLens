import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "AuditRoast <reports@AuditRoast.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://auditroast.com";

export async function sendAuditCompleteEmail({
  to,
  name,
  url,
  auditId,
  overallScore,
  revenueOpportunity,
  findings,
}: {
  to: string;
  name?: string | null;
  url: string;
  auditId: string;
  overallScore: number;
  revenueOpportunity?: number | null;
  findings?: Array<{ issue: string; priority: string }>;
}) {
  const topFindings = (findings ?? []).filter((f) => f.priority === "HIGH").slice(0, 3);
  const scoreColor = overallScore >= 70 ? "#22c55e" : overallScore >= 50 ? "#f59e0b" : "#ef4444";

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your audit is ready — ${url} scored ${overallScore}/100`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#09090b;font-family:helvetica,sans-serif;color:#e5e7eb;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="margin-bottom:32px;">
    <span style="font-size:22px;font-weight:800;color:#fff;">🔥 AuditRoast</span>
  </div>

  <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">Your audit is ready, ${name ?? "there"}!</h1>
  <p style="color:#9ca3af;margin:0 0 32px;">${url}</p>

  <div style="background:#1c1c22;border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
    <div style="font-size:14px;color:#9ca3af;margin-bottom:8px;">Overall Conversion Score</div>
    <div style="font-size:56px;font-weight:800;color:${scoreColor};">${overallScore}</div>
    <div style="font-size:14px;color:#6b7280;">out of 100</div>
  </div>

  ${revenueOpportunity ? `
  <div style="background:#0a2e1a;border:1px solid #166534;border-radius:12px;padding:20px;margin-bottom:24px;">
    <div style="font-size:13px;color:#4ade80;margin-bottom:4px;">💰 Revenue Opportunity</div>
    <div style="font-size:24px;font-weight:700;color:#fff;">+£${revenueOpportunity.toLocaleString()}/month if fixed</div>
  </div>
  ` : ""}

  ${topFindings.length > 0 ? `
  <div style="margin-bottom:24px;">
    <div style="font-size:15px;font-weight:600;color:#fff;margin-bottom:12px;">⚠️ Top Issues Found</div>
    ${topFindings.map((f) => `
    <div style="background:#1c1c22;border-left:3px solid #ef4444;border-radius:8px;padding:12px;margin-bottom:8px;">
      <div style="font-size:13px;color:#e5e7eb;">${f.issue}</div>
    </div>`).join("")}
  </div>
  ` : ""}

  <a href="${APP_URL}/dashboard/audit/${auditId}" style="display:block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-align:center;padding:16px;border-radius:12px;font-weight:700;text-decoration:none;font-size:16px;margin-bottom:32px;">
    View Full Report →
  </a>

  <p style="font-size:12px;color:#4b5563;text-align:center;">
    AuditRoast · <a href="${APP_URL}" style="color:#7c3aed;">AuditRoast.com</a>
  </p>
</div>
</body>
</html>`,
  });
}

export async function sendWeeklyScoreEmail({
  to,
  name,
  url,
  auditId,
  currentScore,
  previousScore,
}: {
  to: string;
  name?: string | null;
  url: string;
  auditId: string;
  currentScore: number;
  previousScore: number;
}) {
  const diff = currentScore - previousScore;
  const improved = diff > 0;
  const emoji = improved ? "📈" : diff < 0 ? "📉" : "➡️";
  const diffText = diff > 0 ? `+${diff}` : String(diff);

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${emoji} Weekly score update — ${url}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#09090b;font-family:helvetica,sans-serif;color:#e5e7eb;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="margin-bottom:32px;">
    <span style="font-size:22px;font-weight:800;color:#fff;">🔥 AuditRoast</span>
  </div>

  <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">Weekly Score Update</h1>
  <p style="color:#9ca3af;margin:0 0 32px;">${url}</p>

  <div style="background:#1c1c22;border-radius:16px;padding:24px;margin-bottom:24px;display:flex;justify-content:space-between;text-align:center;">
    <div style="flex:1;">
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Last Week</div>
      <div style="font-size:36px;font-weight:800;color:#9ca3af;">${previousScore}</div>
    </div>
    <div style="flex:1;border-left:1px solid #27272a;border-right:1px solid #27272a;">
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Change</div>
      <div style="font-size:36px;font-weight:800;color:${improved ? "#22c55e" : diff < 0 ? "#ef4444" : "#9ca3af"};">${diffText}</div>
    </div>
    <div style="flex:1;">
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">This Week</div>
      <div style="font-size:36px;font-weight:800;color:#fff;">${currentScore}</div>
    </div>
  </div>

  <p style="color:#9ca3af;margin-bottom:24px;">
    ${improved ? `🎉 Great work — your score improved by ${diff} points!` : diff < 0 ? `⚠️ Your score dropped by ${Math.abs(diff)} points. Check your latest audit for what changed.` : `Your score held steady this week.`}
  </p>

  <a href="${APP_URL}/dashboard/audit/${auditId}" style="display:block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-align:center;padding:16px;border-radius:12px;font-weight:700;text-decoration:none;font-size:16px;margin-bottom:32px;">
    View Latest Audit →
  </a>

  <p style="font-size:12px;color:#4b5563;text-align:center;">
    AuditRoast · <a href="${APP_URL}/dashboard" style="color:#7c3aed;">Manage email preferences</a>
  </p>
</div>
</body>
</html>`,
  });
}

