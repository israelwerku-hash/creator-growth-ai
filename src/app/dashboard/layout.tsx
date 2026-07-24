import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/utils/supabase/server";

import { SignOutButton } from "@/components/SignOutButton";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { SidebarNav } from "@/components/SidebarNav";
import { db } from "@/lib/db";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  let creator = null;

  try {
    // Primary lookup by Supabase auth user ID
    creator = await db.creator.findUnique({
      where: { id: session.user.id },
      select: { aiCredits: true, tier: true, has_completed_onboarding: true, has_completed_pricing: true }
    });

    // Fallback: if ID lookup failed but we have an email, try email lookup.
    // This handles cases where the Creator row's ID doesn't match the Supabase user ID.
    if (!creator && session.user.email) {
      creator = await db.creator.findUnique({
        where: { email: session.user.email.toLowerCase().trim() },
        select: { aiCredits: true, tier: true, has_completed_onboarding: true, has_completed_pricing: true }
      });
    }
  } catch (error) {
    console.warn("Prisma connection pool timeout or error in dashboard layout:", error);
  }

  // If no creator row exists at all, this is genuinely a new user — send to onboarding
  if (!creator) {
    redirect("/onboarding");
  }

  // Route Gating that was removed from proxy.ts
  if (!creator.has_completed_onboarding) {
    redirect("/onboarding");
  }

  if (!creator.has_completed_pricing && creator.tier === "FREE") {
    redirect("/paywall");
  }

  const credits = creator.aiCredits ?? 0;
  const isAgency = creator.tier === "AGENCY";
  const tierDashLink = isAgency ? "/dashboard/agency" : "/dashboard";

  return (
    <div className="flex min-h-screen bg-app-black text-white font-sans selection:bg-white/20">
      
      {/* 1. Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-neutral-800/60 bg-app-black flex flex-col z-20 relative">
        <div className="p-5 border-b border-neutral-800/60">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shadow-glow-burgundy ${isAgency ? 'bg-white text-black' : 'bg-burgundy-primary text-white'}`}>
              {isAgency ? 'Ω' : '⚡'}
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm text-white block leading-tight">
                {isAgency ? 'Agency Elite' : (creator?.tier === 'PRO' ? 'Pro Creator' : 'Free Tier')}
              </span>
              <span className="text-[10px] text-zinc-600 font-medium">AI Growth Engine</span>
            </div>
          </div>
        </div>

        <SidebarNav isAgency={isAgency} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative">

        {/* 2. Top Navigation */}
        <header className="h-14 border-b border-neutral-800/60 bg-surface-dark flex items-center justify-between px-8 relative z-10">
          <div className="flex items-center">
            <h2 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Workspace</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-app-black border border-neutral-800/60 px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-burgundy-primary animate-pulse" />
              <span className="text-[11px] font-bold text-zinc-400">{credits} Credits</span>
            </div>
            
            <ProfileDropdown email={session.user.email || "User"} tier={creator.tier} />
          </div>
        </header>

        {/* 3. Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
