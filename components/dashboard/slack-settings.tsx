"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

export function SlackSettings({ webhookUrl }: { webhookUrl?: string | null }) {
  const [url, setUrl] = useState(webhookUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/user/slack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhookUrl: url }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Input
          placeholder="https://hooks.slack.com/services/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button variant="gradient" onClick={save} disabled={saving}>
          {saved ? <CheckCircle className="w-4 h-4 text-green-400" /> : saving ? "Saving..." : "Save"}
        </Button>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <p className="text-xs text-gray-500">
        You&apos;ll get a Slack alert every time an audit completes and on weekly score reports.
        <a
          href="https://api.slack.com/messaging/webhooks"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 ml-1 hover:underline"
        >
          How to create a webhook →
        </a>
      </p>
    </div>
  );
}
