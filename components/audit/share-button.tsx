"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Copy, Globe } from "lucide-react";

interface ShareButtonProps {
  auditId: string;
  isPublic: boolean;
}

export function ShareButton({ auditId, isPublic: initialPublic }: ShareButtonProps) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function makePublic() {
    if (isPublic) {
      const url = `${window.location.origin}/audit/${auditId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    setLoading(true);
    try {
      await fetch(`/api/audit/${auditId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: true }),
      });
      setIsPublic(true);
      const url = `${window.location.origin}/audit/${auditId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={makePublic} disabled={loading}>
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-400" /> Copied!
        </>
      ) : isPublic ? (
        <>
          <Copy className="w-4 h-4" /> Copy Link
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" /> Share
        </>
      )}
    </Button>
  );
}
