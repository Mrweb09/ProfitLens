import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Users, Globe, CreditCard, TrendingDown } from "lucide-react";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export default async function AdminPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (email !== ADMIN_EMAIL) redirect("/dashboard");

  const [totalUsers, totalAudits, paidUsers, recentAudits] = await Promise.all([
    prisma.user.count(),
    prisma.audit.count(),
    prisma.user.count({ where: { plan: { not: "FREE" } } }),
    prisma.audit.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, plan: true } } },
    }),
  ]);

  const planBreakdown = await prisma.user.groupBy({
    by: ["plan"],
    _count: true,
  });

  const prices: Record<string, number> = { FREE: 0, STARTER: 49, GROWTH: 99, AGENCY: 199 };
  const estimatedMRR = planBreakdown.reduce((sum: number, p: { plan: string; _count: number }) => {
    return sum + (prices[p.plan] ?? 0) * p._count;
  }, 0);

  return (
    <div className="min-h-screen bg-[#09090b] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-violet-400" />
                <span className="text-gray-400 text-sm">Total Users</span>
              </div>
              <div className="text-3xl font-bold text-white">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Total Audits</span>
              </div>
              <div className="text-3xl font-bold text-white">{totalAudits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Paid Users</span>
              </div>
              <div className="text-3xl font-bold text-white">{paidUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400 text-sm">Est. MRR</span>
              </div>
              <div className="text-3xl font-bold gradient-text">{formatCurrency(estimatedMRR)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Plan breakdown */}
        <Card className="mb-8">
          <CardHeader><CardTitle>Plan Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {planBreakdown.map((p: { plan: string; _count: number }) => (
                <div key={p.plan} className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-white">{p._count}</div>
                  <div className="text-sm text-gray-400">{p.plan}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent audits */}
        <Card>
          <CardHeader><CardTitle>Recent Audits</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAudits.map((audit: { id: string; url: string; status: string; overallScore: number | null; user: { email: string; plan: string } }) => (
                <div key={audit.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-sm">
                  <div>
                    <div className="text-white font-medium truncate max-w-xs">{audit.url}</div>
                    <div className="text-gray-500 text-xs">{audit.user.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={audit.status === "COMPLETE" ? "success" : audit.status === "FAILED" ? "danger" : "warning"}>
                      {audit.status}
                    </Badge>
                    {audit.overallScore !== null && (
                      <span className="text-white font-bold">{audit.overallScore}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
