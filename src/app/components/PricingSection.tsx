"use client";

import React, { useState, useEffect } from "react";
import { Check, Lock } from "lucide-react";
import { getUserAction } from "@/app/actions/getUser";
import { activateFreePlanAction } from "@/app/dashboard/actions";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { useRouter } from "next/navigation";

export default function PricingSection({
  setAuthMode,
  setCurrentView,
}: {
  setAuthMode: (mode: "login" | "signup") => void;
  setCurrentView: (view: "landing" | "auth" | "dashboard") => void;
}) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const router = useRouter();

  useEffect(() => {
    getUserAction().then((u) => setUser(u));
    
    // Initialize Paddle
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (token) {
      initializePaddle({
        environment: "sandbox",
        token,
        eventCallback: function(data) {
          if (data.name === "checkout.completed") {
            setIsRedirecting(true);
            setTimeout(() => {
              window.location.href = "/welcome";
            }, 2000);
          }
        }
      }).then((instance) => {
        if (instance) setPaddle(instance);
      });
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────────

  const handleStarterClick = async () => {
    if (!user) {
      setAuthMode("signup");
      setCurrentView("auth");
      return;
    }

    setIsActivating(true);
    try {
      const result = await activateFreePlanAction();
      if (result.success) {
        setCurrentView("dashboard");
      }
    } catch (err) {
      console.error("Free plan activation failed:", err);
    } finally {
      setIsActivating(false);
    }
  };

  const handlePaidCheckout = (tier: "pro" | "agency") => {
    if (!user) {
      setAuthMode("signup");
      setCurrentView("auth");
      return;
    }

    if (!paddle) {
      alert("Payment system is still loading. Please wait a moment and try again.");
      return;
    }

    // Resolve env-based Paddle price IDs
    const priceIdMap: Record<string, string | undefined> = {
      pro_monthly: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID,
      pro_annual: process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_ID,
      agency_monthly: process.env.NEXT_PUBLIC_PADDLE_AGENCY_MONTHLY_ID,
      agency_annual: process.env.NEXT_PUBLIC_PADDLE_AGENCY_YEARLY_ID,
    };

    const key = `${tier}_${isAnnual ? "annual" : "monthly"}`;
    const priceId = priceIdMap[key];

    if (!priceId) {
      console.error(`Missing env var for Paddle price ID: NEXT_PUBLIC_PADDLE_${tier.toUpperCase()}_${isAnnual ? "YEARLY" : "MONTHLY"}_ID`);
      return;
    }

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email: user.email },
      customData: { userId: user.id },
    });
  };

  // ── Data ──────────────────────────────────────────────────

  const features = [
    { id: "dm", name: "AI DM Generation Engine" },
    { id: "segmentation", name: "AI Segmentation" },
    { id: "logger", name: "Data Metric Logger" },
    { id: "memory", name: "Memory Vault" },
    { id: "translator", name: "Language Translator Hub" },
  ];

  const tiers = [
    {
      id: "starter" as const,
      name: "Starter",
      desc: "Perfect for individuals exploring their first growth funnels.",
      monthlyPrice: 0,
      annualPrice: 0,
      featuresUnlocked: ["dm"],
      extraTopFeature: null,
      extraBottomFeature: null,
      buttonText: "ACTIVATE FREE PLAN",
      popular: false,
      accent: "#00bfff",
    },
    {
      id: "pro" as const,
      name: "Professional",
      desc: "Ideal for scaling creators and serious growth optimization.",
      monthlyPrice: 59,
      annualPrice: 49,
      featuresUnlocked: ["dm", "segmentation", "logger", "memory", "translator"],
      extraTopFeature: "100 AI Execution Credits / month",
      extraBottomFeature: null,
      buttonText: "UPGRADE TO PRO ⚡",
      popular: true,
      accent: "#00ffcc",
    },
    {
      id: "agency" as const,
      name: "Agency",
      desc: "Full-scale infrastructure for agencies managing multiple creators.",
      monthlyPrice: 199,
      annualPrice: 149,
      featuresUnlocked: ["dm", "segmentation", "logger", "memory", "translator"],
      extraTopFeature: "500 AI Execution Credits / month",
      extraBottomFeature: "Dedicated Priority Support",
      buttonText: "DEPLOY AGENCY TIER",
      popular: false,
      accent: "#ff007f",
    },
  ];

  // ── Render ────────────────────────────────────────────────

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04060A]/90 backdrop-blur-xl transition-all duration-700 animate-in fade-in">
        <div className="text-center flex flex-col items-center">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 rounded-full border-t-2 border-[#00ffcc] animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-[#ff007f] animate-[spin_1.5s_linear_reverse_infinite]"></div>
            <div className="absolute inset-4 rounded-full border-b-2 border-[#00bfff] animate-spin"></div>
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2 shadow-[#00ffcc]/50 drop-shadow-glow-burgundy">
            Activating your premium workspace...
          </h3>
          <p className="text-zinc-400 text-sm font-mono tracking-wide animate-pulse">
            Setting up your AI growth engine...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-900 relative z-10 w-full">
      {/* Heading */}
      <div className="text-center max-w-xl mx-auto mb-16">
        <h3 className="text-3xl font-black text-white uppercase tracking-tight">
          Predictable Operational Pricing
        </h3>
        <p className="text-zinc-500 text-xs font-mono mt-2">
          Scale fluidly based on your agency requirements.
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center p-1 bg-white/5 border border-burgundy-dark/40 rounded-full backdrop-blur-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-xs font-mono font-bold transition-all duration-300 border-0 cursor-pointer ${
                !isAnnual
                  ? "bg-white text-black shadow-glow-burgundy"
                  : "bg-transparent text-zinc-400 hover:text-white"
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-xs font-mono font-bold transition-all duration-300 border-0 cursor-pointer flex items-center gap-2 ${
                isAnnual
                  ? "bg-white text-black shadow-glow-burgundy"
                  : "bg-transparent text-zinc-400 hover:text-white"
              }`}
            >
              ANNUALLY{" "}
              <span className="text-[#00ffcc] text-[10px] font-bold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
        {tiers.map((tier) => {
          const displayPrice = isAnnual ? tier.annualPrice : tier.monthlyPrice;

          return (
            <div
              key={tier.id}
              className={`bg-[#09090b] border p-8 rounded-2xl flex flex-col justify-between relative transition-all duration-300 group ${
                tier.popular
                  ? "border-zinc-600 shadow-[0_0_40px_rgba(0,255,204,0.06)] hover:shadow-[0_0_50px_rgba(0,255,204,0.12)] hover:border-zinc-500"
                  : "border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-zinc-800 to-zinc-700 text-white font-mono font-bold text-[10px] uppercase px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border border-zinc-600">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: tier.accent }}
                  />
                  MOST POPULAR
                </div>
              )}

              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-60"
                style={{
                  background: `linear-gradient(90deg, transparent, ${tier.accent}, transparent)`,
                }}
              />

              {/* Price Block */}
              <div className="text-center mb-8 pt-2">
                <h4 className="text-xl font-bold text-zinc-300 mb-1">
                  {tier.name}
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed mb-6 h-10 px-4">
                  {tier.desc}
                </p>

                <div className="flex flex-col items-center">
                  <p className="text-5xl font-black text-white font-mono">
                    <span className="text-2xl align-top text-zinc-400">$</span>
                    {displayPrice}
                  </p>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-2 block">
                    / month
                  </span>
                  <span className="text-[9px] text-zinc-600 mt-1 block h-3">
                    {tier.annualPrice === 0
                      ? "Free forever"
                      : isAnnual
                      ? `Billed $${tier.annualPrice * 12} annually`
                      : "Billed monthly"}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="flex-1 space-y-4 mb-8 border-t border-zinc-800/50 pt-8">
                {tier.extraTopFeature && (
                  <div className="flex items-center gap-3 opacity-100">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `${tier.accent}15`,
                        border: `1px solid ${tier.accent}30`,
                      }}
                    >
                      <Check size={11} strokeWidth={3} style={{ color: tier.accent }} />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-300 font-bold">
                      {tier.extraTopFeature}
                    </span>
                  </div>
                )}

                {features.map((feature) => {
                  const unlocked = tier.featuresUnlocked.includes(feature.id);
                  return (
                    <div
                      key={feature.id}
                      className={`flex items-center gap-3 transition-opacity duration-300 ${
                        unlocked ? "opacity-100" : "opacity-40"
                      }`}
                    >
                      {unlocked ? (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `${tier.accent}15`,
                            border: `1px solid ${tier.accent}30`,
                          }}
                        >
                          <Check
                            size={11}
                            strokeWidth={3}
                            style={{ color: tier.accent }}
                          />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800">
                          <Lock size={9} className="text-zinc-600" />
                        </div>
                      )}
                      <span
                        className={`text-[11px] font-mono ${
                          unlocked
                            ? "text-zinc-300"
                            : "text-zinc-600 line-through"
                        }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  );
                })}

                {tier.extraBottomFeature && (
                  <div className="flex items-center gap-3 opacity-100">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `${tier.accent}15`,
                        border: `1px solid ${tier.accent}30`,
                      }}
                    >
                      <Check size={11} strokeWidth={3} style={{ color: tier.accent }} />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-300 font-bold">
                      {tier.extraBottomFeature}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => {
                  if (tier.id === "starter") {
                    handleStarterClick();
                  } else {
                    handlePaidCheckout(tier.id);
                  }
                }}
                disabled={tier.id === "starter" && isActivating}
                className={`w-full text-[11px] font-mono font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 cursor-pointer ${
                  tier.popular
                    ? "bg-gradient-to-r from-zinc-200 to-white text-black border-0 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98]"
                    : "bg-transparent text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-500 active:scale-[0.98]"
                }`}
              >
                {tier.id === "starter" && isActivating
                  ? "ACTIVATING..."
                  : tier.buttonText}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
