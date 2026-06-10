import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getScoreColor } from "@/lib/utils";
import { Plus, Globe, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

async function getOrCreateUser(clerkId: string, email: string, name: string) {
  let user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    user = await prisma.user.create({
      data: { clerkId, email, name },
    });
  }
  return user;
}

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const user = await getOrCreateUser(
    clerkUser.id,
    clerkUser.emailAddresses[0]?.emailAddress ?? "",
    `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim()
  );

  const audits = await prisma.audit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const completedAudits = audits.filter((a) => a.status === "COMPLETE");
  const avgScore = completedAudits.length
    ? Math.round(completedAudits.reduce((sum, a) => sum + (a.overallScore ?? 0), 0) / completedAudits.length)
    : 0;
  const totalRevOpp = completedAudits.reduce((sum, a) => sum + (a.revenueOpportunity ?? 0), 0);
  const auditsLeft = user.auditsLimit === -1 ? "∞" : Math.max(0, user.auditsLimit - user.auditsUsed);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back{clerkUser.firstName ? `, ${clerkUser.firstName}` : ""}
            </h1>
            <p className="text-gray-400 mt-1">
              {user.plan} plan · {typeof auditsLeft === "number" ? `${auditsLeft} audits remaining` : "Unlimited audits"}
            </p>
          </div>
          <Link href="/dashboard/new">
            <Button variant="gradient" size="lg">
              <Plus className="w-5 h-5" /> New Audit
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-violet-400" />
                <span className="text-gray-400 text-sm">Total Audits</span>
              </div>
              <div className="text-3xl font-bold text-white">{audits.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Revenue Opportunity</span>
              </div>
              <div className="text-3xl font-bold text-white">{formatCurrency(totalRevOpp)}</div>
              <div className="text-xs text-gray-500 mt-1">across all audits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400 text-sm">Avg Score</span>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
                {avgScore > 0 ? avgScore : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audits list */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recent Audits</h2>
          {audits.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No audits yet</h3>
                <p className="text-gray-400 mb-6">Run your first audit to see how your website is performing.</p>
                <Link href="/dashboard/new">
                  <Button variant="gradient">
                    <Plus className="w-4 h-4" /> Start Your First Audit
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {audits.map((audit) => (
                <Link key={audit.id} href={`/dashboard/audit/${audit.id}`}>
                  <Card className="hover:border-violet-500/30 transition-all cursor-pointer group">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center">
                          <Globe className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{audit.url}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {format(new Date(audit.createdAt), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {audit.status === "COMPLETE" && audit.overallScore !== null && (
                          <div className={`text-2xl font-bold ${getScoreColor(audit.overallScore)}`}>
                            {audit.overallScore}
                          </div>
                        )}
                        <Badge
                          variant={
                            audit.status === "COMPLETE" ? "success" :
                            audit.status === "FAILED" ? "danger" :
                            "warning"
                          }
                        >
                          {audit.status}
                        </Badge>
                        {audit.revenueOpportunity && (
                          <div className="text-green-400 text-sm font-medium hidden sm:block">
                            +{formatCurrency(audit.revenueOpportunity)}/mo
                          </div>
                        )}
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
