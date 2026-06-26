import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serperKey = process.env.SERPER_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const groqKey = process.env.GROQ_API_KEY;

  const envCheck = {
    SERPER_API_KEY: serperKey ? `set (${serperKey.slice(0, 6)}...)` : "MISSING",
    SUPABASE_URL: supabaseUrl ? "set" : "MISSING",
    GROQ_API_KEY: groqKey ? `set (${groqKey.slice(0, 6)}...)` : "MISSING",
  };

  let searchTest: { ok: boolean; count?: number; error?: string } = { ok: false };
  if (serperKey) {
    try {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": serperKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q: "site:myshopify.com fitness UK", num: 5 }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      if (res.ok) {
        searchTest = { ok: true, count: data.organic?.length ?? 0 };
      } else {
        searchTest = { ok: false, error: `${res.status}: ${JSON.stringify(data)}` };
      }
    } catch (err) {
      searchTest = { ok: false, error: String(err) };
    }
  }

  return NextResponse.json({ envCheck, searchTest });
}
