import React from "react";
import Link from "next/link";
import { getSession } from "@/utils/supabase/server";
import { 
  Zap, Activity, Clock, ArrowRight, ShieldAlert, 
  CreditCard, Send, TrendingUp, TrendingDown,
  MessageSquare, Users, Languages, Database, 
  ChevronRight, Sparkles, BarChart3
} from "lucide-react";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session?.user?.id;
  
  let creator = null;
  if (userId) {
    try {
      creator = await db.creator.findUnique({
        where: { id: userId },
        select: { tier: true, aiCredits: true }
      });
    } catch (error) {
      console.warn("Prisma error in dashboard/page.tsx:", error);
    }
  }

  const isPremium = creator?.tier === "PRO" || creator?.tier === "AGENCY";
  const credits = creator?.aiCredits ?? 0;

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

      {/* ============================================ */}
      {/* MAIN 2-COLUMN GRID (Banking Reference Layout) */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ============================== */}
        {/* LEFT COLUMN (3/5 width)        */}
        {/* ============================== */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* ─── CREDIT VAULT HERO CARD (mapped from "My Card") ─── */}
          <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Credit Vault</h2>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-burgundy-primary" />
                <div className="w-2 h-2 rounded-full bg-neutral-700" />
                <div className="w-2 h-2 rounded-full bg-neutral-700" />
              </div>
            </div>

            {/* The "Card" itself */}
            <div className="relative bg-gradient-to-br from-burgundy-dark via-[#0D0D0D] to-app-black rounded-2xl p-6 border border-burgundy-dark/60 overflow-hidden">
              {/* Decorative circles like a real bank card */}
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
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">•••• •••• •••• 4920</p>
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

          {/* ─── RECENT TRANSACTIONS / GENERATION LOGS (mapped from "Recent Transactions") ─── */}
          <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Recent Generations</h2>
              <button className="text-[10px] font-bold text-burgundy-primary hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1">
                See All <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col">
              {/* Transaction Row 1 */}
              <div className="flex items-center justify-between py-4 border-b border-neutral-800/40 group hover:bg-white/[0.01] -mx-2 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-burgundy-dark/40 flex items-center justify-center group-hover:bg-burgundy-primary/20 transition-colors">
                    <MessageSquare className="w-5 h-5 text-zinc-400 group-hover:text-burgundy-primary transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">DM Generation — Tech Founders</p>
                    <p className="text-xs text-zinc-600 mt-0.5">Campaign #001 · Batch complete</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">-12 <span className="text-zinc-500 text-xs">credits</span></p>
                  <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">2 MIN AGO</p>
                </div>
              </div>

              {/* Transaction Row 2 */}
              <div className="flex items-center justify-between py-4 border-b border-neutral-800/40 group hover:bg-white/[0.01] -mx-2 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-burgundy-dark/40 flex items-center justify-center group-hover:bg-burgundy-primary/20 transition-colors">
                    <Users className="w-5 h-5 text-zinc-400 group-hover:text-burgundy-primary transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">AI Segmentation — Fitness Niche</p>
                    <p className="text-xs text-zinc-600 mt-0.5">Audience cluster analysis</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">-8 <span className="text-zinc-500 text-xs">credits</span></p>
                  <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">1 HR AGO</p>
                </div>
              </div>

              {/* Transaction Row 3 */}
              <div className="flex items-center justify-between py-4 border-b border-neutral-800/40 group hover:bg-white/[0.01] -mx-2 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-burgundy-dark/40 flex items-center justify-center group-hover:bg-burgundy-primary/20 transition-colors">
                    <Languages className="w-5 h-5 text-zinc-400 group-hover:text-burgundy-primary transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Translation — Spanish Captions</p>
                    <p className="text-xs text-zinc-600 mt-0.5">Batch localization complete</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">-4 <span className="text-zinc-500 text-xs">credits</span></p>
                  <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">3 HRS AGO</p>
                </div>
              </div>

              {/* Transaction Row 4 */}
              <div className="flex items-center justify-between py-4 group hover:bg-white/[0.01] -mx-2 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Zap className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">System Initialization</p>
                    <p className="text-xs text-zinc-600 mt-0.5">Account provisioned & keys synced</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">+500 <span className="text-zinc-500 text-xs">credits</span></p>
                  <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">TODAY</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================== */}
        {/* RIGHT COLUMN (2/5 width)       */}
        {/* ============================== */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* ─── CAMPAIGN TRAJECTORY CHART (mapped from "Monthly" chart) ─── */}
          <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Campaign Performance</h2>
              <div className="flex items-center gap-1 bg-app-black border border-neutral-800/60 rounded-lg px-2.5 py-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">This Month</span>
              </div>
            </div>

            {/* SVG Minimalist Line Chart */}
            <div className="relative h-44 w-full mb-6">
              <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="40" x2="400" y2="40" stroke="#1a1a1a" strokeWidth="1" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="#1a1a1a" strokeWidth="1" />
                <line x1="0" y1="120" x2="400" y2="120" stroke="#1a1a1a" strokeWidth="1" />
                
                {/* Area fill */}
                <path 
                  d="M0,140 L30,130 L80,110 L130,120 L180,80 L230,90 L280,50 L330,60 L380,30 L400,35 L400,160 L0,160 Z" 
                  fill="url(#burgundyGradient)" 
                />
                {/* Line */}
                <path 
                  d="M0,140 L30,130 L80,110 L130,120 L180,80 L230,90 L280,50 L330,60 L380,30 L400,35" 
                  fill="none" 
                  stroke="#800020" 
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data point highlight */}
                <circle cx="280" cy="50" r="5" fill="#800020" stroke="#0A0A0A" strokeWidth="3" />
                
                <defs>
                  <linearGradient id="burgundyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(128,0,32,0.25)" />
                    <stop offset="100%" stopColor="rgba(128,0,32,0)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Floating callout badge */}
              <div className="absolute top-4 right-12 bg-burgundy-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-glow-burgundy">
                +24% ↑
              </div>
            </div>

            {/* Income/Expense Pills (mapped to Tokens Generated vs Credits Consumed) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-app-black border border-neutral-800/60 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Generated</span>
                </div>
                <p className="text-xl font-black text-white">147</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">tokens this month</p>
              </div>
              <div className="bg-app-black border border-neutral-800/60 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-burgundy-primary/15 flex items-center justify-center">
                    <TrendingDown className="w-3.5 h-3.5 text-burgundy-primary" />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Consumed</span>
                </div>
                <p className="text-xl font-black text-white">24</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">credits this month</p>
              </div>
            </div>
          </div>

          {/* ─── AUTOMATIONS / SAVED PROMPTS (mapped from "My Savings") ─── */}
          <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Automations</h2>
              <span className="text-[10px] font-bold text-burgundy-primary bg-burgundy-primary/10 border border-burgundy-primary/20 px-2 py-0.5 rounded-md">
                {isPremium ? "3 Active" : "0 Active"}
              </span>
            </div>

            <div className="space-y-4">
              {/* Automation Item 1 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-white">DM Follow-up Sequence</p>
                  <span className="text-[10px] text-zinc-500 font-mono">72%</span>
                </div>
                <div className="w-full bg-app-black rounded-full h-1.5 border border-white/5 overflow-hidden">
                  <div className="h-full w-[72%] bg-burgundy-primary rounded-full" />
                </div>
              </div>

              {/* Automation Item 2 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-white">Re-engagement Drip</p>
                  <span className="text-[10px] text-zinc-500 font-mono">45%</span>
                </div>
                <div className="w-full bg-app-black rounded-full h-1.5 border border-white/5 overflow-hidden">
                  <div className="h-full w-[45%] bg-burgundy-primary rounded-full" />
                </div>
              </div>

              {/* Automation Item 3 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-white">Welcome Funnel Script</p>
                  <span className="text-[10px] text-zinc-500 font-mono">100%</span>
                </div>
                <div className="w-full bg-app-black rounded-full h-1.5 border border-white/5 overflow-hidden">
                  <div className="h-full w-full bg-emerald-500/70 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* ─── CATEGORY BREAKDOWN (mapped from "Total Spend") ─── */}
          <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Credit Allocation</h2>
              <button className="text-[10px] font-bold text-burgundy-primary hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1">
                Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col">
              {/* Category Row 1 */}
              <div className="flex items-center justify-between py-3 border-b border-neutral-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-burgundy-dark/40 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">DM Generation</p>
                    <p className="text-[10px] text-zinc-600">Primary engine</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-white">12 <span className="text-zinc-600 text-xs">used</span></p>
              </div>

              {/* Category Row 2 */}
              <div className="flex items-center justify-between py-3 border-b border-neutral-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-burgundy-dark/40 flex items-center justify-center">
                    <Users className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">AI Segmentation</p>
                    <p className="text-[10px] text-zinc-600">Audience clustering</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-white">8 <span className="text-zinc-600 text-xs">used</span></p>
              </div>

              {/* Category Row 3 */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-burgundy-dark/40 flex items-center justify-center">
                    <Languages className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Language Translator</p>
                    <p className="text-[10px] text-zinc-600">Content localization</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-white">4 <span className="text-zinc-600 text-xs">used</span></p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}