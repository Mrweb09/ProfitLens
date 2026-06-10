"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: 49,
    key: "starter",
    features: ["10 audits/month", "Full 10-point audit", "PDF reports", "Competitor comparison"],
    popular: false,
  },
  {
    name: "Growth",
    price: 99,
    key: "growth",
    features: ["50 audits/month", "Everything in Starter", "5 competitor comparisons", "White-label PDFs"],
    popular: true,
  },
  {
    name: "Agency",
    price: 199,
    key: "agency",
    features: ["Unlimited audits", "Everything in Growth", "Team accounts", "Admin dashboard"],
    popular: false,
  },
];

export function UpgradeSection() {
  const [loading, setLoading] = useState<string | null>(null);

  async function subscribe(planKey: string) {
    setLoading(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: planKey }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-violet-400" /> Upgrade Your Plan
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={cn(
              "rounded-2xl p-5 border transition-all",
              plan.popular
                ? "bg-violet-600/10 border-violet-500/40"
                : "glass"
            )}
          >
            {plan.popular && (
              <div className="text-xs text-violet-400 font-bold mb-2">MOST POPULAR</div>
            )}
            <div className="text-lg font-bold text-white mb-1">{plan.name}</div>
            <div className="text-2xl font-extrabold text-white mb-4">£{plan.price}<span className="text-sm text-gray-400">/mo</span></div>
            <ul className="space-y-2 mb-5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => subscribe(plan.key)}
              disabled={loading === plan.key}
              variant={plan.popular ? "gradient" : "outline"}
              className="w-full"
            >
              {loading === plan.key ? <Loader2 className="w-4 h-4 animate-spin" /> : `Get ${plan.name}`}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
