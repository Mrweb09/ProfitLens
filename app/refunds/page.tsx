import Link from "next/link";
import { Flame, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Refund Policy — Profitlens",
  description: "Profitlens 7-day money-back guarantee and refund policy.",
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <nav className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Profitlens</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-extrabold text-white mb-3">Refund Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: June 2025</p>

        {/* Guarantee banner */}
        <div className="flex items-center gap-4 bg-green-500/10 border border-green-500/20 rounded-2xl p-6 mb-12">
          <ShieldCheck className="w-10 h-10 text-green-400 shrink-0" />
          <div>
            <div className="font-bold text-white text-lg">7-Day Money-Back Guarantee</div>
            <div className="text-green-300 text-sm mt-0.5">
              Not happy? Email us within 7 days of your first payment for a full refund — no questions asked.
            </div>
          </div>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Our Guarantee</h2>
            <p>
              We stand behind the quality of Profitlens. If you subscribe to any paid plan and are not satisfied within the first 7 days, we will issue a full refund with no questions asked.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">How to Request a Refund</h2>
            <p className="mb-4">
              Email us at{" "}
              <a href="mailto:support@profitlens.com" className="text-violet-400 hover:text-violet-300">support@profitlens.com</a>{" "}
              from the email address associated with your account. Include the subject line <span className="text-white font-medium">&quot;Refund Request&quot;</span>.
            </p>
            <p>
              We will process your refund within 5 business days. Funds typically appear back on your card within 5–10 business days depending on your bank.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Eligibility</h2>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li>Refund requests must be made within 7 days of your initial subscription payment.</li>
              <li>The guarantee applies to the first payment on a new subscription only — it does not apply to renewal charges.</li>
              <li>Free plan usage is not eligible for refunds (it&apos;s free).</li>
              <li>Accounts found to be abusing the guarantee (repeated sign-up and refund cycles) may be refused.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Renewals & Cancellations</h2>
            <p>
              Subscription renewals are non-refundable. To avoid being charged for the next billing period, cancel your subscription from your{" "}
              <Link href="/dashboard/billing" className="text-violet-400 hover:text-violet-300">billing page</Link>{" "}
              before the renewal date. You will retain access to paid features until the end of the period you have paid for.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">Contact</h2>
            <p>
              Any questions about refunds? Email{" "}
              <a href="mailto:support@profitlens.com" className="text-violet-400 hover:text-violet-300">support@profitlens.com</a>{" "}
              and we&apos;ll get back to you within 1 business day.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </div>
    </div>
  );
}
