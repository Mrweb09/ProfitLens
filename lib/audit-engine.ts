import { groq } from "./groq";

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AuditRoast/1.0)" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return `Could not fetch website (HTTP ${res.status})`;

    const html = await res.text();

    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1]?.trim()
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)?.[1]?.trim()
      ?? "";
    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).join(" | ");
    const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).slice(0, 8).join(" | ");
    const h3s = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).slice(0, 6).join(" | ");
    const buttons = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).slice(0, 10).join(" | ");
    const navLinks = [...html.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(t => t.length > 1 && t.length < 60).slice(0, 20).join(" | ");
    const inputs = [...html.matchAll(/<input[^>]*>/gi)].map(m => m[0].match(/placeholder=["']([^"']+)["']/i)?.[1] ?? m[0].match(/type=["']([^"']+)["']/i)?.[1] ?? "").filter(Boolean).slice(0, 10).join(" | ");
    const hasSSL = url.startsWith("https://");
    const formCount = (html.match(/<form/gi) ?? []).length;
    const imgAlts = [...html.matchAll(/<img[^>]*alt=["']([^"']+)["']/gi)].map(m => m[1].trim()).filter(Boolean).slice(0, 5).join(" | ");
    const metaViewport = /<meta[^>]*name=["']viewport["']/i.test(html) ? "Yes" : "No";

    const bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2500);

    return `
URL: ${url}
SSL/HTTPS: ${hasSSL ? "Yes" : "No"}
Title tag: ${title}
Meta description: ${metaDesc}
Viewport meta tag (mobile): ${metaViewport}
H1: ${h1s || "MISSING"}
H2s: ${h2s || "MISSING"}
H3s: ${h3s || "none found"}
Button text: ${buttons || "none found"}
Navigation links: ${navLinks || "none found"}
Form inputs (${formCount} form(s)): ${inputs || "none found"}
Image alt texts: ${imgAlts || "none found"}
Page text content: ${bodyText}
    `.trim();
  } catch {
    return `Failed to fetch ${url} — analyse based on URL only`;
  }
}

export interface ActionTask {
  title: string;
  detail: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  order: number;
}

export interface AuditFinding {
  category: string;
  issue: string;
  impact: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  fix: string;
  revenueImpact: string;
}

export interface AuditResult {
  overallScore: number;
  trustScore: number;
  uxScore: number;
  seoScore: number;
  mobileScore: number;
  revenueScore: number;
  monthlyVisitors: number;
  currentConvRate: number;
  potentialUplift: number;
  revenueOpportunity: number;
  findings: AuditFinding[];
  recommendations: AuditFinding[];
  roastContent: string;
}

export async function analyzeWebsite(url: string): Promise<AuditResult> {
  const pageContent = await fetchWebsiteContent(url);

  const prompt = `You are an expert conversion rate optimization (CRO) and UX analyst. Analyze the following website data scraped from: ${url}

REAL WEBSITE DATA:
${pageContent}

Based ONLY on the actual content above, provide a comprehensive conversion audit in the following exact JSON format (no markdown, just JSON). Be specific — reference actual headlines, button text, and content you can see in the data above:

{
  "overallScore": <0-100>,
  "trustScore": <0-100>,
  "uxScore": <0-100>,
  "seoScore": <0-100>,
  "mobileScore": <0-100>,
  "revenueScore": <0-100>,
  "monthlyVisitors": <estimated monthly visitors>,
  "currentConvRate": <estimated current conversion rate as decimal e.g. 0.02>,
  "potentialUplift": <potential conversion rate uplift as decimal e.g. 0.015>,
  "revenueOpportunity": <estimated additional monthly revenue in GBP>,
  "findings": [
    {
      "category": "<Homepage|Mobile|CTA|Trust|SEO|Navigation|Forms|Pricing|Social Proof|Speed>",
      "issue": "<clear description of the problem>",
      "impact": "<why this hurts conversions>",
      "priority": "<HIGH|MEDIUM|LOW>",
      "fix": "<exact actionable fix>",
      "revenueImpact": "<estimated revenue impact e.g. +£500/mo>"
    }
  ],
  "recommendations": [
    <top 5 recommendations in same format as findings>
  ],
  "roastContent": "<A brutally honest, direct, slightly humorous roast of the website's conversion problems. 3-4 paragraphs. Viral/shareable tone. Be specific about what's wrong.>"
}

Analyze these areas critically:
1. Homepage clarity - can visitors understand what you sell in 5 seconds?
2. Mobile responsiveness and experience
3. Calls-to-action - visibility, clarity, placement
4. Trust signals - reviews, testimonials, guarantees, security badges
5. Pricing visibility and clarity
6. Social proof - case studies, logos, reviews
7. Navigation friction - too many options?
8. Form friction - too many fields?
9. SEO fundamentals - meta tags, headings, page speed signals
10. Conversion bottlenecks - what's stopping visitors from converting?

Be specific, actionable, and honest. Generate at least 8 findings. The roast should be funny but accurate.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a world-class CRO expert and web analyst. You analyze websites and provide brutally honest, data-driven conversion audits. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0].message.content || "{}";

  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found in response");
    const result = JSON.parse(jsonMatch[0]);
    return result as AuditResult;
  } catch (err) {
    console.error("AI parse error:", err, "\nRaw response:", content.slice(0, 500));
    throw new Error("Failed to parse AI analysis response");
  }
}

export async function analyzeCompetitor(url: string): Promise<{
  overallScore: number;
  trustScore: number;
  uxScore: number;
  seoScore: number;
  mobileScore: number;
  analysis: Record<string, string>;
}> {
  const prompt = `Analyze the competitor website at: ${url}

Return ONLY valid JSON (no markdown):
{
  "overallScore": <0-100>,
  "trustScore": <0-100>,
  "uxScore": <0-100>,
  "seoScore": <0-100>,
  "mobileScore": <0-100>,
  "analysis": {
    "strengths": "<key strengths>",
    "weaknesses": "<key weaknesses>",
    "cta": "<CTA analysis>",
    "trust": "<trust signals analysis>",
    "mobile": "<mobile experience>",
    "seo": "<SEO analysis>"
  }
}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a CRO expert. Analyze websites and return only valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 1500,
  });

  const content = response.choices[0].message.content || "{}";
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  return JSON.parse(cleaned);
}

export async function generateActionPlan(url: string, findings: AuditFinding[]): Promise<ActionTask[]> {
  const prompt = `Based on this website audit for ${url}, create a prioritised action plan.

Findings:
${findings.slice(0, 8).map((f, i) => `${i + 1}. [${f.priority}] ${f.category}: ${f.issue} — Fix: ${f.fix}`).join("\n")}

Return ONLY a JSON array of action tasks (no markdown):
[
  {
    "title": "<short action title, e.g. 'Add trust badges above the fold'>",
    "detail": "<exactly what to do, step by step>",
    "priority": "<HIGH|MEDIUM|LOW>",
    "category": "<Design|Copy|Technical|SEO|Trust|Mobile>",
    "order": <1,2,3...>
  }
]

Generate 10-15 specific, actionable tasks ordered by priority and impact. Be very specific — not 'improve CTA' but 'Change the main button text from Submit to Get My Free Quote and make it orange'.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are a CRO expert. Return only valid JSON arrays." },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content || "[]";
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  return JSON.parse(cleaned);
}

export async function generateCompetitorGapReport(myUrl: string, competitorUrl: string, myScore: number, competitorScore: number): Promise<{ gaps: Array<{ area: string; theyDoBetter: string; howToCopy: string; impact: string }> }> {
  const prompt = `Compare these two websites and identify specific gaps:
- My site: ${myUrl} (score: ${myScore}/100)
- Competitor: ${competitorUrl} (score: ${competitorScore}/100)

Return ONLY valid JSON (no markdown):
{
  "gaps": [
    {
      "area": "<area e.g. Trust Signals>",
      "theyDoBetter": "<specific thing the competitor does better>",
      "howToCopy": "<exact steps to implement the same thing>",
      "impact": "<estimated revenue/conversion impact>"
    }
  ]
}

Identify 6-8 specific gaps where the competitor outperforms. Be very specific — name actual elements, copy, design choices.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are a CRO expert. Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content || "{}";
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  return JSON.parse(cleaned);
}

