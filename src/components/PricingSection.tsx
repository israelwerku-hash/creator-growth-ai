"use client";

import React, { useState } from "react";
import { Check, Star, Zap, Lock } from "lucide-react";

const features = [
  { id: "dm", name: "AI DM Generation Engine" },
  { id: "segmentation", name: "AI Segmentation" },
  { id: "logger", name: "Data Metric Logger" },
  { id: "memory", name: "Memory Vault" },
  { id: "translator", name: "Language Translator Hub" },
];

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="w-full min-h-screen bg-[#04060A] text-white flex flex-col items-center justify-center py-16 px-4 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-70" />

      {/* Header & Toggle */}
      <div className="text-center z-10 mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-6">
          Ready to deploy your engine?
        </h2>

        {/* Billing Switcher */}
        <div className="inline-flex bg-[#0D111C] border border-[#1F2A45] p-1 rounded-xl">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
              billingCycle === "monthly"
                ? "bg-white text-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              billingCycle === "yearly"
                ? "bg-white text-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Annual
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              Save 15%+
            </span>
          </button>
        </div>
      </div>

      {/* 3-Column Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl z-10 items-stretch px-2">

        {/* Starter ($0) */}
        <div className="border border-[#1F2A45] bg-[#0A0D14]/60 backdrop-blur-sm rounded-3xl p-8 flex flex-col justify-between transition-all hover:border-zinc-700">
          <div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold tracking-tight text-white">Starter</h3>
              <p className="text-xs text-zinc-400 mt-2 min-h-[32px]">
                Explore baseline capabilities risk-free.
              </p>
            </div>
            <div className="text-center my-6">
              <span className="text-5xl font-black text-white">$0</span>
              <span className="text-xs text-zinc-500 block mt-1">/ month</span>
            </div>
            <div className="space-y-3.5 my-8 border-t border-[#1F2A45]/40 pt-6">
              {features.map((feature) => {
                const unlocked = feature.id === "dm";
                return (
                  <div key={feature.id} className={`flex items-start gap-3 text-xs ${unlocked ? "text-zinc-300" : "text-zinc-600 line-through opacity-50"}`}>
                    {unlocked ? (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#00bfff]/10 border border-[#00bfff]/30">
                        <Check className="w-3 h-3 text-[#00bfff]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800">
                        <Lock className="w-3 h-3 text-zinc-600" />
                      </div>
                    )}
                    <span className="mt-0.5">{feature.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <button className="w-full bg-transparent border border-zinc-700 hover:border-white text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all hover:bg-white/5 active:scale-[0.98]">
            Get Started Free
          </button>
        </div>

        {/* Professional ($25 / $20) */}
        <div className="border-2 border-[#00ffcc] bg-[#0A0D14] rounded-3xl p-8 flex flex-col justify-between relative shadow-2xl shadow-[#00ffcc]/5 transform md:-translate-y-2">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00ffcc] text-black text-[11px] font-black uppercase tracking-widest px-4 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Star className="w-3 h-3 fill-current" /> Most Popular
          </div>
          <div>
            <div className="text-center mb-6 mt-2">
              <h3 className="text-xl font-bold tracking-tight text-white">Professional</h3>
              <p className="text-xs text-zinc-400 mt-2 min-h-[32px]">
                Ideal for growing creators and serious scale.
              </p>
            </div>
            <div className="text-center my-6">
              <span className="text-5xl font-black text-white">
                ${billingCycle === "monthly" ? "25" : "20"}
              </span>
              <span className="text-xs text-zinc-500 block mt-1">/ month</span>
            </div>
            <div className="space-y-3.5 my-8 border-t border-zinc-800 pt-6">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-start gap-3 text-xs text-zinc-200">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#00ffcc]/10 border border-[#00ffcc]/30">
                    <Check className="w-3 h-3 text-[#00ffcc]" />
                  </div>
                  <span className="font-medium mt-0.5">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full bg-[#00ffcc] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5">
            Upgrade to Pro <Zap className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Agency ($80 / $69) */}
        <div className="border border-[#1F2A45] bg-[#0A0D14]/60 backdrop-blur-sm rounded-3xl p-8 flex flex-col justify-between transition-all hover:border-[#ff007f]/50">
          <div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold tracking-tight text-white">Agency</h3>
              <p className="text-xs text-zinc-400 mt-2 min-h-[32px]">
                Built for teams, agencies, and advanced needs.
              </p>
            </div>
            <div className="text-center my-6">
              <span className="text-5xl font-black text-white">
                ${billingCycle === "monthly" ? "80" : "69"}
              </span>
              <span className="text-xs text-zinc-500 block mt-1">/ month</span>
            </div>
            <div className="space-y-3.5 my-8 border-t border-[#1F2A45]/40 pt-6">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-start gap-3 text-xs text-zinc-300">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#ff007f]/10 border border-[#ff007f]/30">
                    <Check className="w-3 h-3 text-[#ff007f]" />
                  </div>
                  <span className="mt-0.5">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full bg-transparent border border-[#ff007f]/50 hover:border-[#ff007f] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all hover:bg-[#ff007f]/10 active:scale-[0.98]">
            Deploy Scale Tier
          </button>
        </div>

      </div>
    </div>
  );
}