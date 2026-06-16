import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import Script from "next/script";
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
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#09090b] text-white">
          <PHProvider>
            <Suspense>
              <PostHogPageview />
            </Suspense>
            {children}
          </PHProvider>
          <Analytics />
          <Script id="crisp-chat" strategy="afterInteractive">{`
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="8f3f7020-221d-40db-b497-4c0c9de6d1aa";
            (function(){
              var d=document;
              var s=d.createElement("script");
              s.src="https://client.crisp.chat/l.js";
              s.async=1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          `}</Script>
        </body>
      </html>
    </ClerkProvider>
  );
}

