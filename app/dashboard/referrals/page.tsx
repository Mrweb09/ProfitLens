"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, CheckCircle, Gift, Users, Zap } from "lucide-react";

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        setReferralCode(d.referralCode ?? null);
        setLoading(false);
      });
  }, []);

  const generateCode = async () => {
    setGenerating(true);
    const res = await fetch("/api/referral", { method: "POST" });
    const data = await res.json();
    setReferralCode(data.referralCode);
    setGenerating(false);
  };

  const referralLink = referralCode
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://AuditRoast.com"}/?ref=${referralCode}`
    : "";

  const copy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Referral Programme</h1>
        <p className="text-gray-400 text-sm mt-1">Share AuditRoast and earn free audit credits.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Users, label: "Invite Friends", desc: "Share your link" },
          { icon: Zap, label: "They Sign Up", desc: "Free audit for them" },
          { icon: Gift, label: "You Earn", desc: "+5 bonus audits" },
        ].map(({ icon: Icon, label, desc }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <Icon className="w-6 h-6 text-violet-400 mx-auto mb-2" />
              <div className="text-white text-sm font-semibold">{label}</div>
              <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-white font-semibold mb-3">Your Referral Link</h3>
          {loading ? (
            <div className="text-gray-500 text-sm">Loading...</div>
          ) : referralCode ? (
            <div className="flex gap-3">
              <Input value={referralLink} readOnly className="font-mono text-sm" />
              <Button variant="outline" onClick={copy}>
                {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          ) : (
            <Button variant="gradient" onClick={generateCode} disabled={generating}>
              {generating ? "Generating..." : "Generate My Link"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-violet-500/20 bg-violet-500/5">
        <CardContent className="p-5">
          <h3 className="text-white font-semibold mb-2">How it works</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Share your unique referral link with website owners, agencies, or marketers</li>
            <li>• When someone signs up using your link and runs their first audit, you get 5 bonus audits</li>
            <li>• There is no limit on how many people you can refer</li>
            <li>• Bonus audits are added automatically within 24 hours</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

