"use client";

import React, { useEffect, useState } from "react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { ArrowRight } from "lucide-react";

interface PaddleCheckoutButtonProps {
  priceId: string;
  label: string;
  variant?: "primary" | "secondary";
  userId?: string;
  onTriggerLoading?: (plan?: "PRO" | "AGENCY") => void;
}

export function PaddleCheckoutButton({ priceId, label, variant = "secondary", userId, onTriggerLoading }: PaddleCheckoutButtonProps) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use a ref to ensure the callback has access to the latest closure state
  const onTriggerLoadingRef = React.useRef(onTriggerLoading);
  useEffect(() => {
    onTriggerLoadingRef.current = onTriggerLoading;
  }, [onTriggerLoading]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;

    initializePaddle({
      token,
      environment: "sandbox",
      eventCallback: (data) => {
        if (data.name === 'checkout.completed') {
          if (onTriggerLoadingRef.current) {
            onTriggerLoadingRef.current((window as any).__paddlePlanSelected);
          }
        }
        // Do nothing on 'checkout.closed' so the user is not falsely upgraded
      }
    }).then((instance) => {
      if (instance) setPaddle(instance);
    });
  }, []);

  const handleCheckout = () => {
    if (!paddle) return;
    setIsLoading(true);

    // 🔒 Determine plan by comparing the actual priceId against known Agency Price IDs
    // DO NOT use label text — it's fragile and was the root cause of the Agency→Pro misassignment bug
    const agencyMonthlyId = process.env.NEXT_PUBLIC_PADDLE_AGENCY_MONTHLY_ID || "";
    const agencyYearlyId = process.env.NEXT_PUBLIC_PADDLE_AGENCY_YEARLY_ID || "";
    const isAgency = priceId === agencyMonthlyId || priceId === agencyYearlyId;
    const planSelected = isAgency ? "AGENCY" : "PRO";

    console.log(`[Checkout] priceId=${priceId} | planSelected=${planSelected} | agencyIds=[${agencyMonthlyId}, ${agencyYearlyId}]`);
    (window as any).__paddlePlanSelected = planSelected;

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: userId ? { 
        userId, 
        planSelected
      } : undefined,
    });

    // Reset loading after overlay opens
    setTimeout(() => setIsLoading(false), 1500);
  };

  const isPrimary = variant === "primary";

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading || !paddle}
      className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        isPrimary
          ? "bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          : "border border-zinc-800 hover:bg-zinc-900"
      }`}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Opening Checkout...
        </>
      ) : (
        <>
          {label} <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}
