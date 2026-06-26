import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type ProspectStatus = "pending" | "sent" | "replied";

export interface Prospect {
  id: string;
  brand_name: string;
  url: string;
  score: number | null;
  top_findings: Array<{ category: string; issue: string; fix: string; priority: string }> | null;
  generated_dm: string | null;
  status: ProspectStatus;
  created_at: string;
}
