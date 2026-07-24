"use client";

import { motion, useSpring } from "framer-motion";
import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import confetti from "canvas-confetti";
import { Check, Star as LucideStar } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILITY ---
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);
  useEffect(() => {
    function onChange(event: MediaQueryListEvent) { setValue(event.matches); }
    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);
    return () => result.removeEventListener("change", onChange);
  }, [query]);
  return value;
}

// --- COMPONENTS ---
// (Paste the rest of the PricingSection, PricingToggle, PricingCard, etc. from your prompt here)
// ... [Full code of the pricing component logic from your earlier prompt goes here] ...