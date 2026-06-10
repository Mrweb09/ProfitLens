import { Flame, Target, TrendingUp, FileText, Trophy, Share2, BarChart3, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Flame,
    title: "AI Website Roast",
    description: "Brutally honest, viral-worthy analysis of exactly what's wrong with your site. The kind of feedback your team is too polite to give.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Target,
    title: "10-Point Conversion Audit",
    description: "Deep analysis of homepage clarity, CTAs, trust signals, mobile UX, forms, navigation, and every other conversion killer.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: TrendingUp,
    title: "Revenue Impact Calculator",
    description: "See in pounds exactly how much money you're leaving on the table — and what fixing each issue could earn you per month.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: FileText,
    title: "PDF Report Export",
    description: "Generate a beautiful, branded PDF report with scores, findings, and prioritised recommendations to share with your team or client.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Trophy,
    title: "Competitor Comparison",
    description: "See how your site stacks up against competitors side-by-side. Know exactly where you're winning and where you're losing.",
    color: "from-yellow-500 to-amber-500",
  },
  {
    icon: Share2,
    title: "Viral Share Cards",
    description: "Share your audit results on TikTok and LinkedIn. Branded score cards designed to go viral and drive referrals.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: BarChart3,
    title: "Improvement Tracking",
    description: "Run follow-up audits to track your score over time. See exactly how much your conversion rate has improved.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: ShieldCheck,
    title: "Prioritised Action Plan",
    description: "Every finding comes with HIGH/MEDIUM/LOW priority ratings and exact implementation steps. No fluff, just fixes.",
    color: "from-teal-500 to-cyan-500",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-600/10 border border-violet-500/30 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-6">
            Everything you need
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Stop guessing. Start{" "}
            <span className="gradient-text">converting.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Every tool you need to turn your website into a revenue machine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 group hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-5`}>
                <div className="w-full h-full bg-[#09090b] rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
