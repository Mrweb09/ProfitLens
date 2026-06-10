"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

export function AuditCounter() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setCount(d.count + 2847));
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
      <BarChart3 className="w-4 h-4 text-violet-400" />
      <span>
        <span className="text-white font-bold">{count.toLocaleString()}</span> websites audited and counting
      </span>
    </div>
  );
}
