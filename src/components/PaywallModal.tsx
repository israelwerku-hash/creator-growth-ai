"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Check, Crown, Zap, Shield,
  MessageSquare, Users, Lock
} from "lucide-react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { createClient } from "@/utils/supabase/client";
import { activateFreePlanAction } from "@/app/dashboard/actions";
import { useRouter } from "next/navigation";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro" | "agency">("pro");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Paddle when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token || paddle) return;

    initializePaddle({
      environment: "sandbox",
      token,
    }).then((instance) => {
      if (instance) setPaddle(instance);
    });
  }, [isOpen, paddle]);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      if (selectedPlan === "free") {
        // ─── FREE TIER: server action ───
        const result = await activateFreePlanAction();
        if (result?.success) {
          onClose();
          router.refresh();
        } else {
          alert(result?.error || "Could not activate the free plan.");
        }
      } else {
        // ─── PRO / AGENCY: Paddle checkout ───
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          onClose();
          router.push("/onboarding");
          return;
        }

        if (!paddle) {
          alert("Payment system is still loading. Please wait a moment and try again.");
          return;
        }

        // Pick price ID
        let chosenPriceId = "";
        if (selectedPlan === "pro") {
          chosenPriceId = billingCycle === "monthly"
            ? (process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID || "")
            : (process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_ID || "");
        } else {
          chosenPriceId = billingCycle === "monthly"
            ? (process.env.NEXT_PUBLIC_PADDLE_AGENCY_MONTHLY_ID || "")
            : (process.env.NEXT_PUBLIC_PADDLE_AGENCY_YEARLY_ID || "");
        }

        if (!chosenPriceId) {
          alert("Pricing configuration error. Please contact support.");
          console.error(`Missing env var for ${selectedPlan} ${billingCycle} price ID`);
          return;
        }

        // Open Paddle overlay checkout
        paddle.Checkout.open({
          items: [{ priceId: chosenPriceId, quantity: 1 }],
          customer: {
            email: user.email || "",
          },
          customData: {
            userId: user.id,
            planSelected: selectedPlan.toUpperCase(),
          },
          settings: {
            displayMode: "overlay",
            theme: "dark",
            locale: "en",
          },
        });

        // Close the paywall modal so the Paddle overlay shows
        onClose();
      }
    } catch (error) {
      console.error("Payment action error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 antialiased">

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="absolute inset-0 bg-[#04060A]/80 backdrop-blur-xl"
          />

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
            className="w-full max-w-4xl bg-gradient-to-b from-[#0F1424]/90 to-[#0B0F19]/95 border border-[#232F4E] rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
          >
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#00F5D4]/5 blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#7B2CBF]/10 blur-[60px] pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 text-[#4E6185] hover:text-[#F1F5F9] bg-[#141B2D]/50 hover:bg-[#1E2942] border border-[#232F4E] p-1.5 rounded-xl transition-all z-30 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            {/* LEFT SIDEBAR */}
            <div className="w-full md:w-[35%] bg-[#0B0F19]/50 p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#232F4E] flex flex-col justify-between relative">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-1.5 bg-[#7B2CBF]/10 border border-[#7B2CBF]/30 text-[#C199F9] px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
                  <Crown className="w-3 h-3 text-[#00F5D4]" /> Core Matrix
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-[#F1F5F9] tracking-tight leading-tight">
                    Scale Infrastructure Access
                  </h3>
                  <p className="text-xs text-[#6C7E9C] leading-relaxed">
                    Deploy hyper-targeted automation to manage and convert your audience dynamically.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="text-[10px] font-bold text-[#415375] tracking-widest uppercase">
                    TIER OPERATION PROTOCOLS
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-[#141A29] pb-2">
                    <span className="text-[#E2E8F0] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#00F5D4]" /> DM Generator
                    </span>
                    <span className="text-[#00F5D4] text-[9px] font-bold tracking-wide uppercase bg-[#00F5D4]/10 px-1.5 py-0.5 rounded border border-[#00F5D4]/20">UNLOCKED FOR ALL</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-[#141A29] pb-2">
                    <span className="text-[#6C7E9C] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#7B2CBF]" /> Fan Segmentation
                    </span>
                    <span className="text-amber-400 text-[9px] font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">AGENCY ONLY</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 md:mt-0 pt-4 flex items-center gap-2 border-t border-[#141A29]">
                <Shield className="w-4 h-4 text-[#415375]" />
                <span className="text-[10px] text-[#415375] font-semibold tracking-wide uppercase">
                  Secured Transaction via Paddle
                </span>
              </div>
            </div>

            {/* RIGHT PLAN SELECTION */}
            <div className="w-full md:w-[65%] p-6 md:p-8 flex flex-col justify-between gap-4">

              {/* Billing Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F1F5F9] tracking-tight">Select Billing Protocol</span>
                <div className="bg-[#0A0D14] border border-[#1F2A45] p-1 rounded-xl flex items-center">
                  <button
                    disabled={isLoading}
                    onClick={() => setBillingCycle("monthly")}
                    className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all ${billingCycle === "monthly" ? "bg-[#1E2942] text-[#00F5D4]" : "text-[#6C7E9C] hover:text-[#F1F5F9]"} disabled:opacity-50`}
                  >
                    Monthly
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={() => setBillingCycle("yearly")}
                    className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${billingCycle === "yearly" ? "bg-[#1E2942] text-[#00F5D4]" : "text-[#6C7E9C] hover:text-[#F1F5F9]"} disabled:opacity-50`}
                  >
                    Yearly <span className="text-[9px] bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/20 px-1 rounded">-15%</span>
                  </button>
                </div>
              </div>

              {/* Plan Cards */}
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">

                {/* FREE PLAN */}
                <div
                  onClick={() => !isLoading && setSelectedPlan("free")}
                  className={`cursor-pointer border rounded-2xl p-3.5 transition-all ${
                    selectedPlan === "free"
                      ? "border-zinc-500 bg-[#121624] shadow-md shadow-white/5"
                      : "border-[#1F2A45] bg-[#0A0D14]/40 hover:border-[#2a3a5e]"
                  } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-zinc-300 uppercase tracking-wide">Starter</div>
                      <div className="text-[11px] text-[#6C7E9C] mt-0.5">Explore baseline workspace capabilities.</div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-zinc-100">$0</span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2.5 border-t border-[#1F2A45]/30 flex flex-col gap-1 text-[10px]">
                    <span className="text-[#00bfff] font-semibold flex items-center gap-1.5">
                      <Check className="w-3 h-3" /> AI DM Generation Engine
                    </span>
                    <span className="text-zinc-600 font-medium flex items-center gap-1.5 line-through opacity-50">
                      <Lock className="w-3 h-3" /> All other pro features
                    </span>
                  </div>
                </div>

                {/* PRO PLAN */}
                <div
                  onClick={() => !isLoading && setSelectedPlan("pro")}
                  className={`cursor-pointer border rounded-2xl p-3.5 transition-all ${
                    selectedPlan === "pro"
                      ? "border-[#00ffcc] bg-[#131A2B] shadow-md shadow-[#00ffcc]/5"
                      : "border-[#1F2A45] bg-[#0A0D14]/40 hover:border-[#2a3a5e]"
                  } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wide">Professional</div>
                      <div className="text-[11px] text-[#6C7E9C] mt-0.5">Ideal for scaling creators.</div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-[#F1F5F9]">{billingCycle === "monthly" ? "$25" : "$20"}</span>
                      <span className="text-[9px] text-[#6C7E9C] block">/mo</span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2.5 border-t border-[#1F2A45]/50 flex items-center gap-4 text-[10px]">
                    <span className="text-[#00ffcc] font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current" /> All 5 Features Unlocked
                    </span>
                  </div>
                </div>

                {/* AGENCY */}
                <div
                  onClick={() => !isLoading && setSelectedPlan("agency")}
                  className={`cursor-pointer border rounded-2xl p-3.5 transition-all ${
                    selectedPlan === "agency"
                      ? "border-[#ff007f]/60 bg-[#131A2B] shadow-md shadow-[#ff007f]/5"
                      : "border-[#1F2A45] bg-[#0A0D14]/40 hover:border-[#2a3a5e]"
                  } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-[#ff007f] uppercase tracking-wide">Agency</div>
                      <div className="text-[11px] text-[#6C7E9C] mt-0.5">Custom scale infrastructure.</div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-[#ff007f]">{billingCycle === "monthly" ? "$80" : "$69"}</span>
                      <span className="text-[9px] text-[#6C7E9C] block">/mo</span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2.5 border-t border-[#1F2A45]/50 flex items-center gap-4 text-[10px]">
                    <span className="text-[#ff007f] font-semibold flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-current" /> Deploy Scale Tier
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <button
                onClick={handleAction}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7B2CBF] to-[#00F5D4] hover:brightness-110 text-[#070911] text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading
                  ? "Processing..."
                  : selectedPlan === "free"
                    ? "Activate Free Plan"
                    : selectedPlan === "pro"
                      ? "Upgrade to Pro"
                      : "Upgrade to Agency"
                }
                <Zap className="w-3.5 h-3.5 fill-current" />
              </button>

              {/* Dismiss */}
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-full text-[11px] text-[#6C7E9C] hover:text-[#F1F5F9] transition-colors font-medium hover:underline underline-offset-4 disabled:opacity-50"
              >
                No thanks, I&apos;ll decide later
              </button>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}