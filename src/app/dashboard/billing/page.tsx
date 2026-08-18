"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Loader2,
  CheckCircle2,
  Shield,
  TrendingUp,
  Crown,
  Sparkles,
  Receipt,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import { getUserTierAction } from "@/app/dashboard/actions";

// ─── PRODUCT CONFIG ─────────────────────────────────────────────────────────
const CREDIT_PACKAGES = [
  {
    id: "starter_bundle",
    name: "Starter Bundle",
    credits: 150,
    priceDisplay: "$9.99",
    priceCents: 999,
    tagline: "Perfect for testing the waters",
    badge: null,
    whopPlanId: process.env.NEXT_PUBLIC_WHOP_TOPUP_STARTER_PLAN_ID || "plan_EcrupRkcyUBbY",
    features: [
      "150 AI execution credits",
      "Access all standard features",
      "Credits never expire",
      "One-time purchase",
    ],
  },
  {
    id: "growth_pack",
    name: "Growth Pack",
    credits: 500,
    priceDisplay: "$24.99",
    priceCents: 2499,
    tagline: "Best for daily active creators",
    badge: "Most Popular",
    whopPlanId: process.env.NEXT_PUBLIC_WHOP_TOPUP_GROWTH_PLAN_ID || "plan_3RZaGXuKIGBkG",
    features: [
      "500 AI execution credits",
      "Best value per credit",
      "Priority queue processing",
      "Ideal for scaling output",
    ],
  },
  {
    id: "elite_vault",
    name: "Elite Vault",
    credits: 1500,
    priceDisplay: "$59.99",
    priceCents: 5999,
    tagline: "Designed for power users & agencies",
    badge: null,
    whopPlanId: process.env.NEXT_PUBLIC_WHOP_TOPUP_ELITE_PLAN_ID || "plan_YeAEmJVsE2pve",
    features: [
      "1,500 AI execution credits",
      "Maximum volume capacity",
      "Agency-grade throughput",
      "Bulk pricing advantage",
    ],
  },
] as const;

// ─── COMPONENT ──────────────────────────────────────────────────────────────
export default function BillingPage() {
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [tier, setTier] = useState<string>("FREE");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const tierRes = await getUserTierAction();
        if (tierRes.success) {
          if (tierRes.tier) setTier(tierRes.tier);
          if (tierRes.userId) setUserId(tierRes.userId);
        }

        const res = await fetch("/api/admin/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "GET_CREDITS" }),
        }).catch(() => null);

        if (res?.ok) {
          const data = await res.json();
          if (typeof data.credits === "number") setCredits(data.credits);
        }
      } catch {
        // Gracefully degrade
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handlePurchase = (pkg: (typeof CREDIT_PACKAGES)[number]) => {
    const checkoutUrl = `https://whop.com/checkout/${pkg.whopPlanId}${userId ? `?metadata[userId]=${userId}` : ""}`;
    window.open(checkoutUrl, "_blank");
  };

  const isPremium = tier === "PRO" || tier === "AGENCY" || tier === "PREMIUM";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-neutral-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">

      {/* ── Page Header ── */}
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Billing & Credits
        </h1>
        <p className="text-neutral-500 mt-2 text-sm">
          Top up your AI execution credits to keep your growth engine running.
        </p>
      </header>

      {/* ── Current Balance Card ── */}
      <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-700/40 to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex items-center justify-center shrink-0">
              <Zap className="w-7 h-7 text-neutral-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-600 mb-1">
                Available Balance
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white tabular-nums tracking-tight">
                  {credits !== null ? credits.toLocaleString() : "—"}
                </span>
                <span className="text-sm font-semibold text-neutral-600">
                  credits
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800/60">
              <div
                className={`w-2 h-2 rounded-full ${isPremium ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"}`}
              />
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                {tier} Tier
              </span>
            </div>
            {!isPremium && (
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800/60 text-xs font-bold text-neutral-400 hover:text-white hover:border-neutral-700 transition-all"
              >
                Upgrade <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Credit Packages Grid ── */}
      <div>
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-neutral-500" />
          Top-Up Packages
        </h2>
        <p className="text-neutral-600 text-sm mb-6">
          One-time credit purchases. No subscriptions, no commitments.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CREDIT_PACKAGES.map((pkg) => {
            const isPopular = pkg.badge === "Most Popular";

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-2xl p-[1px] transition-all duration-300 ${
                  isPopular
                    ? "bg-gradient-to-b from-[#6b1c1c]/60 via-neutral-900/0 to-neutral-900/0"
                    : ""
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#3d1111] border border-[#5c1a1a]/60 text-[10px] font-bold uppercase tracking-widest text-[#e8a0a0]">
                      <Crown className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div
                  className={`flex flex-col flex-1 rounded-2xl p-6 transition-all duration-300 ${
                    isPopular
                      ? "bg-neutral-950 border border-[#4a1616]/50 shadow-[0_0_30px_rgba(80,20,20,0.15)]"
                      : "bg-neutral-950/60 border border-neutral-800/50 hover:border-neutral-700/60"
                  }`}
                >
                  {/* Package Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                      isPopular
                        ? "bg-[#2a0e0e] border border-[#4a1616]/50"
                        : "bg-neutral-900 border border-neutral-800/60"
                    }`}
                  >
                    {pkg.id === "starter_bundle" && (
                      <Sparkles className={`w-5 h-5 ${isPopular ? "text-[#c46b6b]" : "text-neutral-500"}`} />
                    )}
                    {pkg.id === "growth_pack" && (
                      <TrendingUp className={`w-5 h-5 ${isPopular ? "text-[#c46b6b]" : "text-neutral-500"}`} />
                    )}
                    {pkg.id === "elite_vault" && (
                      <Shield className={`w-5 h-5 ${isPopular ? "text-[#c46b6b]" : "text-neutral-500"}`} />
                    )}
                  </div>

                  {/* Name & Tagline */}
                  <h3 className="text-base font-bold text-white mb-1">{pkg.name}</h3>
                  <p className="text-xs text-neutral-600 mb-5">{pkg.tagline}</p>

                  {/* Pricing Block */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-white tracking-tight">
                        {pkg.priceDisplay}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-1 font-medium">
                      {pkg.credits.toLocaleString()} credits · $
                      {(pkg.priceCents / 100 / pkg.credits).toFixed(3)}/credit
                    </p>
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-400">
                        <CheckCircle2
                          className={`w-4 h-4 mt-0.5 shrink-0 ${isPopular ? "text-[#8b3a3a]" : "text-neutral-700"}`}
                        />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Purchase Button */}
                  <button
                    type="button"
                    onClick={() => handlePurchase(pkg)}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] ${
                      isPopular
                        ? "bg-[#4a1616] text-[#f0c8c8] hover:bg-[#5c1a1a] border border-[#6b1c1c]/40 shadow-[0_0_20px_rgba(80,20,20,0.2)]"
                        : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800/60 hover:border-neutral-700"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    Purchase {pkg.credits.toLocaleString()} Credits
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Invoice History ── */}
      <div className="bg-neutral-950/60 border border-neutral-800/50 rounded-2xl p-6 sm:p-8">
        <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-neutral-600" />
          Transaction History
        </h2>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-neutral-800/60">
                <th className="pb-3 text-[11px] font-bold text-neutral-600 uppercase tracking-widest">Date</th>
                <th className="pb-3 text-[11px] font-bold text-neutral-600 uppercase tracking-widest">Description</th>
                <th className="pb-3 text-[11px] font-bold text-neutral-600 uppercase tracking-widest">Amount</th>
                <th className="pb-3 text-[11px] font-bold text-neutral-600 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="py-14 text-center text-neutral-700 text-sm font-medium">
                  No transactions recorded yet. Your purchase history will appear here.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
