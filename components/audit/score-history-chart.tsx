"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HistoryPoint {
  id: string;
  overallScore: number;
  trustScore: number;
  uxScore: number;
  seoScore: number;
  mobileScore: number;
  createdAt: string;
}

export function ScoreHistoryChart({ url }: { url: string }) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/score-history?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((d) => { setHistory(d); setLoading(false); });
  }, [url]);

  if (loading) return <div className="text-gray-500 text-sm text-center py-8">Loading history...</div>;
  if (history.length < 2) return (
    <div className="glass rounded-2xl p-8 text-center">
      <div className="text-gray-400 text-sm mb-2">Not enough data yet</div>
      <div className="text-gray-500 text-xs">Run another audit on this site to see your score trend.</div>
    </div>
  );

  const first = history[0].overallScore;
  const last = history[history.length - 1].overallScore;
  const diff = last - first;

  const chartData = history.map((h) => ({
    date: format(new Date(h.createdAt), "MMM d"),
    Overall: h.overallScore,
    Trust: h.trustScore,
    UX: h.uxScore,
    SEO: h.seoScore,
    Mobile: h.mobileScore,
  }));

  return (
    <div className="space-y-6">
      {/* Before / After summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">First Audit</div>
          <div className="text-3xl font-bold text-white">{first}</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center flex flex-col items-center justify-center">
          {diff > 0
            ? <TrendingUp className="w-8 h-8 text-green-400 mb-1" />
            : diff < 0
            ? <TrendingDown className="w-8 h-8 text-red-400 mb-1" />
            : <Minus className="w-8 h-8 text-gray-400 mb-1" />}
          <div className={`text-2xl font-bold ${diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-gray-400"}`}>
            {diff > 0 ? "+" : ""}{diff}
          </div>
          <div className="text-xs text-gray-500">Change</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Latest Audit</div>
          <div className="text-3xl font-bold text-white">{last}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Score Over Time</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0d0d10", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
            <Line type="monotone" dataKey="Overall" stroke="#7c3aed" strokeWidth={3} dot={{ fill: "#7c3aed", r: 5 }} />
            <Line type="monotone" dataKey="Trust" stroke="#22c55e" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            <Line type="monotone" dataKey="UX" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            <Line type="monotone" dataKey="Mobile" stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
          {[["Overall", "#7c3aed"], ["Trust", "#22c55e"], ["UX", "#3b82f6"], ["Mobile", "#f97316"]].map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
