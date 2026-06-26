import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  const supabaseUrl = process.env.SUPABASE_URL;
  const groqKey = process.env.GROQ_API_KEY;

  const envCheck = {
    GOOGLE_CUSTOM_SEARCH_API_KEY: apiKey ? `set (${apiKey.slice(0, 6)}...)` : "MISSING",
    GOOGLE_SEARCH_CX: cx ? `set (${cx})` : "MISSING",
    SUPABASE_URL: supabaseUrl ? "set" : "MISSING",
    GROQ_API_KEY: groqKey ? `set (${groqKey.slice(0, 6)}...)` : "MISSING",
  };

  // Test one Google search if keys are present
  let searchTest: { ok: boolean; count?: number; error?: string } = { ok: false };
  if (apiKey && cx) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent("site:myshopify.com fitness UK")}&num=5`,
        { signal: AbortSignal.timeout(10000) }
      );
      const data = await res.json();
      if (res.ok) {
        searchTest = { ok: true, count: data.items?.length ?? 0 };
      } else {
        searchTest = { ok: false, error: `${res.status}: ${JSON.stringify(data.error)}` };
      }
    } catch (err) {
      searchTest = { ok: false, error: String(err) };
    }
  }

  return NextResponse.json({ envCheck, searchTest });
}
