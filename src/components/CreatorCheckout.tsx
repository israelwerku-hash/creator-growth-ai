"use client";

import React, { useEffect, useState } from "react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { Loader2, Sparkles } from "lucide-react";

interface CreatorCheckoutProps {
  creatorId: string;
  creatorEmail: string;
  priceId: string;
  planName: string;
  buttonLabel?: string;
}

export default function CreatorCheckout({ creatorId, creatorEmail, priceId, planName, buttonLabel = "Upgrade to Pro" }: CreatorCheckoutProps) {
  const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox";
    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

    if (!clientToken) {
      console.error("Paddle Client Token is missing from environment variables.");
      return;
    }

    initializePaddle({
      environment: environment as "sandbox" | "production",
      token: clientToken,
      checkout: {
        settings: {
          displayMode: "overlay",
          theme: "dark", // Enforcing the dark theme for the checkout overlay
        }
      }
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    }).catch((err) => {
      console.error("Failed to initialize Paddle SDK:", err);
    });
  }, []);

  const openCheckout = () => {
    if (!paddle) return;
    setIsLoading(true);

    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: {
          email: creatorEmail,
        },
        customData: {
          // This ensures the webhook handler knows EXACTLY which Prisma Creator to upgrade and log revenue for
          creatorId: creatorId,
        },
      });
    } catch (error) {
      console.error("Paddle Checkout Open Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={openCheckout}
      disabled={!paddle || isLoading}
      className="relative w-full group overflow-hidden rounded-2xl p-[1px] transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Liquid Glass Animated Border */}
      <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity blur-[2px]" />
      
      {/* Button Interior */}
      <div className="relative flex items-center justify-center gap-2 w-full h-full bg-app-black hover:bg-neutral-900 transition-colors rounded-2xl px-6 py-4 font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        ) : (
          <Sparkles className="w-5 h-5 text-indigo-400 group-hover:text-blue-300 transition-colors" />
        )}
        <span>{buttonLabel}</span>
      </div>
    </button>
  );
}
