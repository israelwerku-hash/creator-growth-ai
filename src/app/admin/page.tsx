import React from "react";
import { Users, Activity, Settings, Database, Server, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await getSession();

  // Redundant security check just in case proxy bypasses
  if (!session?.user) {
    redirect("/login");
  }

  // Primary lookup by user ID
  let creator = await db.creator.findUnique({
    where: { id: session.user.id },
    select: { role: true, email: true },
  });

  // Fallback: email-based lookup if ID lookup returned no row
  if (!creator && session.user.email) {
    creator = await db.creator.findUnique({
      where: { email: session.user.email.toLowerCase().trim() },
      select: { role: true, email: true },
    });
  }

  const dbRole = creator?.role?.toUpperCase();
  const rootAdminEmail = process.env.ADMIN_EMAIL;
  
  console.log('[ADMIN PAGE RBAC]', { 
    userId: session.user.id, 
    email: session.user.email, 
    dbRole, 
    rootAdminEmail 
  });

  // Block if role is not ADMIN, or if ADMIN_EMAIL is set and doesn't match
  if (dbRole !== "ADMIN" || (rootAdminEmail && session.user.email !== rootAdminEmail)) {
    redirect("/dashboard?error=unauthorized");
  }

  return (
    <div className="min-h-screen bg-app-black text-white font-sans selection:bg-white/20 p-8">
      
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-800/60 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-burgundy-primary/20 border border-burgundy-primary/40 flex items-center justify-center shadow-glow-burgundy">
              <ShieldCheck className="w-5 h-5 text-burgundy-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">System Command</h1>
          </div>
          <p className="text-zinc-500 text-sm font-medium">
            Master control panel for global platform operations. Logged in as <span className="text-zinc-300">{creator.email}</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-300 transition-colors"
          >
            Exit to Workspace
          </Link>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">

        {/* Card 1: Users & Creators */}
        <div className="bg-surface-dark border border-neutral-800/60 rounded-3xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50" />
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Creator Management</h2>
          <p className="text-zinc-500 text-sm mb-6 line-clamp-2">
            View active subscriptions, moderate accounts, and manually adjust AI credit allocations.
          </p>
          <Link href="/admin/creators" className="flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:text-blue-300 transition-colors w-fit">
            Manage Users <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Platform Analytics */}
        <div className="bg-surface-dark border border-neutral-800/60 rounded-3xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50" />
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Global Analytics</h2>
          <p className="text-zinc-500 text-sm mb-6 line-clamp-2">
            Monitor real-time platform revenue, AI generation volume, and active user retention metrics.
          </p>
          <Link href="/admin/analytics" className="flex items-center gap-2 text-sm font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors w-fit">
            View Metrics <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Database & Cache */}
        <div className="bg-surface-dark border border-neutral-800/60 rounded-3xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-50" />
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Database className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Database & Cache</h2>
          <p className="text-zinc-500 text-sm mb-6 line-clamp-2">
            Inspect Prisma pool health, flush Upstash Redis rate-limit keys, and run migrations.
          </p>
          <Link href="/admin/database" className="flex items-center gap-2 text-sm font-bold text-amber-400 group-hover:text-amber-300 transition-colors w-fit">
            System Status <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 4: System Settings */}
        <div className="bg-surface-dark border border-neutral-800/60 rounded-3xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors lg:col-span-3">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-500 to-zinc-400 opacity-50" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center shrink-0">
                <Settings className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Feature Flags & Routing</h2>
                <p className="text-zinc-500 text-sm">
                  Toggle experimental features, manage maintenance mode, and update AI model fallback chains globally.
                </p>
              </div>
            </div>
            <Link href="/admin/settings" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-zinc-800 rounded-xl text-sm font-bold text-white transition-colors whitespace-nowrap text-center">
              Configure Platform
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
