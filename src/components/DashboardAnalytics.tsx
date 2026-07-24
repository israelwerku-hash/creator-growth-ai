"use client";

import React, { useState } from "react";
import { 
  Zap, 
  MessageSquare, 
  Users, 
  Database, 
  BarChart3, 
  Globe, 
  BrainCircuit, 
  Activity, 
  ArrowUpRight,
  TrendingUp,
  Clock
} from "lucide-react";

interface DashboardAnalyticsProps {
  // We mock the data via props so it can be wired to the DB later
  creditsAvailable?: number;
  maxCredits?: number;
}

export function DashboardAnalytics({ 
  creditsAvailable = 25, 
  maxCredits = 100 
}: DashboardAnalyticsProps) {
  
  const creditPercentage = Math.min(100, Math.max(0, (creditsAvailable / maxCredits) * 100));

  return (
    <div className="w-full min-h-screen bg-[#060913] text-slate-200 p-6 md:p-8 font-sans selection:bg-teal-500/30">
      
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-15%] left-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* 1. CREDIT FOOTPRINT MASTER HEADER */}
        <section className="bg-[#0D1224]/80 backdrop-blur-xl border border-slate-800/60 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-teal-400">
                <Zap className="w-5 h-5 fill-teal-400/20" />
                <h2 className="text-sm font-bold tracking-widest uppercase">Credit Footprint</h2>
              </div>
              <p className="text-3xl font-black text-white">
                {creditsAvailable} <span className="text-lg text-slate-500 font-medium">/ {maxCredits} Baseline</span>
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                Available operational capacity. Upgrade your tier to uncap background agent loops.
              </p>
            </div>

            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>Usage Allocation</span>
                <span className="text-teal-400">{creditPercentage.toFixed(0)}% Remaining</span>
              </div>
              <div className="h-3 w-full bg-[#060913] rounded-full border border-slate-800/80 overflow-hidden shadow-inner">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 via-indigo-500 to-violet-500 relative"
                  style={{ width: `${creditPercentage}%`, transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN METRICS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 2. AI DM GENERATION ENGINE MODULE (Takes 8 columns on large screens) */}
          <section className="lg:col-span-8 bg-[#0D1224]/60 backdrop-blur-md border border-slate-800/50 hover:border-violet-500/30 transition-all rounded-3xl p-6 group">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-violet-400">
                  <MessageSquare className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">AI DM Engine</h3>
                </div>
                <h4 className="text-xl font-semibold text-slate-100">Copy Dispatch Pipeline</h4>
              </div>
              <div className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Active Queue
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stat Block 1 */}
              <div className="bg-[#060913]/80 border border-slate-800/40 rounded-2xl p-5 hover:bg-[#060913] transition-colors">
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Total Dispatches</div>
                <div className="text-3xl font-black text-slate-100 mb-1">1,482</div>
                <div className="text-xs text-teal-400 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3" /> +14.2% this week
                </div>
              </div>
              {/* Stat Block 2 */}
              <div className="bg-[#060913]/80 border border-slate-800/40 rounded-2xl p-5 hover:bg-[#060913] transition-colors">
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Copy Sets Generated</div>
                <div className="text-3xl font-black text-slate-100 mb-1">345</div>
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <BrainCircuit className="w-3 h-3" /> 23 variants tested
                </div>
              </div>
              {/* Stat Block 3 */}
              <div className="bg-[#060913]/80 border border-slate-800/40 rounded-2xl p-5 hover:bg-[#060913] transition-colors">
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Run Frequency</div>
                <div className="text-3xl font-black text-slate-100 mb-1">4.2<span className="text-lg text-slate-500">/hr</span></div>
                <div className="text-xs text-violet-400 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3" /> Peak load stabilized
                </div>
              </div>
            </div>
          </section>

          {/* 3. AI SEGMENTATION FEATURE HUB (Takes 4 columns) */}
          <section className="lg:col-span-4 bg-[#0D1224]/60 backdrop-blur-md border border-slate-800/50 hover:border-teal-500/30 transition-all rounded-3xl p-6 flex flex-col justify-between group">
            <div className="space-y-1 mb-6">
              <div className="flex items-center gap-2 text-teal-400">
                <Users className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Segmentation Hub</h3>
              </div>
              <h4 className="text-xl font-semibold text-slate-100">Audience Sorting</h4>
            </div>

            <div className="space-y-4 flex-grow">
              {/* Fake List Items representing mapping */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#060913]/50 border border-slate-800/30 group-hover:border-teal-500/10 transition-colors">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-slate-200">Whale Spenders</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Top 5% Lifetime Value</div>
                </div>
                <div className="text-teal-400 font-mono text-sm">1,204</div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#060913]/50 border border-slate-800/30 group-hover:border-teal-500/10 transition-colors">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-slate-200">Churn Risks</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Inactive &gt; 14 days</div>
                </div>
                <div className="text-orange-400 font-mono text-sm">342</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#060913]/50 border border-slate-800/30 group-hover:border-teal-500/10 transition-colors">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-slate-200">Hyper-Engaged</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">High daily interaction</div>
                </div>
                <div className="text-violet-400 font-mono text-sm">8,912</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Active Filter Requests</span>
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                12 Pending <ArrowUpRight className="w-3 h-3 text-teal-400" />
              </span>
            </div>
          </section>

          {/* 4. DATA METRIC LOGGER COMPONENT (Takes 6 columns) */}
          <section className="lg:col-span-6 bg-[#0D1224]/60 backdrop-blur-md border border-slate-800/50 hover:border-blue-500/30 transition-all rounded-3xl p-6 relative overflow-hidden group">
            {/* Ambient Background Chart effect */}
            <div className="absolute inset-0 opacity-10 flex items-end justify-between px-4 pb-4 pointer-events-none">
               {[40, 70, 45, 90, 65, 100, 80, 110, 95].map((h, i) => (
                 <div key={i} className="w-[8%] bg-blue-400 rounded-t-sm transition-all duration-1000 group-hover:bg-blue-300" style={{ height: `${h}%` }} />
               ))}
            </div>

            <div className="relative z-10 space-y-1 mb-8">
              <div className="flex items-center gap-2 text-blue-400">
                <BarChart3 className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Metric Logger</h3>
              </div>
              <h4 className="text-xl font-semibold text-slate-100">Telemetry & Conversion</h4>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">System Logs Recorded</div>
                <div className="text-4xl font-black text-white">45.2K</div>
                <div className="text-xs text-blue-400">Total historical tracking points</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Outreach Conversion</div>
                <div className="text-4xl font-black text-white">18.4%</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Industry leading
                </div>
              </div>
            </div>
            
            <div className="relative z-10 mt-8 pt-4 border-t border-slate-800/50 text-xs text-slate-500">
              Live sync operational. Last analytics ingestion: 2 minutes ago.
            </div>
          </section>

          {/* 5. MEMORY VAULT & LANGUAGE TRANSLATOR TILES (Takes 6 columns, splits into 2 internal grids) */}
          <section className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Memory Vault Tile */}
            <div className="bg-[#0D1224]/60 backdrop-blur-md border border-slate-800/50 hover:border-pink-500/30 transition-all rounded-3xl p-6 flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-2 text-pink-400 mb-2">
                  <Database className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Memory Vault</h3>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed pr-4">
                  Autonomous context caching and operational state memory banks.
                </div>
              </div>
              <div className="mt-8 space-y-1">
                <div className="text-3xl font-black text-slate-100">842 <span className="text-lg text-slate-500 font-medium">MB</span></div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Profile Size</div>
              </div>
              <div className="mt-4 h-1.5 w-full bg-[#060913] rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 w-[65%] rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
              </div>
            </div>

            {/* Language Translator Hub Tile */}
            <div className="bg-[#0D1224]/60 backdrop-blur-md border border-slate-800/50 hover:border-indigo-500/30 transition-all rounded-3xl p-6 flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Globe className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Translator Hub</h3>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed pr-4">
                  Real-time localization arrays mapped across distinct language parameters.
                </div>
              </div>
              <div className="mt-8 space-y-1">
                <div className="text-3xl font-black text-slate-100">12.5K</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Localized Runs</div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-indigo-400 font-medium">
                <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> Seamless Sync</span>
                <span className="text-slate-500">22 Supported</span>
              </div>
            </div>

          </section>

        </div>
      </div>
    </div>
  );
}
