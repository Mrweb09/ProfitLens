"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";

export function WatchButton({ url }: { url: string }) {
  const [watching, setWatching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/watch?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((d) => { setWatching(d.watching); setLoading(false); });
  }, [url]);

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/watch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setWatching(data.watching);
    setLoading(false);
  }

  return (
    <Button variant={watching ? "secondary" : "outline"} onClick={toggle} disabled={loading} title={watching ? "Stop weekly emails" : "Get weekly score emails"}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : watching ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
      {watching ? "Watching" : "Watch"}
    </Button>
  );
}
