"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Flame, Loader2, CheckCircle2 } from "lucide-react";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";

const steps = [
  "Fetching website structure...",
  "Analysing conversion elements...",
  "Checking trust signals...",
  "Evaluating mobile experience...",
  "Calculating revenue opportunity...",
  "Generating AI recommendations...",
  "Preparing your roast...",
];

export default function NewAuditPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    }, 7000);

    try {
      const res = await fetch("/api/audit/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 403) {
          setShowUpgrade(true);
          setLoading(false);
          return;
        }
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      router.push(`/dashboard/audit/${data.id}`);
    } catch {
      clearInterval(stepInterval);
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">New Audit</h1>
        <p className="text-gray-400">Enter your website URL and we&apos;ll roast it in under 60 seconds.</p>
      </div>

      {!loading ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Roast Your Website
            </CardTitle>
            <CardDescription>
              We&apos;ll analyse 50+ conversion factors and tell you exactly what&apos;s killing your revenue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website URL
                </label>
                <Input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="text-base"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" variant="gradient" size="lg" className="w-full">
                Start Audit <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-gray-500">
              {[
                "Homepage analysis",
                "Mobile experience",
                "Trust signals",
                "CTA effectiveness",
                "SEO fundamentals",
                "Revenue opportunity",
                "Competitor insights",
                "Action plan",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-500" />
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Roasting your site...</h2>
            <p className="text-gray-400 text-sm mb-8">This usually takes 30–60 seconds</p>

            <div className="space-y-3 text-left max-w-xs mx-auto">
              {steps.map((step, i) => (
                <div
                  key={step}
                  className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                    i < currentStep
                      ? "text-green-400"
                      : i === currentStep
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  {i < currentStep ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : i === currentStep ? (
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-700 shrink-0" />
                  )}
                  {step}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
