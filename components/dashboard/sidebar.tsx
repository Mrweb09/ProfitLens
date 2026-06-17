"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Flame,
  LayoutDashboard,
  Plus,
  Trophy,
  Settings,
  CreditCard,
  Key,
  Zap,
  Gift,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/new", label: "New Audit", icon: Plus },
  { href: "/dashboard/competitor", label: "Competitor Check", icon: Trophy },
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3, isNew: true },
  { href: "/dashboard/bulk", label: "Bulk Audit", icon: Zap, isNew: true },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key, isNew: true },
  { href: "/dashboard/referrals", label: "Referrals", icon: Gift, isNew: true },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {nav.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              active
                ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.isNew && !active && (
              <span className="text-[10px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded-full leading-none">
                NEW
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0d0d10] border-b border-white/5 flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">AuditRoast</span>
        </Link>
        <div className="flex items-center gap-3">
          <UserButton />
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-400 hover:text-white p-1"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-[#0d0d10] h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">AuditRoast</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-[#0d0d10] border-r border-white/5 flex-col">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">AuditRoast</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton />
            <span className="text-sm text-gray-400">Account</span>
          </div>
        </div>
      </aside>
    </>
  );
}
