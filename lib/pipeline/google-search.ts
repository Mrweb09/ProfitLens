export interface ProspectCandidate {
  brandName: string;
  url: string;
}

const QUERIES = [
  "site:myshopify.com fitness UK",
  "site:myshopify.com clothing UK",
  "site:myshopify.com beauty UK",
  "site:myshopify.com supplements UK",
  "site:myshopify.com accessories UK",
  "site:myshopify.com jewellery UK",
  "site:myshopify.com homeware UK",
  "site:myshopify.com skincare UK",
  "site:myshopify.com activewear UK",
  "site:myshopify.com pet UK",
];

function extractBrandName(title: string, domain: string): string {
  const fromTitle = title.split("|")[0].split("–")[0].split("-")[0].trim();
  if (fromTitle && fromTitle.length > 1 && fromTitle.length < 60) return fromTitle;
  return domain
    .replace(".myshopify.com", "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function searchShopifyStores(count = 30): Promise<ProspectCandidate[]> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) throw new Error("Missing GOOGLE_CUSTOM_SEARCH_API_KEY or GOOGLE_SEARCH_CX");

  const results: ProspectCandidate[] = [];
  const seen = new Set<string>();
  const shuffled = [...QUERIES].sort(() => Math.random() - 0.5);

  for (const query of shuffled) {
    if (results.length >= count) break;

    try {
      const res = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10`,
        { signal: AbortSignal.timeout(10000) }
      );

      if (!res.ok) {
        console.error(`Google search failed for "${query}": ${res.status}`);
        continue;
      }

      const data = await res.json();
      if (!data.items) continue;

      for (const item of data.items as Array<{ link: string; title: string }>) {
        if (results.length >= count) break;
        try {
          const parsed = new URL(item.link);
          const domain = parsed.hostname;
          if (!domain.includes("myshopify.com")) continue;
          const cleanUrl = `https://${domain}`;
          if (seen.has(cleanUrl)) continue;
          seen.add(cleanUrl);
          results.push({ brandName: extractBrandName(item.title, domain), url: cleanUrl });
        } catch {
          continue;
        }
      }

      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`Search query failed: ${query}`, err);
    }
  }

  return results;
}
