import { redirect } from "next/navigation";
import { getSession } from "@/utils/supabase/server";
import { db } from "@/lib/db";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.user) {
    return <>{children}</>;
  }

  try {
    let creator = await db.creator.findUnique({
      where: { id: session.user.id },
      select: { has_completed_onboarding: true, has_completed_pricing: true, tier: true },
    });

    // Fallback: try email if ID doesn't match
    if (!creator && session.user.email) {
      creator = await db.creator.findUnique({
        where: { email: session.user.email.toLowerCase().trim() },
        select: { has_completed_onboarding: true, has_completed_pricing: true, tier: true },
      });
    }

    // If user has already completed onboarding, skip straight to dashboard
    if (creator?.has_completed_onboarding) {
      // If they also completed pricing (or are on a paid tier), go to dashboard
      if (creator.has_completed_pricing || creator.tier !== "FREE") {
        redirect("/dashboard");
      }
      // If onboarding done but no plan chosen yet, send to paywall
      redirect("/paywall");
    }
  } catch (error) {
    console.warn("DB error in onboarding layout, allowing onboarding to proceed:", error);
  }

  return <>{children}</>;
}
