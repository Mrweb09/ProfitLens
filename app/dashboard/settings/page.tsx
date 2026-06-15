import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { BrandingSettings } from "@/components/dashboard/branding-settings";
import { SlackSettings } from "@/components/dashboard/slack-settings";

type ExtendedUser = {
  id: string;
  plan: string;
  agencyName?: string | null;
  agencyLogo?: string | null;
  slackWebhookUrl?: string | null;
};

export default async function SettingsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } }) as ExtendedUser | null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your account and profile.</p>
      </div>

      {dbUser && ["GROWTH", "AGENCY"].includes(dbUser.plan) && (
        <div className="mb-10 max-w-2xl">
          <h2 className="text-xl font-bold text-white mb-1">White-label Branding</h2>
          <p className="text-gray-400 text-sm mb-4">Customise PDF reports with your agency name.</p>
          <BrandingSettings agencyName={dbUser.agencyName ?? ""} agencyLogo={dbUser.agencyLogo ?? ""} />
        </div>
      )}

      {dbUser && (
        <div className="mb-10 max-w-2xl">
          <h2 className="text-xl font-bold text-white mb-1">Slack Alerts</h2>
          <p className="text-gray-400 text-sm mb-4">Get notified in Slack when audits complete.</p>
          <SlackSettings webhookUrl={dbUser.slackWebhookUrl} />
        </div>
      )}

      <UserProfile
        appearance={{
          elements: {
            rootBox: "w-full max-w-2xl",
            card: "bg-white/5 border border-white/10 shadow-2xl rounded-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            formFieldLabel: "text-gray-300",
            formFieldInput: "bg-white/5 border-white/20 text-white",
            profileSectionTitleText: "text-white",
            navbarButton: "text-gray-400",
          },
        }}
      />
    </div>
  );
}
