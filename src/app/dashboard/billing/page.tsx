"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
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
  AlertTriangle,
} from "lucide-react";
import { getUserTierAction } from "@/app/dashboard/actions";

// ─── PADDLE CONFIG ──────────────────────────────────────────────────────────
// 🔑 HOW TO SET UP:
//
// 1. Go to your Paddle Sandbox Dashboard → Catalog → Products → Create a Product
//    for each credit bundle ("Starter Bundle", "Growth Pack", "Elite Vault").
//
// 2. Under each Product, create a one-time Price. Paddle will generate a
//    price ID like "pri_01j..." — copy that value.
//
// 3. Paste each price ID into your .env.local file:
//
//    NEXT_PUBLIC_PADDLE_STARTER_PRICE_ID=pri_01j...your_real_id...
//    NEXT_PUBLIC_PADDLE_GROWTH_PRICE_ID=pri_01j...your_real_id...
//    NEXT_PUBLIC_PADDLE_ELITE_PRICE_ID=pri_01j...your_real_id...
//
// 4. Your client token is already set:
//    NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_1336f71bda8da651f56f09e3896
//
// 5. Restart `npm run dev` after editing .env.local for changes to take effect.
// ─────────────────────────────────────────────────────────────────────────────

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
    // ⚠️ Replace with your REAL Paddle sandbox price ID (pri_01j...)
    paddlePriceId: process.env.NEXT_PUBLIC_PADDLE_STARTER_PRICE_ID || "",
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
    // ⚠️ Replace with your REAL Paddle sandbox price ID (pri_01j...)
    paddlePriceId: process.env.NEXT_PUBLIC_PADDLE_GROWTH_PRICE_ID || "",
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
    // ⚠️ Replace with your REAL Paddle sandbox price ID (pri_01j...)
    paddlePriceId: process.env.NEXT_PUBLIC_PADDLE_ELITE_PRICE_ID || "",
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
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [paddleReady, setPaddleReady] = useState(false);
  const [paddleError, setPaddleError] = useState<string | null>(null);

  // ── Paddle Event Callback (debug all events) ──
  const handlePaddleEvent = useCallback((event: any) => {
    console.log("[Paddle Event]", event.name || event.type || "unknown", event);

    switch (event.name) {
      case "checkout.loaded":
        console.log("✅ [Paddle] Checkout overlay loaded successfully.");
        break;
      case "checkout.completed":
        console.log("✅ [Paddle] Payment completed!", event.data);
        router.refresh();
        break;
      case "checkout.closed":
        console.log("ℹ️ [Paddle] Checkout overlay was closed by user.");
        setPurchasingId(null);
        break;
      case "checkout.error":
        console.error("❌ [Paddle] Checkout error:", event.data);
        setPaddleError(
          `Paddle checkout error: ${event.data?.error?.detail || event.data?.error?.code || JSON.stringify(event.data)}`
        );
        setPurchasingId(null);
        break;
      case "checkout.warning":
        console.warn("⚠️ [Paddle] Checkout warning:", event.data);
        break;
      case "checkout.customer.created":
        console.log("✅ [Paddle] Customer created:", event.data);
        break;
      case "checkout.payment.initiated":
        console.log("💳 [Paddle] Payment initiated:", event.data);
        break;
      case "checkout.payment.failed":
        console.error("❌ [Paddle] Payment failed:", event.data);
        setPaddleError("Payment was declined. Please try a different card.");
        setPurchasingId(null);
        break;
      default:
        console.log(`[Paddle] Unhandled event: ${event.name}`, event);
    }
  }, [router]);

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch tier and userId
        const tierRes = await getUserTierAction();
        if (tierRes.success) {
          if (tierRes.tier) setTier(tierRes.tier);
          if (tierRes.userId) setUserId(tierRes.userId);
        }

        // Fetch credits
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

  // ── Initialize Paddle SDK after script loads ──
  const initializePaddle = useCallback(() => {
    if (!window.Paddle) {
      console.error("❌ [Paddle] window.Paddle is undefined after script load.");
      setPaddleError("Paddle SDK failed to attach to window.");
      return;
    }

    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENV || "sandbox";

    console.log("[Paddle Init] Environment:", environment);
    console.log("[Paddle Init] Client Token:", clientToken ? `${clientToken.substring(0, 12)}...` : "⚠️ MISSING");

    if (!clientToken) {
      setPaddleError(
        "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set in .env.local. " +
        "Go to Paddle Dashboard → Developer Tools → Authentication → copy your client-side token."
      );
      return;
    }

    try {
      window.Paddle.Environment.set(environment as any);
      window.Paddle.Initialize({
        token: clientToken,
        eventCallback: handlePaddleEvent,
      });

      console.log("✅ [Paddle] SDK initialized successfully in", environment, "mode.");
      setPaddleReady(true);
    } catch (err: any) {
      console.error("❌ [Paddle] Initialization failed:", err);
      setPaddleError(`Paddle initialization error: ${err.message}`);
    }
  }, [handlePaddleEvent]);

  const handlePurchase = async (pkg: (typeof CREDIT_PACKAGES)[number]) => {
    setPurchasingId(pkg.id);
    setPaddleError(null);

    try {
      // ── Pre-flight checks ──
      if (!userId) {
        throw new Error("Authentication error: User ID is missing. Please refresh the page and ensure you are logged in.");
      }

      if (!window.Paddle) {
        throw new Error("Paddle SDK is not loaded. Please refresh the page.");
      }

      if (!paddleReady) {
        throw new Error("Paddle SDK has not finished initializing. Please wait a moment and try again.");
      }

      if (!pkg.paddlePriceId) {
        throw new Error(
          `No Paddle Price ID configured for "${pkg.name}". ` +
          `Set NEXT_PUBLIC_PADDLE_${pkg.id === "starter_bundle" ? "STARTER" : pkg.id === "growth_pack" ? "GROWTH" : "ELITE"}_PRICE_ID ` +
          `in your .env.local file with a real pri_xxx ID from your Paddle dashboard.`
        );
      }

      console.log(`[Billing] Opening Paddle checkout for "${pkg.name}"...`);
      console.log(`[Billing] Price ID: ${pkg.paddlePriceId}`);
      console.log(`[Billing] User ID for webhook: ${userId}`);

      // ── Open Paddle V2 Checkout Overlay ──
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: pkg.paddlePriceId,
            quantity: 1,
          },
        ],
        customData: {
          userId: userId,
          creditAmount: pkg.credits.toString(),
          planSelected: pkg.id,
        },
      });

    } catch (err: any) {
      console.error("❌ [Billing] Purchase error:", err);
      setPaddleError(err.message);
      setPurchasingId(null);
    }
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
      {/* ── Paddle SDK Injector ── */}
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="afterInteractive"
        onLoad={initializePaddle}
        onError={(e) => {
          console.error("❌ [Paddle] Script failed to load:", e);
          setPaddleError("Paddle.js script failed to load. Check your network/ad-blocker.");
        }}
      />

      {/* ── Page Header ── */}
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Billing & Credits
        </h1>
        <p className="text-neutral-500 mt-2 text-sm">
          Top up your AI execution credits to keep your growth engine running.
        </p>
      </header>

      {/* ── Paddle Debug Banner ── */}
      {paddleError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-950/30 border border-amber-800/40">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-400 mb-1">Paddle Configuration Issue</p>
            <p className="text-xs text-amber-300/70 leading-relaxed">{paddleError}</p>
          </div>
        </div>
      )}

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
            const isProcessing = purchasingId === pkg.id;
            const missingPriceId = !pkg.paddlePriceId;

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
                      <Sparkles
                        className={`w-5 h-5 ${isPopular ? "text-[#c46b6b]" : "text-neutral-500"}`}
                      />
                    )}
                    {pkg.id === "growth_pack" && (
                      <TrendingUp
                        className={`w-5 h-5 ${isPopular ? "text-[#c46b6b]" : "text-neutral-500"}`}
                      />
                    )}
                    {pkg.id === "elite_vault" && (
                      <Shield
                        className={`w-5 h-5 ${isPopular ? "text-[#c46b6b]" : "text-neutral-500"}`}
                      />
                    )}
                  </div>

                  {/* Name & Tagline */}
                  <h3 className="text-base font-bold text-white mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-neutral-600 mb-5">{pkg.tagline}</p>

                  {/* Missing Price ID Warning */}
                  {missingPriceId && (
                    <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-amber-950/20 border border-amber-900/30">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-amber-500/80 leading-relaxed">
                        Missing env var. Set <code className="text-amber-400 font-mono">
                        NEXT_PUBLIC_PADDLE_{pkg.id === "starter_bundle" ? "STARTER" : pkg.id === "growth_pack" ? "GROWTH" : "ELITE"}_PRICE_ID
                        </code> in <code className="text-amber-400 font-mono">.env.local</code>
                      </p>
                    </div>
                  )}

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
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-neutral-400"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isPopular
                              ? "text-[#8b3a3a]"
                              : "text-neutral-700"
                          }`}
                        />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Purchase Button */}
                  <button
                    type="button"
                    onClick={() => handlePurchase(pkg)}
                    disabled={isProcessing || purchasingId !== null}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed ${
                      isPopular
                        ? "bg-[#4a1616] text-[#f0c8c8] hover:bg-[#5c1a1a] border border-[#6b1c1c]/40 shadow-[0_0_20px_rgba(80,20,20,0.2)] disabled:opacity-50"
                        : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800/60 hover:border-neutral-700 disabled:opacity-40"
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Purchase {pkg.credits.toLocaleString()} Credits
                      </>
                    )}
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
                <th className="pb-3 text-[11px] font-bold text-neutral-600 uppercase tracking-widest">
                  Date
                </th>
                <th className="pb-3 text-[11px] font-bold text-neutral-600 uppercase tracking-widest">
                  Description
                </th>
                <th className="pb-3 text-[11px] font-bold text-neutral-600 uppercase tracking-widest">
                  Amount
                </th>
                <th className="pb-3 text-[11px] font-bold text-neutral-600 uppercase tracking-widest text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={4}
                  className="py-14 text-center text-neutral-700 text-sm font-medium"
                >
                  No transactions recorded yet. Your purchase history will
                  appear here.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
