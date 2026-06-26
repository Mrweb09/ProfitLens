import { groq } from "./groq";

function extractMetadata(html: string, url: string): string {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "";

  const metaDesc =
    html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']{1,500})["']/i)?.[1]?.trim() ??
    html.match(/<meta[^>]+content=["']([^"']{1,500})["'][^>]*name=["']description["']/i)?.[1]?.trim() ??
    "";

  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1]?.trim() ?? "";
  const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1]?.trim() ?? "";
  const ogType = html.match(/<meta[^>]+property=["']og:type["'][^>]*content=["']([^"']+)["']/i)?.[1]?.trim() ?? "";

  const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]?.trim() ?? "";
  const robots = html.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1]?.trim() ?? "";
  const isNoindex = robots.toLowerCase().includes("noindex");

  // Schema.org type from JSON-LD
  let schemaType = "";
  const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const schema = JSON.parse(jsonLdMatch[1]);
      schemaType = (Array.isArray(schema) ? schema[0]?.["@type"] : schema["@type"]) ?? "";
    } catch { /* ignore malformed JSON-LD */ }
  }

  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).slice(0, 3).join(" | ");

  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).slice(0, 5).join(" | ");

  const buttons = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, "").trim()).filter(Boolean).slice(0, 8).join(" | ");

  const formCount = (html.match(/<form/gi) ?? []).length;
  const inputCount = (html.match(/<input/gi) ?? []).length;

  const imgTags = [...html.matchAll(/<img[^>]*>/gi)];
  const imgsWithoutAlt = imgTags.filter(m => !/alt=["'][^"']+["']/i.test(m[0])).length;

  const scriptCount = (html.match(/<script/gi) ?? []).length;
  const hasHTTPS = url.startsWith("https://");

  return `Title: ${title || "MISSING"}
Meta description: ${metaDesc || "MISSING — hurts SEO click-through"}
OG title: ${ogTitle || "not set"}
OG description: ${ogDesc || "not set"}
OG type: ${ogType || "not set"}
Canonical URL: ${canonical || "not set"}
Schema.org type: ${schemaType || "none detected"}
Robots meta: ${robots || "not set"}${isNoindex ? " ⚠️ NOINDEX — page won't rank" : ""}
HTTPS: ${hasHTTPS ? "Yes" : "NO — critical security issue"}
Viewport meta: ${hasViewport ? "Yes" : "MISSING — mobile experience will be broken"}
H1 tags: ${h1s || "MISSING — SEO critical"}
H2 tags (first 5): ${h2s || "none found"}
Button/CTA text: ${buttons || "none detected in raw HTML"}
Forms: ${formCount}, Input fields: ${inputCount}
Images without alt text: ${imgsWithoutAlt} of ${imgTags.length} total
Script tags: ${scriptCount}`;
}

function detectSiteContext(content: string, url: string): { type: string; industry: string; sizeHint: string } {
  const c = content.toLowerCase();
  const domain = url.replace(/https?:\/\//i, "").split("/")[0].toLowerCase();

  const knownLarge = ["amazon", "asos", "nike", "apple", "ebay", "walmart", "primark", "gymshark", "myprotein", "zara", "h&m", "boohoo", "pretty little thing", "adidas", "argos", "currys", "john lewis", "next.co"];
  const isLarge = knownLarge.some(s => domain.includes(s));

  let type = "business website";
  let industry = "general";

  if (c.includes("add to cart") || c.includes("add to bag") || c.includes("buy now") || c.includes("shopping bag") || c.includes("basket") || c.includes("free delivery") || c.includes("free returns")) {
    type = "ecommerce";
    if (c.includes("fashion") || c.includes("clothing") || c.includes("apparel") || c.includes("outfit") || c.includes("wear") || c.includes("dress") || c.includes("shoes")) industry = "fashion & apparel";
    else if (c.includes("supplement") || c.includes("protein") || c.includes("fitness") || c.includes("gym") || c.includes("workout")) industry = "health & fitness";
    else if (c.includes("electronics") || c.includes("laptop") || c.includes("phone") || c.includes("tech")) industry = "electronics & tech";
    else if (c.includes("beauty") || c.includes("skincare") || c.includes("makeup") || c.includes("cosmetic")) industry = "beauty & cosmetics";
    else industry = "retail / ecommerce";
  } else if ((c.includes("sign up") || c.includes("get started") || c.includes("free trial") || c.includes("start for free")) && (c.includes("per month") || c.includes("/mo") || c.includes("pricing") || c.includes("subscription") || c.includes("plan"))) {
    type = "saas";
    industry = "software as a service";
  } else if (c.includes("book") && (c.includes("appointment") || c.includes("consultation") || c.includes("session"))) {
    type = "service-business";
    industry = "professional services / bookings";
  } else if (c.includes("get a quote") || c.includes("request a quote") || c.includes("our services") || c.includes("contact us today")) {
    type = "service-business";
    industry = "B2B / professional services";
  } else if (c.includes("restaurant") || c.includes("menu") || c.includes("reservation") || c.includes("dine") || c.includes("table")) {
    type = "local-business";
    industry = "food & dining";
  }

  return {
    type,
    industry,
    sizeHint: isLarge ? "large enterprise (millions of monthly visitors, major brand)" : "unknown — estimate based on domain and content",
  };
}

async function fetchWebsiteContent(url: string): Promise<{ content: string; siteContext: ReturnType<typeof detectSiteContext> }> {
  let jinaContent = "";
  try {
    const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        "Accept": "text/plain",
        "User-Agent": "Mozilla/5.0 (compatible; AuditRoast/1.0)",
        "X-Return-Format": "markdown",
      },
      signal: AbortSignal.timeout(20000),
    });
    if (jinaRes.ok) {
      jinaContent = (await jinaRes.text()).slice(0, 6000);
    }
  } catch { /* fall through */ }

  let metaData = "";
  try {
    const rawRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AuditRoast/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (rawRes.ok) {
      metaData = extractMetadata(await rawRes.text(), url);
    }
  } catch { /* ignore */ }

  const siteContext = detectSiteContext(jinaContent, url);

  if (!jinaContent && !metaData) {
    return {
      content: `Failed to fetch ${url} — analyse based on URL only`,
      siteContext,
    };
  }

  const content = `URL: ${url}

--- VERIFIED TECHNICAL METADATA (extracted from real HTML) ---
${metaData || "Could not extract — site may be fully JS-rendered"}

--- RENDERED PAGE CONTENT (markdown via Jina Reader — what visitors actually see) ---
${jinaContent || "Could not render page content"}`.trim();

  return { content, siteContext };
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
  const { content: pageContent, siteContext } = await fetchWebsiteContent(url);

  const siteTypeInstructions: Record<string, string> = {
    ecommerce: "Focus on: product page quality, checkout friction, cart abandonment signals, delivery/returns clarity, product images & descriptions, reviews/ratings visibility, upsells, trust badges near checkout. Do NOT suggest contact forms or appointment booking.",
    saas: "Focus on: value proposition clarity (can I understand it in 5 seconds?), free trial friction, feature explanation, pricing page clarity, social proof (logos, testimonials, case studies), onboarding flow. Do NOT suggest adding product pages or shopping carts.",
    "service-business": "Focus on: trust signals (credentials, reviews, years in business), contact/booking friction, testimonials, pricing transparency, local SEO signals, clear service descriptions, portfolio/case studies.",
    "local-business": "Focus on: NAP (name/address/phone) visibility, Google Maps, opening hours, local reviews, mobile click-to-call, clear location info.",
    "business website": "Focus on: value proposition, CTA clarity, trust signals, contact friction, and lead generation.",
  };

  const typeInstructions = siteTypeInstructions[siteContext.type] ?? siteTypeInstructions["business website"];

  const prompt = `You are an expert conversion rate optimization (CRO) and UX analyst. Analyze the following website data from: ${url}

SITE CONTEXT — use this to make findings relevant:
- Site type: ${siteContext.type}
- Industry: ${siteContext.industry}
- Size: ${siteContext.sizeHint}
- Type-specific focus: ${typeInstructions}

CRITICAL RULES — follow exactly:
- Base ALL findings ONLY on what is present or absent in the verified data below
- NEVER flag something as missing if it appears in the content or technical metadata
- If Title, H1, or meta description are shown as present above, do NOT say they are missing
- Quote actual headlines, button text, or copy from the page to support your findings
- Be specific and factual — no generic advice that could apply to any website
- ALL findings must be relevant to a ${siteContext.type} in the ${siteContext.industry} industry
- For large/enterprise sites: acknowledge their scale, focus on incremental improvements and missed opportunities at scale
- Revenue estimates must be realistic for the site's size and industry

REAL WEBSITE DATA:
${pageContent}

Provide a comprehensive conversion audit in the following exact JSON format (no markdown, just JSON):

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

