import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ManageBillingButton } from "@/components/dashboard/manage-billing-button";
import { UpgradeSection } from "@/components/dashboard/upgrade-section";
import { CreditCard, Zap } from "lucide-react";
import { format } from "date-fns";

export default async function BillingPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) redirect("/dashboard");

  const isSubscribed = dbUser.plan !== "FREE";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Billing</h1>
        <p className="text-gray-400">Manage your plan and billing details.</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-400" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl font-bold text-white">{dbUser.plan}</span>
                <Badge variant={isSubscribed ? "success" : "secondary"}>
                  {isSubscribed ? "Active" : "Free Tier"}
                </Badge>
              </div>
              <div className="text-sm text-gray-400">
                {dbUser.auditsLimit === -1
                  ? "Unlimited audits"
                  : `${dbUser.auditsUsed} / ${dbUser.auditsLimit} audits used`}
              </div>
              {dbUser.stripeCurrentPeriodEnd && (
                <div className="text-sm text-gray-500 mt-1">
                  Renews {format(dbUser.stripeCurrentPeriodEnd, "MMMM d, yyyy")}
                </div>
              )}
            </div>
            {isSubscribed && <ManageBillingButton />}
          </div>
        </CardContent>
      </Card>

      {!isSubscribed && <UpgradeSection />}
    </div>
  );
}
