"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  onClose: () => void;
  currentPlan?: string;
}

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    audits: "10 audits/mo",
    highlight: false,
    features: ["Action plans", "AI chat", "Score history", "Weekly monitoring", "Email reports"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 99,
    audits: "50 audits/mo",
    highlight: true,
    badge: "Most Popular",
    features: ["White-label PDF", "API access", "Competitor analysis", "Slack alerts"],
  },
  {
    id: "agency",
    name: "Agency",
    price: 199,
    audits: "Unlimited audits",
    highlight: false,
    features: ["Bulk audit (20 URLs)", "10 API keys", "Priority support"],
  },
];

export function UpgradeModal({ onClose, currentPlan = "FREE" }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function upgrade(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f0f13] border border-white/10 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-400" /> You&apos;ve used all your audits
            </h2>
            <p className="text-gray-400 text-sm mt-1">Upgrade to keep roasting — and unlock powerful features.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl p-5 border flex flex-col ${
                plan.highlight
                  ? "border-violet-500 bg-violet-600/10"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                  {plan.badge}
                </div>
              )}
              <div className="mb-4">
                <div className="text-white font-bold">{plan.name}</div>
                <div className="text-3xl font-extrabold text-white mt-1">${plan.price}<span className="text-sm text-gray-400 font-normal">/mo</span></div>
                <div className="text-violet-300 text-xs mt-1 font-medium">{plan.audits}</div>
              </div>
              <ul className="space-y-1.5 flex-1 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                    <Check className="w-3 h-3 text-violet-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlight ? "gradient" : "outline"}
                size="sm"
                className="w-full"
                onClick={() => upgrade(plan.id)}
                disabled={loading !== null}
              >
                {loading === plan.id ? "Redirecting..." : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-gray-600">Cancel anytime · No contracts · Instant access</p>
          <button
            onClick={() => { router.push("/pricing"); onClose(); }}
            className="text-xs text-violet-400 hover:underline mt-1"
          >
            See full plan comparison →
          </button>
        </div>
      </div>
    </div>
  );
}
