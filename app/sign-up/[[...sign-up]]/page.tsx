import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "bg-white/5 border border-white/10 shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            socialButtonsBlockButton: "border-white/20 text-white hover:bg-white/10",
            formFieldLabel: "text-gray-300",
            formFieldInput: "bg-white/5 border-white/20 text-white",
            footerActionLink: "text-violet-400 hover:text-violet-300",
            formButtonPrimary: "bg-violet-600 hover:bg-violet-700",
          },
        }}
      />
    </div>
  );
}
