import React from "react";
import { PieChart, Send, MousePointerClick, TrendingUp, BarChart4 } from "lucide-react";

import { db } from "@/lib/db";
import { getSession } from "@/utils/supabase/server";
import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await getSession();
  const userId = session?.user?.id;
  
  let creator = null;
  if (userId) {
    creator = await db.creator.findUnique({ where: { id: userId }, select: { tier: true } });
    if (creator?.tier === "FREE") {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
          <div className="w-16 h-16 bg-red-950/30 rounded-2xl border border-red-900/30 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Feature Locked</h2>
            <p className="text-zinc-400 max-w-md mx-auto">This feature is part of the Enterprise Engine. Upgrade to Premium to unlock full Analytics and other advanced AI features.</p>
          </div>
          <Link href="/pricing" className="px-6 py-3 bg-burgundy-primary text-white font-bold rounded-xl hover:brightness-110 shadow-glow-burgundy flex items-center gap-2 transition-all active:scale-95">
            <ArrowRight className="w-4 h-4" /> Upgrade to Premium
          </Link>
        </div>
      );
    }
  }


  const userTier = creator?.tier || "FREE";
  
  // Hierarchical Logic Check
  const featureRequiresPro = true; // Analytics requires at least PRO
  const isLocked = featureRequiresPro && userTier === "FREE";

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Analytics</h1>
        <p className="text-zinc-400 mt-2">Track the performance and conversion metrics of your campaigns.</p>
      </header>

      {/* FEATURE LOCK OVERLAY */}
      {isLocked && (
        <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md rounded-3xl z-50 flex flex-col items-center justify-center text-center p-8 mt-20">
          <div className="bg-black/80 border border-burgundy-dark/40 rounded-2xl p-8 max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            <ShieldAlert className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Pro Feature</h3>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Advanced predictive analytics is a Pro feature. Upgrade your
              workspace to unlock demographic insights and conversion tracking.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-burgundy-primary text-white font-bold rounded-xl text-sm hover:brightness-110 transition-all duration-200 ease-out active:scale-[0.98] shadow-glow-burgundy"
            >
              Upgrade to Premium <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 3-Card Top Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isLocked ? 'opacity-20 pointer-events-none filter blur-sm' : ''}`}>
        {/* DMs Generated */}
        <div className="bg-surface-dark border border-neutral-800/60 transition-all duration-200 ease-out hover:border-burgundy-primary/50 hover:shadow-glow-subtle rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-burgundy-primary/30 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-burgundy-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-burgundy-primary/10 border border-burgundy-primary/20 flex items-center justify-center text-burgundy-primary">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className="text-sm text-zinc-400 font-medium mb-1">Total DMs Generated</p>
          <h3 className="text-3xl font-extrabold text-white">1,284</h3>
        </div>

        {/* Average Open Rate */}
        <div className="bg-surface-dark border border-neutral-800/60 transition-all duration-200 ease-out hover:border-burgundy-primary/50 hover:shadow-glow-subtle rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-burgundy-primary/30 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-burgundy-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-burgundy-primary/10 border border-burgundy-primary/20 flex items-center justify-center text-burgundy-primary">
              <PieChart className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +4%
            </span>
          </div>
          <p className="text-sm text-zinc-400 font-medium mb-1">Average Open Rate</p>
          <h3 className="text-3xl font-extrabold text-white">68.2%</h3>
        </div>

        {/* Link Clicks */}
        <div className="bg-surface-dark border border-neutral-800/60 transition-all duration-200 ease-out hover:border-burgundy-primary/50 hover:shadow-glow-subtle rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-burgundy-primary/30 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-burgundy-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-burgundy-primary/10 border border-burgundy-primary/20 flex items-center justify-center text-burgundy-primary">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +19%
            </span>
          </div>
          <p className="text-sm text-zinc-400 font-medium mb-1">Link Clicks Tracked</p>
          <h3 className="text-3xl font-extrabold text-white">452</h3>
        </div>
      </div>

      {/* Engagement Chart Placeholder */}
      <div className={`bg-surface-dark border border-neutral-800/60 transition-all duration-200 ease-out hover:border-burgundy-primary/50 hover:shadow-glow-subtle rounded-3xl p-8 shadow-xl ${isLocked ? 'opacity-20 pointer-events-none filter blur-sm' : ''}`}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BarChart4 className="w-5 h-5 text-burgundy-primary" /> Engagement Timeline
          </h2>
          <div className="px-3 py-1.5 rounded-lg border border-burgundy-dark/40 bg-white/5 text-xs text-zinc-400 font-medium">
            Last 30 Days
          </div>
        </div>

        <div className="h-[300px] w-full border border-dashed border-burgundy-dark/40 rounded-2xl bg-white/[0.02] flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle glowing accent for the chart container */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-blue-900/20 rounded-full blur-[80px] pointer-events-none" />
          
          <BarChart4 className="w-10 h-10 text-zinc-600 mb-4 relative z-10" />
          <p className="text-zinc-400 font-medium relative z-10">Insufficient Data</p>
          <p className="text-zinc-500 text-sm mt-1 max-w-sm text-center relative z-10">
            Your performance visualization will render here once you launch your first three targeted campaigns.
          </p>
        </div>
      </div>
    </div>
  );
}
