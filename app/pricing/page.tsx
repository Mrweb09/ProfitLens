import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Flame, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Profitlens",
  description: "Start free. Upgrade when you're ready. No contracts, cancel anytime.",
};

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "See what's killing your conversions.",
    features: [
      "1 audit per month",
      "Overall + 5 category scores",
      "Revenue opportunity estimate",
      "AI roast report",
      "Public share link",
    ],
    cta: "Start Free",
    href: "/sign-up",
    highlight: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 49,
    description: "For founders actively improving their site.",
    features: [
      "10 audits per month",
      "Everything in Free",
      "Full action plan",
      "AI chat (ask follow-up questions)",
      "Score history & progress tracking",
      "Weekly monitoring alerts",
      "Email reports",
    ],
    cta: "Start Starter",
    href: "/sign-up?plan=starter",
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: 99,
    description: "For teams serious about conversion growth.",
    features: [
      "50 audits per month",
      "Everything in Starter",
      "White-label PDF reports",
      "API access (3 keys)",
      "Competitor analysis",
      "Slack alerts",
      "Priority support",
    ],
    cta: "Start Growth",
    href: "/sign-up?plan=growth",
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "agency",
    name: "Agency",
    price: 199,
    description: "For agencies auditing client websites at scale.",
    features: [
      "Unlimited audits",
      "Everything in Growth",
      "Bulk audit (20 sites at once)",
      "10 API keys",
      "White-label branding",
      "Client-ready PDF reports",
      "Dedicated support",
    ],
    cta: "Start Agency",
    href: "/sign-up?plan=agency",
    highlight: false,
  },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your billing page in one click. No questions asked. You keep access until the end of your billing period.",
  },
  {
    q: "What counts as an audit?",
    a: "Each time you run a full analysis on a URL — including re-audits and weekly monitoring checks — counts as one audit.",
  },
  {
    q: "Do unused audits roll over?",
    a: "No, audit credits reset at the start of each billing month.",
  },
  {
    q: "What is the API?",
    a: "Growth and Agency plans get REST API access to run audits programmatically. Useful for integrating into your own tools or client dashboards.",
  },
  {
    q: "Is there a free trial on paid plans?",
    a: "The Free plan gives you a real audit at no cost. If you want to try a paid plan, upgrade and cancel within 24 hours for a full refund — just email us.",
  },
  {
    q: "What's white-label?",
    a: "Growth and Agency users can add their agency name and logo to exported PDF reports, so you can send branded reports directly to clients.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Profitlens</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href="/sign-up"><Button variant="gradient" size="sm">Get Started Free</Button></Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-6">
            <Zap className="w-4 h-4" /> Simple, transparent pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Start free. Pay when it pays off.
          </h1>
          <p className="text-gray-400 text-xl max-w-xl mx-auto">
            One audit can reveal thousands in lost revenue. No contracts. Cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 border flex flex-col ${
                plan.highlight
                  ? "border-violet-500 bg-violet-600/10 shadow-2xl shadow-violet-500/20"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <div className="text-white font-bold text-lg mb-1">{plan.name}</div>
                <div className="text-gray-400 text-sm mb-4">{plan.description}</div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-400 text-sm mb-1">/month</span>}
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  variant={plan.highlight ? "gradient" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="mb-20 overflow-x-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Full comparison</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium py-3 pr-6 w-1/3">Feature</th>
                {["Free", "Starter", "Growth", "Agency"].map((p) => (
                  <th key={p} className="text-center text-white font-semibold py-3 px-4">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Audits / month", "1", "10", "50", "Unlimited"],
                ["Scores (6 categories)", "✓", "✓", "✓", "✓"],
                ["AI roast report", "✓", "✓", "✓", "✓"],
                ["Revenue opportunity", "✓", "✓", "✓", "✓"],
                ["Full action plan", "—", "✓", "✓", "✓"],
                ["AI follow-up chat", "—", "✓", "✓", "✓"],
                ["Score history", "—", "✓", "✓", "✓"],
                ["Weekly monitoring", "—", "✓", "✓", "✓"],
                ["Email reports", "—", "✓", "✓", "✓"],
                ["Competitor analysis", "—", "—", "✓", "✓"],
                ["White-label PDF", "—", "—", "✓", "✓"],
                ["API access", "—", "—", "✓", "✓"],
                ["Slack alerts", "—", "—", "✓", "✓"],
                ["Bulk audit (20 URLs)", "—", "—", "—", "✓"],
                ["10 API keys", "—", "—", "—", "✓"],
              ].map(([feature, ...values]) => (
                <tr key={feature} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 pr-6 text-gray-300">{feature}</td>
                  {values.map((v, i) => (
                    <td key={i} className="py-3 px-4 text-center">
                      {v === "✓" ? (
                        <span className="text-violet-400 font-bold">✓</span>
                      ) : v === "—" ? (
                        <span className="text-gray-600">—</span>
                      ) : (
                        <span className="text-white font-medium">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border border-white/10 rounded-xl p-5 bg-white/[0.02]">
                <div className="font-semibold text-white mb-2">{q}</div>
                <div className="text-gray-400 text-sm leading-relaxed">{a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 p-10 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to fix your conversions?</h2>
          <p className="text-gray-400 mb-8 text-lg">Your first audit is free. No credit card needed.</p>
          <Link href="/sign-up">
            <Button variant="gradient" size="lg" className="text-lg px-10">
              Get My Free Audit →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
