"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, CheckCheck, Send, MessageSquare, ExternalLink } from "lucide-react";
import type { Prospect } from "@/lib/supabase-client";

function StatusBadge({ status }: { status: string }) {
  if (status === "replied") return <Badge variant="success">Replied</Badge>;
  if (status === "sent") return <Badge variant="warning">Sent</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

function ProspectCard({ prospect, onStatusChange }: {
  prospect: Prospect;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function updateStatus(status: string) {
    setUpdating(true);
    await fetch(`/api/pipeline/prospects/${prospect.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onStatusChange(prospect.id, status);
    setUpdating(false);
  }

  async function copyDM() {
    if (!prospect.generated_dm) return;
    await navigator.clipboard.writeText(prospect.generated_dm);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const scoreColor =
    (prospect.score ?? 0) >= 70 ? "text-green-400" :
    (prospect.score ?? 0) >= 50 ? "text-yellow-400" : "text-red-400";

  return (
    <Card className="hover:border-violet-500/20 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-white">{prospect.brand_name}</span>
              <StatusBadge status={prospect.status} />
              {prospect.score !== null && (
                <span className={`text-sm font-bold ${scoreColor}`}>{prospect.score}/100</span>
              )}
            </div>
            <a
              href={prospect.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-violet-400 flex items-center gap-1"
            >
              {prospect.url} <ExternalLink className="w-3 h-3" />
            </a>

            {prospect.top_findings && prospect.top_findings.length > 0 && (
              <div className="mt-2 text-xs text-gray-400">
                <span className="text-red-400 font-medium">#{1} issue:</span>{" "}
                {prospect.top_findings[0].issue}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {prospect.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus("sent")}
                disabled={updating}
                className="text-xs"
              >
                <Send className="w-3 h-3" /> Mark Sent
              </Button>
            )}
            {prospect.status === "sent" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus("replied")}
                disabled={updating}
                className="text-xs text-green-400 border-green-400/30"
              >
                <MessageSquare className="w-3 h-3" /> Got Reply
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              className="text-xs"
            >
              {expanded ? "Hide DM" : "View DM"}
            </Button>
          </div>
        </div>

        {expanded && prospect.generated_dm && (
          <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Instagram DM</span>
              <Button size="sm" variant="ghost" onClick={copyDM} className="text-xs h-7">
                {copied ? <><CheckCheck className="w-3 h-3 text-green-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </Button>
            </div>
            <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{prospect.generated_dm}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProspectsClient({ initialProspects }: { initialProspects: Prospect[] }) {
  const [prospects, setProspects] = useState(initialProspects);
  const [filter, setFilter] = useState<"all" | "pending" | "sent" | "replied">("all");
  const [running, setRunning] = useState(false);
  const [runMsg, setRunMsg] = useState("");

  function handleStatusChange(id: string, status: string) {
    setProspects((prev) => prev.map((p) => p.id === id ? { ...p, status: status as Prospect["status"] } : p));
  }

  async function triggerPipeline() {
    setRunning(true);
    setRunMsg("Starting pipeline...");
    try {
      const res = await fetch("/api/pipeline/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 10 }),
      });
      const data = await res.json();
      setRunMsg(data.message ?? "Pipeline started — check back in a few minutes.");
    } catch {
      setRunMsg("Failed to start pipeline.");
    } finally {
      setRunning(false);
    }
  }

  const filtered = filter === "all" ? prospects : prospects.filter((p) => p.status === filter);
  const counts = {
    all: prospects.length,
    pending: prospects.filter((p) => p.status === "pending").length,
    sent: prospects.filter((p) => p.status === "sent").length,
    replied: prospects.filter((p) => p.status === "replied").length,
  };

  return (
    <div>
      {/* Stats + controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "sent", "replied"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === s
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {runMsg && <span className="text-xs text-gray-400">{runMsg}</span>}
          <Button
            variant="gradient"
            size="sm"
            onClick={triggerPipeline}
            disabled={running}
          >
            {running ? "Running..." : "Run Pipeline Now"}
          </Button>
        </div>
      </div>

      {/* Prospect list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {prospects.length === 0
            ? "No prospects yet — run the pipeline to find your first batch."
            : `No ${filter} prospects.`}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <ProspectCard key={p.id} prospect={p} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
