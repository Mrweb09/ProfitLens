"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Check, Zap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    description: "Try it out before you commit",
    audits: "1 audit",
    features: [
      "1 website audit",
      "Overall conversion score",
      "Top 5 recommendations",
      "Basic revenue estimate",
      "Share results link",
    ],
    cta: "Start Free",
    href: "/sign-up",
    popular: false,
    priceId: null,
  },
  {
    name: "Starter",
    price: 49,
    period: "month",
    description: "For growing businesses and freelancers",
    audits: "10 audits/month",
    features: [
      "10 website audits/month",
      "Full 10-point audit",
      "All score categories",
      "Revenue calculator",
      "PDF report export",
      "Competitor comparison (1)",
      "Audit history",
      "Priority support",
    ],
    cta: "Start Starter",
    href: "/sign-up?plan=starter",
    popular: false,
    priceId: "starter",
  },
  {
    name: "Growth",
    price: 99,
    period: "month",
    description: "For agencies and serious businesses",
    audits: "50 audits/month",
    features: [
      "50 website audits/month",
      "Everything in Starter",
      "Competitor comparisons (5)",
      "White-label PDF reports",
      "Viral share cards",
      "API access",
      "Improvement tracking",
      "Slack notifications",
    ],
    cta: "Start Growth",
    href: "/sign-up?plan=growth",
    popular: true,
    priceId: "growth",
  },
  {
    name: "Agency",
    price: 199,
    period: "month",
    description: "Unlimited for large agencies",
    audits: "Unlimited audits",
    features: [
      "Unlimited audits",
      "Everything in Growth",
      "Unlimited competitor comparisons",
      "Custom branding",
      "Team accounts (5 seats)",
      "Admin dashboard",
      "Priority API",
      "Dedicated support",
    ],
    cta: "Start Agency",
    href: "/sign-up?plan=agency",
    popular: false,
    priceId: "agency",
  },
];

export function Pricing() {
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubscribe(priceId: string | null, planName: string) {
    if (!priceId) {
      window.location.href = isSignedIn ? "/dashboard" : "/sign-up";
      return;
    }
    if (!isSignedIn) {
      window.location.href = `/sign-up?plan=${planName.toLowerCase()}`;
      return;
    }
    setLoading(planName);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: planName.toLowerCase() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-600/10 border border-violet-500/30 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-6">
            <Zap className="w-4 h-4" /> Simple pricing
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Invest £49. Unlock{" "}
            <span className="gradient-text">thousands.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            One audit could pay for your subscription 100x over. The question is: can you afford NOT to know what's broken?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-6 flex flex-col transition-all duration-300",
                plan.popular
                  ? "bg-gradient-to-b from-violet-600/20 to-violet-600/5 border-2 border-violet-500/50 shadow-xl shadow-violet-500/10 scale-[1.02]"
                  : "glass hover:border-violet-500/30"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    <Flame className="w-3.5 h-3.5" /> Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-white text-lg mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">£{plan.price}</span>
                  <span className="text-gray-400 text-sm">/{plan.period}</span>
                </div>
                <div className="text-violet-400 text-sm font-medium mt-1">{plan.audits}</div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
                disabled={loading === plan.name}
                variant={plan.popular ? "gradient" : "outline"}
                className="w-full"
              >
                {loading === plan.name ? "Loading..." : plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mt-6">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-5 py-2.5">
            <span className="text-green-400 text-lg">🛡️</span>
            <span className="text-green-300 text-sm font-medium">7-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5">
            <span className="text-lg">❌</span>
            <span className="text-gray-300 text-sm font-medium">Cancel anytime, no questions asked</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5">
            <span className="text-lg">⚡</span>
            <span className="text-gray-300 text-sm font-medium">Results in under 60 seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
}
