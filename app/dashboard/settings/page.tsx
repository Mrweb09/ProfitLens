import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";

export default async function SettingsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your account and profile.</p>
      </div>
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
