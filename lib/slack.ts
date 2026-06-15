export async function sendSlackNotification(webhookUrl: string, text: string) {
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

export async function sendAuditSlackAlert({
  webhookUrl,
  url,
  overallScore,
  auditId,
  appUrl,
}: {
  webhookUrl: string;
  url: string;
  overallScore: number;
  auditId: string;
  appUrl: string;
}) {
  const emoji = overallScore >= 70 ? "✅" : overallScore >= 50 ? "⚠️" : "🔴";
  await sendSlackNotification(
    webhookUrl,
    `${emoji} *Audit complete for ${url}*\nScore: *${overallScore}/100* — <${appUrl}/dashboard/audit/${auditId}|View Report>`
  );
}

export async function sendWeeklySlackAlert({
  webhookUrl,
  url,
  currentScore,
  previousScore,
  auditId,
  appUrl,
}: {
  webhookUrl: string;
  url: string;
  currentScore: number;
  previousScore: number;
  auditId: string;
  appUrl: string;
}) {
  const diff = currentScore - previousScore;
  const trend = diff > 0 ? `📈 +${diff}` : diff < 0 ? `📉 ${diff}` : `➡️ no change`;
  await sendSlackNotification(
    webhookUrl,
    `🗓️ *Weekly audit for ${url}*\nScore: *${currentScore}/100* (${trend}) — <${appUrl}/dashboard/audit/${auditId}|View Report>`
  );
}
