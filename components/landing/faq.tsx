"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How does the AI analysis work?",
    a: "We use a large language model to analyze your website's URL, structure, content, and conversion elements. The AI evaluates over 50 data points including CTAs, trust signals, mobile UX, SEO fundamentals, and psychological persuasion patterns. Results are ready in under 60 seconds.",
  },
  {
    q: "How accurate is the revenue opportunity estimate?",
    a: "The revenue calculator uses industry-standard conversion benchmarks and estimates based on your site's niche and current issues. It's an estimate, not a guarantee — but our users consistently report actual uplift that matches or exceeds the projection after fixing the flagged issues.",
  },
  {
    q: "What's included in the 'roast'?",
    a: "The roast is a brutally honest, direct analysis of your website's biggest conversion problems written in plain English. No corporate speak, no sugarcoating. It's designed to be shareable on TikTok and LinkedIn, giving you viral content while highlighting the fixes.",
  },
  {
    q: "Can I use this for client websites?",
    a: "Absolutely. The Growth and Agency plans are built for agencies. You get white-label PDF reports, multiple competitor comparisons, and team accounts. Many agency owners use AuditRoast as part of their website audit service.",
  },
  {
    q: "What if I disagree with a finding?",
    a: "Fair enough — the AI isn't perfect. Every recommendation comes with the reasoning behind it. You have full context to decide whether to act on it. In our experience, users dismiss about 10% of findings as not relevant to their business model.",
  },
  {
    q: "Do you store my website data?",
    a: "We store the audit results so you can access your history and track improvements over time. We don't scrape or cache your website content. All data is encrypted at rest and in transit.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, cancel anytime from your dashboard. You'll keep access until the end of your billing period. We also offer a 7-day money-back guarantee if you're not satisfied.",
  },
  {
    q: "What websites work best with AuditRoast?",
    a: "Any website that relies on conversions: eCommerce stores, SaaS landing pages, service business sites, local business websites, and portfolio sites. If your site is supposed to generate leads or sales, we can audit it.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "border border-white/10 rounded-xl overflow-hidden transition-all duration-200",
        open && "border-violet-500/30"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium text-white text-sm sm:text-base">{q}</span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200",
            open && "rotate-180 text-violet-400"
          )}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Questions? <span className="gradient-text">Answered.</span>
          </h2>
          <p className="text-gray-400">Everything you need to know before you start.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

