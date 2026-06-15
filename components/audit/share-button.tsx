"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Copy, ExternalLink, Code, ChevronDown } from "lucide-react";

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

interface ShareButtonProps {
  auditId: string;
  isPublic: boolean;
  url?: string;
  score?: number;
  trustScore?: number;
  uxScore?: number;
  seoScore?: number;
  mobileScore?: number;
  revenueOpportunity?: number | null;
}

export function ShareButton({
  auditId,
  isPublic: initialPublic,
  url = "",
  score = 0,
  trustScore = 0,
  uxScore = 0,
  seoScore = 0,
  mobileScore = 0,
  revenueOpportunity,
}: ShareButtonProps) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const auditUrl = typeof window !== "undefined" ? `${window.location.origin}/audit/${auditId}` : `/audit/${auditId}`;
  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://profitlens.com";

  const ogImageUrl = `${appUrl}/api/og?url=${encodeURIComponent(url)}&score=${score}&trust=${trustScore}&ux=${uxScore}&seo=${seoScore}&mobile=${mobileScore}${revenueOpportunity ? `&revenue=${Math.round(revenueOpportunity)}` : ""}`;

  async function ensurePublic() {
    if (isPublic) return;
    setLoading(true);
    await fetch(`/api/audit/${auditId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: true }),
    });
    setIsPublic(true);
    setLoading(false);
  }

  async function copyLink() {
    await ensurePublic();
    navigator.clipboard.writeText(auditUrl);
    setCopied("link");
    setTimeout(() => setCopied(null), 2000);
    setOpen(false);
  }

  async function shareTwitter() {
    await ensurePublic();
    const text = `I just roasted my website with AI and scored ${score}/100 🔥\n\nHere's exactly what's killing my conversions:\n${auditUrl}\n\n(via @profitlens)`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    setOpen(false);
  }

  async function shareLinkedIn() {
    await ensurePublic();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(auditUrl)}`, "_blank");
    setOpen(false);
  }

  async function copyEmbed() {
    await ensurePublic();
    const embed = `<a href="${auditUrl}" target="_blank" rel="noopener"><img src="${appUrl}/api/badge/${auditId}" alt="Profitlens score: ${score}/100" width="200" height="40" /></a>`;
    navigator.clipboard.writeText(embed);
    setCopied("embed");
    setTimeout(() => setCopied(null), 2000);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setOpen(!open)} disabled={loading}>
        {loading ? "..." : <><Share2 className="w-4 h-4" /> Share <ChevronDown className="w-3 h-3 ml-1" /></>}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-52 bg-[#0f0f13] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              {copied === "link" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied === "link" ? "Copied!" : "Copy link"}
            </button>
            <button
              onClick={shareTwitter}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <XIcon /> Tweet this
            </button>
            <button
              onClick={shareLinkedIn}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <LinkedInIcon /> Share on LinkedIn
            </button>
            <div className="border-t border-white/5" />
            <button
              onClick={copyEmbed}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              {copied === "embed" ? <Check className="w-4 h-4 text-green-400" /> : <Code className="w-4 h-4" />}
              {copied === "embed" ? "Copied!" : "Copy badge embed"}
            </button>
            <a
              href={ogImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              onClick={() => setOpen(false)}
            >
              <ExternalLink className="w-4 h-4 text-violet-400" /> Preview share image
            </a>
          </div>
        </>
      )}
    </div>
  );
}
