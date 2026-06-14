"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

export function ReauditButton({ url }: { url: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function reaudit() {
    setLoading(true);
    try {
      const res = await fetch("/api/audit/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.id) router.push(`/dashboard/audit/${data.id}`);
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={reaudit} disabled={loading}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
      Re-audit
    </Button>
  );
}
