"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, Zap, Crown, Building2, Loader2, X } from "lucide-react";
import { PaddleCheckoutButton } from "@/components/PaddleCheckoutButton";
import { activateFreePlanAction } from "@/app/dashboard/actions";
import { createClient } from "@/utils/supabase/client";

export default function PaywallPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [loadingTier, setLoadingTier] = useState<"PRO" | "AGENCY" | null>(null);
  const [isActivatingFree, setIsActivatingFree] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, [supabase.auth]);

  const handleFreeActivation = async () => {
    setIsActivatingFree(true);
    const res = await activateFreePlanAction();
    if (res.success) {
      router.push("/dashboard");
    } else {
      setIsActivatingFree(false);
    }
  };

  useEffect(() => {
    if (loadingTier) {
      const timer = setTimeout(() => {
        router.push(`/welcome?tier=${loadingTier.toLowerCase()}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loadingTier, router]);

  // Map env price IDs for clean access
  const priceIds = {
    proMonthly: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID ?? "pri_pro_mo",
    proAnnual: process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_ID ?? "pri_pro_yr",
    agencyMonthly: process.env.NEXT_PUBLIC_PADDLE_AGENCY_MONTHLY_ID ?? "pri_agency_mo",
    agencyAnnual: process.env.NEXT_PUBLIC_PADDLE_AGENCY_YEARLY_ID ?? "pri_agency_yr",
  };

  if (loadingTier) {
    return (
      <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-16 h-16 text-[#800020] animate-spin mb-6" />
        <h2 className="text-2xl font-bold tracking-tight mb-2">Securing your premium credentials...</h2>
        <p className="text-zinc-500 text-sm">Please wait while we initialize your workspace.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 py-20 selection:bg-white/20 font-sans relative">
      {/* Escape Hatch */}
      <div className="absolute top-8 right-8">
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
          }}
          className="text-sm font-medium text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
        >
          Sign Out
        </button>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mb-14">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">
          Stop leaving revenue on the table.
        </h1>
        <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
          Manual outreach is costing you time and burning warm leads. Automate the friction.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center gap-4 mb-14">
        <span className={`text-sm font-semibold transition-colors ${!isAnnual ? "text-white" : "text-zinc-500"}`}>
          Bill Monthly
        </span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className="relative w-16 h-8 rounded-full bg-zinc-800 border border-zinc-700 transition-colors focus:outline-none"
          aria-label="Toggle billing period"
        >
          <div
            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-[0_0_10px_rgba(128,0,32,0.5)] transition-all duration-300 ${
              isAnnual ? "left-[calc(100%-1.75rem)]" : "left-1"
            }`}
          />
        </button>
        <span className={`text-sm font-semibold transition-colors ${isAnnual ? "text-white" : "text-zinc-500"}`}>
          Bill Annually
          <span className="ml-2 text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Save ~25%
          </span>
        </span>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full items-stretch">

        {/* ──────────── CARD 1: FREE TIER ──────────── */}
        <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-[2rem] p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Zap className="w-5 h-5 text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-300">Free Tier</h3>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-black tracking-tight">$0</span>
            </div>
            <p className="text-sm text-zinc-500 mb-8 pb-6 border-b border-zinc-800/50 font-medium">
              Forever free — no credit card required
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0" />
                DM Generation Unlocked
              </li>
              <li className="flex items-center gap-3 text-[13px] text-zinc-500">
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono shrink-0">50 cr/use</span>
                Credit consumption per execution
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                <Lock className="w-4 h-4 text-zinc-800 shrink-0" />
                Advanced AI Model Tuning
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                <Lock className="w-4 h-4 text-zinc-800 shrink-0" />
                Fan Segmentation Engine
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                <Lock className="w-4 h-4 text-zinc-800 shrink-0" />
                Priority Generation Queue
              </li>
            </ul>
          </div>

          <button
            onClick={handleFreeActivation}
            disabled={isActivatingFree}
            className="block w-full py-3.5 rounded-xl border border-zinc-800 text-center text-sm font-bold hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActivatingFree ? "Activating..." : "Get Started Free"}
          </button>
        </div>

        {/* ──────────── CARD 2: PRO TIER (MOST POPULAR) ──────────── */}
        <div className="relative bg-[#0A0A0A] border border-neutral-800 rounded-[2rem] p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(128,0,32,0.15)] md:-translate-y-3">
          {/* Glow overlay */}
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-[#800020]/10 to-transparent pointer-events-none" />
          {/* Badge */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] uppercase tracking-wider">
            Most Popular
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#800020]/20 border border-[#800020]/50 flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#800020]" />
              </div>
              <h3 className="text-lg font-bold text-white">Pro Access</h3>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-black tracking-tight">
                ${isAnnual ? "49" : "59"}
              </span>
              <span className="text-zinc-400 font-medium text-sm">/ mo</span>
            </div>
            <p className="text-sm text-zinc-400 mb-6 font-medium">
              {isAnnual ? "Billed annually at $588/yr" : "Billed monthly — cancel anytime"}
            </p>

            <div className="bg-[#111111] border border-neutral-800/80 rounded-xl p-4 mb-8 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-[#800020]" />
                <span className="text-sm font-bold text-white tracking-wide">500 Generation Credits</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Monthly</span>
            </div>

            <ul className="space-y-5 mb-8">
              <li className="flex items-start gap-3 text-sm">
                <X className="w-4 h-4 text-[#800020] shrink-0 mt-0.5" />
                <div>
                  <span className="line-through text-zinc-500 block mb-0.5">Losing warm leads to delayed replies.</span>
                  <span className="text-white font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Instant automated capture.</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <X className="w-4 h-4 text-[#800020] shrink-0 mt-0.5" />
                <div>
                  <span className="line-through text-zinc-500 block mb-0.5">15+ hours typed manually every week.</span>
                  <span className="text-white font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Automated at scale.</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <X className="w-4 h-4 text-[#800020] shrink-0 mt-0.5" />
                <div>
                  <span className="line-through text-zinc-500 block mb-0.5">Hidden PPV margins left uncaptured.</span>
                  <span className="text-white font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Maximized revenue extraction.</span>
                </div>
              </li>
            </ul>
          </div>

          <PaddleCheckoutButton
            priceId={isAnnual ? priceIds.proAnnual : priceIds.proMonthly}
            label="Activate Growth Engine"
            variant="primary"
            userId={userId}
            onTriggerLoading={(plan) => setLoadingTier(plan || "PRO")}
          />
        </div>

        {/* ──────────── CARD 3: AGENCY TIER ──────────── */}
        <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-[2rem] p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-300">Agency Tier</h3>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-black tracking-tight">
                ${isAnnual ? "149" : "199"}
              </span>
              <span className="text-zinc-500 font-medium text-sm">/ mo</span>
            </div>
            <p className="text-sm text-zinc-500 mb-8 pb-6 border-b border-zinc-800/50 font-medium">
              {isAnnual ? "Billed annually at $1,788/yr" : "Billed monthly — cancel anytime"}
            </p>

            <ul className="space-y-5 mb-8">
              <li className="flex items-center gap-3 text-sm text-zinc-300 font-medium pb-2 border-b border-neutral-800/60">
                <Zap className="w-4 h-4 text-white shrink-0" />
                6000 Generation Credits Included / mo
              </li>
              <li className="flex items-start gap-3 text-sm">
                <X className="w-4 h-4 text-[#800020] shrink-0 mt-0.5" />
                <div>
                  <span className="line-through text-zinc-500 block mb-0.5">Drowning in multiple inboxes and 24/7 emotional labor.</span>
                  <span className="text-white font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Centralized control. Reclaim your time.</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <X className="w-4 h-4 text-[#800020] shrink-0 mt-0.5" />
                <div>
                  <span className="line-through text-zinc-500 block mb-0.5">Sounding like a generic bot and ruining fan connections.</span>
                  <span className="text-white font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Custom AI perfectly clones your unique voice.</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <X className="w-4 h-4 text-[#800020] shrink-0 mt-0.5" />
                <div>
                  <span className="line-through text-zinc-500 block mb-0.5">Troubleshooting alone when the algorithm shifts.</span>
                  <span className="text-white font-medium flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Elite 24/7 VIP support. We handle the friction.</span>
                </div>
              </li>
            </ul>
          </div>

          <PaddleCheckoutButton
            priceId={isAnnual ? priceIds.agencyAnnual : priceIds.agencyMonthly}
            label="Delegate & Scale Now"
            variant="secondary"
            userId={userId}
            onTriggerLoading={(plan) => setLoadingTier(plan || "AGENCY")}
          />
        </div>

      </div>

      {/* Skip / Free CTA */}
      <div className="mt-12 text-center">
        <button 
          onClick={handleFreeActivation}
          disabled={isActivatingFree}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isActivatingFree ? "Skipping..." : "Skip for now — continue with Free Tier"}
        </button>
      </div>
    </div>
  );
}
