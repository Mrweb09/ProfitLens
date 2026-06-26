import { searchShopifyStores } from "./google-search";
import { generateDM } from "./dm-generator";
import { analyzeWebsite } from "@/lib/audit-engine";
import { supabase } from "@/lib/supabase-client";

export interface PipelineResult {
  added: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export async function runOutreachPipeline(count = 30): Promise<PipelineResult> {
  const result: PipelineResult = { added: 0, skipped: 0, failed: 0, errors: [] };

  // 1. Find prospects
  console.log(`[Pipeline] Searching for ${count} Shopify stores...`);
  let prospects;
  try {
    prospects = await searchShopifyStores(count);
  } catch (err) {
    result.errors.push(`Search failed: ${err}`);
    return result;
  }
  console.log(`[Pipeline] Found ${prospects.length} candidates`);

  // 2. Process each prospect
  for (const prospect of prospects) {
    try {
      // Skip if already exists
      const { data: existing } = await supabase
        .from("prospects")
        .select("id")
        .eq("url", prospect.url)
        .maybeSingle();

      if (existing) {
        result.skipped++;
        continue;
      }

      // Run audit
      console.log(`[Pipeline] Auditing ${prospect.url}...`);
      const audit = await analyzeWebsite(prospect.url);

      // Generate DM
      console.log(`[Pipeline] Generating DM for ${prospect.brandName}...`);
      const dm = await generateDM(
        prospect.brandName,
        prospect.url,
        audit.overallScore,
        audit.findings
      );

      // Save to Supabase
      const { error } = await supabase.from("prospects").insert({
        brand_name: prospect.brandName,
        url: prospect.url,
        score: audit.overallScore,
        top_findings: audit.findings.slice(0, 3).map((f) => ({
          category: f.category,
          issue: f.issue,
          fix: f.fix,
          priority: f.priority,
        })),
        generated_dm: dm,
        status: "pending",
      });

      if (error) throw error;

      result.added++;
      console.log(`[Pipeline] ✓ Added ${prospect.brandName} (score: ${audit.overallScore})`);

      // Delay between prospects to avoid API rate limits
      await new Promise((r) => setTimeout(r, 3000));
    } catch (err) {
      const msg = `${prospect.url}: ${err}`;
      console.error(`[Pipeline] ✗ ${msg}`);
      result.errors.push(msg);
      result.failed++;
    }
  }

  console.log(`[Pipeline] Done — added: ${result.added}, skipped: ${result.skipped}, failed: ${result.failed}`);
  return result;
}
