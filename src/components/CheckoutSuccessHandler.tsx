"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Detects `?success=true` in the URL after a Whop checkout redirect.
 * Triggers a Next.js router.refresh() to pull the latest server data
 * (tier, credits, etc.) updated by the webhook, then cleans the URL.
 */
export function CheckoutSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      // Force Next.js to refetch all server components with fresh DB data
      router.refresh();

      // Clean the ?success=true from the address bar without a navigation
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, router]);

  return null;
}
