"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle, XCircle, Loader2, Lock } from "lucide-react";
import Link from "next/link";

interface BulkResult {
  url: string;
  status: "success" | "error";
  auditId?: string;
  overallScore?: number | null;
  error?: string;
}

export default function BulkAuditPage() {
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<BulkResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [restricted, setRestricted] = useState(false);

  const runBulk = async () => {
    const urls = input
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (urls.length === 0) return;
    setRunning(true);
    setError(null);
    setResults([]);

    const res = await fetch("/api/bulk-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    });

    if (res.status === 403) { setRestricted(true); setRunning(false); return; }

    const data = await res.json();
    if (!res.ok) { setError(data.error); setRunning(false); return; }

    setResults(data.results);
    setRunning(false);
  };

  if (restricted) {
    return (
      <div className="p-8 max-w-2xl mx-auto pt-20 text-center">
        <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Bulk Auditing</h1>
        <p className="text-gray-400 mb-6">Bulk auditing is available on the Agency plan.</p>
        <Link href="/dashboard/billing">
          <Button variant="gradient">Upgrade to Agency</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Bulk Audit</h1>
        <p className="text-gray-400 text-sm mt-1">Audit up to 20 websites at once. One URL per line.</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-5">
          <Textarea
            placeholder={`https://example.com\nhttps://another.com\nhttps://client-site.com`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            className="font-mono text-sm mb-4"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {input.split("\n").filter((l) => l.trim()).length} URLs
            </span>
            <Button
              variant="gradient"
              onClick={runBulk}
              disabled={running || !input.trim()}
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analysing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" /> Run Bulk Audit
                </>
              )}
            </Button>
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Results</h2>
          {results.map((r, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                {r.status === "success"
                  ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  : <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">{r.url}</div>
                  {r.error && <div className="text-xs text-red-400">{r.error}</div>}
                </div>
                {r.status === "success" && r.overallScore !== undefined && (
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={(r.overallScore ?? 0) >= 70 ? "success" : (r.overallScore ?? 0) >= 50 ? "warning" : "danger"}
                    >
                      {r.overallScore}/100
                    </Badge>
                    {r.auditId && (
                      <Link href={`/dashboard/audit/${r.auditId}`}>
                        <Button variant="outline" size="sm">View →</Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
