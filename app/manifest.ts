import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AuditRoast — AI Conversion Auditor",
    short_name: "AuditRoast",
    description: "AI-powered website conversion auditor. Find out exactly why visitors aren't converting.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#7c3aed",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "New Audit",
        url: "/dashboard/new",
        description: "Run a new website audit",
      },
    ],
  };
}

