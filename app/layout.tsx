import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import { PHProvider } from "./providers";
import { PostHogPageview } from "./posthog-pageview";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuditRoast — AI Website Conversion Auditor",
  description: "Get a brutal AI-powered audit of your website. Find out exactly why visitors aren't converting — and get exact fixes to boost revenue.",
  keywords: ["website audit", "conversion rate optimization", "CRO", "website analysis", "UX audit"],
  openGraph: {
    title: "AuditRoast — AI Website Conversion Auditor",
    description: "Get a brutal AI-powered audit of your website. Find out exactly why visitors aren't converting.",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AuditRoast",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <PHProvider>
        <html
          lang="en"
          className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
          <body className="min-h-full flex flex-col bg-[#09090b] text-white">
            <Suspense>
              <PostHogPageview />
            </Suspense>
            {children}
            <Analytics />
          </body>
        </html>
      </PHProvider>
    </ClerkProvider>
  );
}

