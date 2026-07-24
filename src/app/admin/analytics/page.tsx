import React from "react";
import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminAnalyticsPlaceholder() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const creator = await db.creator.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (creator?.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  // 1. Total Subscriptions/Platform MRR (Sum of revenue events)
  const revenueAgg = await db.revenueEvent.aggregate({
    _sum: { amount: true },
  });
  const totalRevenue = (revenueAgg._sum.amount || 0) / 100; // Assuming stored in cents

  // 2. Platform Engagement (Total fans managed)
  const totalFans = await db.fan.count();

  // 3. AI Volume (Total generated memories + messages)
  const totalMemories = await db.fanMemory.count();
  const totalMessages = await db.message.count();
  const totalGenerations = totalMemories + totalMessages;

  return (
    <div className="min-h-screen bg-app-black text-white font-sans selection:bg-white/20 p-8">
      
      {/* Header */}
      <header className="mb-10 border-b border-neutral-800/60 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="w-10 h-10 rounded-xl bg-white/5 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Global Analytics</h1>
            </div>
            <p className="text-zinc-500 text-sm font-medium">Platform-wide data telemetry and charts.</p>
          </div>
        </div>
      </header>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Revenue Card */}
        <div className="bg-surface-dark border border-neutral-800/60 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Total Platform Revenue</h3>
          <p className="text-4xl font-extrabold text-white mb-2">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-emerald-400 text-xs font-bold bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
            Lifetime Gross
          </p>
        </div>

        {/* Engagement Card */}
        <div className="bg-surface-dark border border-neutral-800/60 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Platform Engagement</h3>
          <p className="text-4xl font-extrabold text-white mb-2">
            {totalFans.toLocaleString()}
          </p>
          <p className="text-blue-400 text-xs font-bold bg-blue-500/10 w-fit px-2 py-1 rounded-md">
            Active Fan Profiles
          </p>
        </div>

        {/* AI Volume Card */}
        <div className="bg-surface-dark border border-neutral-800/60 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
          <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Total AI Volume</h3>
          <p className="text-4xl font-extrabold text-white mb-2">
            {totalGenerations.toLocaleString()}
          </p>
          <p className="text-purple-400 text-xs font-bold bg-purple-500/10 w-fit px-2 py-1 rounded-md">
            Generations Executed
          </p>
        </div>

      </div>
    </div>
  );
}
