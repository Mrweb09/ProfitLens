import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { ProspectsClient } from "./prospects-client";
import type { Prospect } from "@/lib/supabase-client";
import { Users } from "lucide-react";

export default async function ProspectsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const { data: prospects } = await supabase
    .from("prospects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const stats = {
    total: prospects?.length ?? 0,
    pending: prospects?.filter((p) => p.status === "pending").length ?? 0,
    sent: prospects?.filter((p) => p.status === "sent").length ?? 0,
    replied: prospects?.filter((p) => p.status === "replied").length ?? 0,
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-violet-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Outreach Prospects</h1>
        </div>
        <p className="text-gray-400 mb-8">
          Auto-generated leads with personalised DMs. Pipeline runs daily at 8am.
        </p>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Pending", value: stats.pending, color: "text-yellow-400" },
            { label: "Sent", value: stats.sent, color: "text-violet-400" },
            { label: "Replied", value: stats.replied, color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <ProspectsClient initialProspects={(prospects ?? []) as Prospect[]} />
      </div>
    </div>
  );
}
