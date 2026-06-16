import Link from "next/link";
import { Flame } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — AuditRoast",
  description: "How AuditRoast collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <nav className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">AuditRoast</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-extrabold text-white mb-3">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: June 2025</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Who We Are</h2>
            <p>
              AuditRoast (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides AI-powered website conversion auditing services at AuditRoast.com. If you have any questions about this policy, contact us at{" "}
              <a href="mailto:support@AuditRoast.com" className="text-violet-400 hover:text-violet-300">support@AuditRoast.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. What Data We Collect</h2>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li><span className="text-gray-300 font-medium">Account data:</span> Name and email address when you sign up via Clerk.</li>
              <li><span className="text-gray-300 font-medium">Website URLs:</span> The URLs you submit for auditing.</li>
              <li><span className="text-gray-300 font-medium">Audit results:</span> Scores, findings, and recommendations generated for your audits.</li>
              <li><span className="text-gray-300 font-medium">Billing data:</span> Payment details are handled entirely by Stripe — we never see or store your card number.</li>
              <li><span className="text-gray-300 font-medium">Usage data:</span> Basic analytics via Vercel Analytics (page views, no personal identifiers).</li>
              <li><span className="text-gray-300 font-medium">IP addresses:</span> Stored temporarily to enforce the free audit limit, then retained for abuse prevention.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Data</h2>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li>To provide, operate, and improve the AuditRoast service.</li>
              <li>To process payments and manage your subscription.</li>
              <li>To send transactional emails (receipt, account notifications). We do not send marketing emails unless you opt in.</li>
              <li>To detect and prevent fraud and abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Services</h2>
            <p className="mb-3">We use the following third parties to operate the service:</p>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li><span className="text-gray-300 font-medium">Clerk</span> — authentication and user management.</li>
              <li><span className="text-gray-300 font-medium">Stripe</span> — payment processing. Subject to Stripe&apos;s privacy policy.</li>
              <li><span className="text-gray-300 font-medium">Groq / Meta</span> — AI analysis of submitted URLs. Website content is processed by the AI model to generate audit results.</li>
              <li><span className="text-gray-300 font-medium">Vercel</span> — hosting and analytics.</li>
              <li><span className="text-gray-300 font-medium">Neon / PostgreSQL</span> — database storage for audit results and account data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Website Content & AI Processing</h2>
            <p>
              When you submit a URL, we fetch publicly accessible content from that page (HTML structure, headings, meta tags, visible text) and pass it to our AI provider for analysis. We do not store the raw HTML. Audit results (scores and findings) are stored in our database and associated with your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Retention</h2>
            <p>
              Audit results and account data are retained for as long as your account is active. If you delete your account, your data is permanently deleted within 30 days. You may request deletion at any time by emailing{" "}
              <a href="mailto:support@AuditRoast.com" className="text-violet-400 hover:text-violet-300">support@AuditRoast.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Your Rights (GDPR)</h2>
            <p className="mb-3">If you are in the UK or EU, you have the right to:</p>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Object to or restrict processing.</li>
              <li>Data portability.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{" "}
              <a href="mailto:support@AuditRoast.com" className="text-violet-400 hover:text-violet-300">support@AuditRoast.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Cookies</h2>
            <p>
              We use only essential cookies required for authentication (via Clerk) and session management. We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be communicated via email or a notice on the site. Continued use of the service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Contact</h2>
            <p>
              Questions or concerns? Email us at{" "}
              <a href="mailto:support@AuditRoast.com" className="text-violet-400 hover:text-violet-300">support@AuditRoast.com</a>.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex gap-6 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/refunds" className="hover:text-white transition-colors">Refund Policy</Link>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </div>
    </div>
  );
}

