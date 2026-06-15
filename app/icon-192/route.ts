import { NextResponse } from "next/server";

// Generates a simple SVG icon served as PNG placeholder
// Replace public/icon-192.png and public/icon-512.png with real PNGs for production
export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#9333ea"/>
    </linearGradient>
  </defs>
  <rect width="192" height="192" rx="40" fill="url(#g)"/>
  <text x="96" y="130" font-family="sans-serif" font-size="100" font-weight="900" fill="white" text-anchor="middle">🔥</text>
</svg>`;

  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}
