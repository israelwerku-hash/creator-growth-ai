import React from "react";
import Link from "next/link";
import { getSession } from "@/utils/supabase/server";
import { 
  Zap, Activity, Clock, ArrowRight, ShieldAlert, 
  CreditCard, Send, TrendingUp, TrendingDown,
  MessageSquare, Users, Languages, Database, 
  ChevronRight, Sparkles, BarChart3, Brain
} from "lucide-react";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session?.user?.id;
  
  let creator: any = null;
  let fanCount = 0;
  let memoryCount = 0;
  let recentLogs: any[] = [];

  if (userId) {
    try {
      creator = await db.creator.findUnique({
        where: { id: userId },
        select: { tier: true, aiCredits: true, name: true, email: true }
      });
    } catch (error) {
      console.warn("Prisma error fetching creator:", error);
    }

    try {
      fanCount = await db.fan.count({ where: { creatorId: userId } });
    } catch (error) {
      console.warn("Prisma error counting fans:", error);
    }

    try {
      memoryCount = await db.fanMemory.count({
        where: { fan: { creatorId: userId } }
      });
    } catch (error) {
      console.warn("Prisma error counting memories:", error);
    }

    try {
      recentLogs = await db.auditLog.findMany({
        where: { actor: userId },
        orderBy: { timestamp: "desc" },
        take: 5,
      });
    } catch (error) {
      console.warn("Prisma error fetching audit logs:", error);
    }
  }

  const isPremium = creator?.tier === "PRO" || creator?.tier === "AGENCY";
  const credits = creator?.aiCredits ?? 0;
  const tierLabel = creator?.tier === "AGENCY" ? "Agency Elite" : creator?.tier === "PRO" ? "Pro Creator" : "Free Tier";

  function formatLogAction(action: string): string {
    if (action.includes("DM_GENERATION")) return "DM Generation";
    if (action.includes("MEMORY_VAULT")) return "Memory Vault";
    if (action.includes("SEGMENTATION")) return "Segmentation";
    if (action.includes("TRANSLATOR")) return "Translation";
    if (action.includes("DATA_METRIC")) return "Data Metric";
    return action.replace("CREDIT_CONSUMPTION_", "").replace(/_/g, " ");
  }

  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "JUST NOW";
    if (diffMin < 60) return `${diffMin} MIN AGO`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} HR AGO`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}D AGO`;
  }

  const actionIcons: Record<string, typeof MessageSquare> = {
    "DM Generation": MessageSquare,
    "Memory Vault": Brain,
    "Segmentation": Users,
    "Translation": Languages,
    "Data Metric": BarChart3,
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      
      {/* Page Header */}
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="text-zinc-500 text-sm mt-1">Overview of your AI growth engine.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/dm-generation"
            prefetch={true}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-burgundy-primary text-white text-xs font-bold rounded-xl hover:brightness-110 transition-all duration-200 ease-out active:scale-[0.98] shadow-glow-burgundy uppercase tracking-wider"
          >
            <Zap className="w-3.5 h-3.5" /> New Campaign
          </Link>
        </div>
      </header>

      {/* LIVE METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-burgundy-primary/15 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-burgundy-primary" />
            </div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Credits</span>
          </div>
          <p className="text-3xl font-black tracking-tight text-white">{credits.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-600 mt-1">available balance</p>
        </div>

        <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-burgundy-primary/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-burgundy-primary" />
            </div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Fans</span>
          </div>
          <p className="text-3xl font-black tracking-tight text-white">{fanCount.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-600 mt-1">tracked fans</p>
        </div>

        <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-burgundy-primary/15 flex items-center justify-center">
              <Brain className="w-4 h-4 text-burgundy-primary" />
            </div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Vault</span>
          </div>
          <p className="text-3xl font-black tracking-tight text-white">{memoryCount.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-600 mt-1">memory entries</p>
        </div>

        <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-burgundy-primary/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-burgundy-primary" />
            </div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Tier</span>
          </div>
          <p className="text-lg font-black tracking-tight text-white">{tierLabel}</p>
          <p className="text-[10px] text-zinc-600 mt-1">account status</p>
        </div>
      </div>

      {/* MAIN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT COLUMN (3/5 width) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* CREDIT VAULT HERO CARD */}
          <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Credit Vault</h2>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-burgundy-primary" />
                <div className="w-2 h-2 rounded-full bg-neutral-700" />
                <div className="w-2 h-2 rounded-full bg-neutral-700" />
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-burgundy-dark via-[#0D0D0D] to-app-black rounded-2xl p-6 border border-burgundy-dark/60 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-burgundy-primary/10" />
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full border border-burgundy-primary/8" />
              
              <div className="relative z-10 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-burgundy-primary/20 border border-burgundy-primary/30 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-burgundy-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                        {creator?.tier === "AGENCY" ? "Agency Elite" : isPremium ? "Pro Creator Pass" : "Starter Pass"}
                      </p>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">ACCT-{userId ? userId.slice(0, 8).toUpperCase() : "------"}</p>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-burgundy-primary/60" />
                </div>

                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Available Balance</p>
                  <p className="text-4xl font-black tracking-tighter text-white">
                    {credits.toLocaleString()} <span className="text-lg text-zinc-500 font-medium">credits</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {isPremium ? (
                    <Link href="/dashboard/billing" className="flex items-center gap-2 px-4 py-2 bg-burgundy-primary/15 border border-burgundy-primary/30 rounded-xl text-xs font-bold text-white hover:bg-burgundy-primary/25 transition-all duration-200 active:scale-[0.98]">
                      <Send className="w-3.5 h-3.5" /> Add Credits
                    </Link>
                  ) : (
                    <Link href="/pricing" className="flex items-center gap-2 px-4 py-2 bg-burgundy-primary rounded-xl text-xs font-bold text-white hover:brightness-110 transition-all duration-200 active:scale-[0.98] shadow-glow-burgundy">
                      <ArrowRight className="w-3.5 h-3.5" /> Upgrade Plan
                    </Link>
                  )}
                  <Link href="/dashboard/billing" className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-neutral-800/60 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:border-burgundy-dark/50 transition-all duration-200 active:scale-[0.98]">
                    <BarChart3 className="w-3.5 h-3.5" /> Usage
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT GENERATIONS - LIVE FROM AUDIT LOG */}
          <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Recent Activity</h2>
            </div>

            <div className="flex flex-col">
              {recentLogs.length > 0 ? (
                recentLogs.map((log, i) => {
                  const label = formatLogAction(log.action);
                  const IconComp = actionIcons[label] || Activity;
                  const meta = (log.metadata as any) || {};
                  const cost = meta.cost ?? 0;
                  const isLast = i === recentLogs.length - 1;
                  return (
                    <div key={log.id} className={`flex items-center justify-between py-4 ${!isLast ? 'border-b border-neutral-800/40' : ''} group hover:bg-white/[0.01] -mx-2 px-2 rounded-xl transition-colors`}>
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-burgundy-dark/40 flex items-center justify-center group-hover:bg-burgundy-primary/20 transition-colors">
                          <IconComp className="w-5 h-5 text-zinc-400 group-hover:text-burgundy-primary transition-colors" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{label}</p>
                          <p className="text-xs text-zinc-600 mt-0.5">{cost} credits consumed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">-{cost} <span className="text-zinc-500 text-xs">credits</span></p>
                        <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">{formatTimeAgo(log.timestamp)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center">
                  <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500 font-semibold">No activity yet</p>
                  <p className="text-xs text-zinc-600 mt-1">Generate your first AI message to see activity here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (2/5 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* CAMPAIGN PERFORMANCE CHART */}
          <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Campaign Performance</h2>
              <div className="flex items-center gap-1 bg-app-black border border-neutral-800/60 rounded-lg px-2.5 py-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">This Month</span>
              </div>
            </div>

            <div className="relative h-44 w-full mb-6">
              <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
                <line x1="0" y1="40" x2="400" y2="40" stroke="#1a1a1a" strokeWidth="1" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="#1a1a1a" strokeWidth="1" />
                <line x1="0" y1="120" x2="400" y2="120" stroke="#1a1a1a" strokeWidth="1" />
                
                <path 
                  d="M0,140 L30,130 L80,110 L130,120 L180,80 L230,90 L280,50 L330,60 L380,30 L400,35 L400,160 L0,160 Z" 
                  fill="url(#burgundyGradient)" 
                />
                <path 
                  d="M0,140 L30,130 L80,110 L130,120 L180,80 L230,90 L280,50 L330,60 L380,30 L400,35" 
                  fill="none" 
                  stroke="#800020" 
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="280" cy="50" r="5" fill="#800020" stroke="#0A0A0A" strokeWidth="3" />
                
                <defs>
                  <linearGradient id="burgundyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(128,0,32,0.25)" />
                    <stop offset="100%" stopColor="rgba(128,0,32,0)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-app-black border border-neutral-800/60 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Fans</span>
                </div>
                <p className="text-xl font-black text-white">{fanCount}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">tracked this month</p>
              </div>
              <div className="bg-app-black border border-neutral-800/60 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-burgundy-primary/15 flex items-center justify-center">
                    <TrendingDown className="w-3.5 h-3.5 text-burgundy-primary" />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Vault</span>
                </div>
                <p className="text-xl font-black text-white">{memoryCount}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">memories stored</p>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Quick Actions</h2>
            </div>

            <div className="space-y-3">
              <Link href="/dashboard/dm-generation" className="flex items-center justify-between py-3 px-3 bg-app-black border border-neutral-800/60 rounded-xl hover:border-burgundy-dark/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-zinc-500 group-hover:text-burgundy-primary transition-colors" />
                  <span className="text-sm font-semibold text-white">Generate DM</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>
              <Link href="/dashboard/memory-vault" className="flex items-center justify-between py-3 px-3 bg-app-black border border-neutral-800/60 rounded-xl hover:border-burgundy-dark/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <Brain className="w-4 h-4 text-zinc-500 group-hover:text-burgundy-primary transition-colors" />
                  <span className="text-sm font-semibold text-white">Memory Vault</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>
              <Link href="/dashboard/translator" className="flex items-center justify-between py-3 px-3 bg-app-black border border-neutral-800/60 rounded-xl hover:border-burgundy-dark/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <Languages className="w-4 h-4 text-zinc-500 group-hover:text-burgundy-primary transition-colors" />
                  <span className="text-sm font-semibold text-white">Translator</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>
              <Link href="/dashboard/guide" className="flex items-center justify-between py-3 px-3 bg-app-black border border-neutral-800/60 rounded-xl hover:border-burgundy-dark/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-zinc-500 group-hover:text-burgundy-primary transition-colors" />
                  <span className="text-sm font-semibold text-white">Setup Guide</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>
            </div>
          </div>

          {/* CREDIT ALLOCATION */}
          <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Credit Costs</h2>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between py-3 border-b border-neutral-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-burgundy-dark/40 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">DM Generation</p>
                    <p className="text-[10px] text-zinc-600">Per generation</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-white">30 <span className="text-zinc-600 text-xs">credits</span></p>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-neutral-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-burgundy-dark/40 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Memory Vault</p>
                    <p className="text-[10px] text-zinc-600">Per save</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-white">25 <span className="text-zinc-600 text-xs">credits</span></p>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-neutral-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-burgundy-dark/40 flex items-center justify-center">
                    <Users className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Segmentation</p>
                    <p className="text-[10px] text-zinc-600">Per analysis</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-white">20 <span className="text-zinc-600 text-xs">credits</span></p>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-burgundy-dark/40 flex items-center justify-center">
                    <Languages className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Translation</p>
                    <p className="text-[10px] text-zinc-600">Per translation</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-white">20 <span className="text-zinc-600 text-xs">credits</span></p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}