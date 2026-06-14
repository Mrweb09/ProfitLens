"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2 } from "lucide-react";

export function BrandingSettings({ agencyName: initial, agencyLogo: initialLogo }: { agencyName: string; agencyLogo: string }) {
  const [agencyName, setAgencyName] = useState(initial);
  const [agencyLogo, setAgencyLogo] = useState(initialLogo);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setLoading(true);
    await fetch("/api/user/branding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agencyName, agencyLogo }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Agency / Company Name</label>
        <Input
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
          placeholder="e.g. Acme Digital"
        />
        <p className="text-xs text-gray-600 mt-1">Appears in the PDF header and footer instead of &quot;Profitlens&quot;</p>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Logo URL (optional)</label>
        <Input
          value={agencyLogo}
          onChange={(e) => setAgencyLogo(e.target.value)}
          placeholder="https://youragency.com/logo.png"
        />
      </div>
      <Button onClick={save} disabled={loading} variant="gradient">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
        {saved ? "Saved!" : "Save Branding"}
      </Button>
    </div>
  );
}
