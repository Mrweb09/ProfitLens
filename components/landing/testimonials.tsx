import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "eCommerce Owner",
    company: "Bloom Boutique",
    avatar: "SM",
    rating: 5,
    text: "AuditRoast told me my checkout button was invisible on mobile. Fixed it in 20 minutes and my conversion rate jumped from 1.2% to 3.8%. That's an extra £4,200/month. Best £49 I've ever spent.",
    revenue: "+£4,200/mo",
  },
  {
    name: "James Thornton",
    role: "Digital Agency Owner",
    company: "Thornton Digital",
    avatar: "JT",
    rating: 5,
    text: "I now run this on every client website before kickoff. It's like having a senior CRO consultant in my pocket. Clients love the PDF reports and I can charge extra for the analysis.",
    revenue: "+£8,500/mo",
  },
  {
    name: "Priya Patel",
    role: "SaaS Founder",
    company: "InvoiceFlow",
    avatar: "PP",
    rating: 5,
    text: "The roast was brutal but accurate. 'Your homepage has 3 different calls-to-action and visitors don't know what to click.' Reduced to one CTA and saw a 47% increase in trial signups.",
    revenue: "+£12,000/mo",
  },
  {
    name: "Tom Davies",
    role: "Marketing Director",
    company: "LegalFirst UK",
    avatar: "TD",
    rating: 5,
    text: "We had no idea our trust signals were so weak. AuditRoast flagged missing SSL indicators, no client testimonials on the contact page, and zero social proof above the fold. Fixed all three and lead quality improved massively.",
    revenue: "+£6,800/mo",
  },
  {
    name: "Emma Lawson",
    role: "Freelance Web Designer",
    company: "Self-employed",
    avatar: "EL",
    rating: 5,
    text: "The competitor comparison feature is insane. I can show clients exactly where their competitors are beating them on UX, trust, and SEO. It closes deals so fast. Upgraded to Agency plan immediately.",
    revenue: "+£3,200/mo",
  },
  {
    name: "Marcus Chen",
    role: "Growth Lead",
    company: "Shopify Store",
    avatar: "MC",
    rating: 5,
    text: "Revenue opportunity score said we were leaving £9,000/month on the table. Turns out our mobile experience was terrible and trust signals were basically non-existent. Fixed in a weekend. Numbers don't lie.",
    revenue: "+£9,100/mo",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-600/10 border border-green-500/30 rounded-full px-4 py-1.5 text-sm text-green-300 mb-6">
            Real results from real businesses
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            They fixed it.{" "}
            <span className="gradient-text">They got paid.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Over 500 businesses have used AuditRoast to unlock hidden revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass rounded-2xl p-6 flex flex-col gap-4 hover:border-violet-500/30 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role} · {t.company}</div>
                  </div>
                </div>
                <div className="text-green-400 font-bold text-sm bg-green-400/10 border border-green-500/20 rounded-lg px-2.5 py-1">
                  {t.revenue}
                </div>
              </div>

              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>

              <div className="relative">
                <Quote className="absolute -top-1 -left-1 w-6 h-6 text-violet-600/30" />
                <p className="text-gray-300 text-sm leading-relaxed pl-4">{t.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "500+", label: "Sites audited" },
            { value: "£2.4M+", label: "Revenue unlocked" },
            { value: "4.9/5", label: "Average rating" },
            { value: "47%", label: "Avg conversion lift" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-6">
              <div className="text-3xl font-extrabold gradient-text mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

