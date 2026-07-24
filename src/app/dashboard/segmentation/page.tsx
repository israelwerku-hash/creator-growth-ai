// app/dashboard/segmentation/page.tsx
import { db as prisma } from "@/lib/db";
import nextDynamic from "next/dynamic";

const SegmentationClient = nextDynamic(() => import("./SegmentationClient"), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-burgundy-primary/30 border-t-burgundy-primary animate-spin" />
      <p className="text-zinc-500 text-sm font-medium">Loading Segmentation Engine...</p>
    </div>
  ),
  ssr: false,
});

import { getSession } from "@/utils/supabase/server";
import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  const userId = session?.user?.id;
  
  if (userId) {
    const creator = await prisma.creator.findUnique({ where: { id: userId }, select: { tier: true } });
    if (creator?.tier === "FREE") {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
          <div className="w-16 h-16 bg-red-950/30 rounded-2xl border border-red-900/30 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Feature Locked</h2>
            <p className="text-zinc-400 max-w-md mx-auto">This feature is part of the Enterprise Engine. Upgrade to Premium to unlock AI Segmentation and other advanced AI features.</p>
          </div>
          <Link href="/pricing" className="px-6 py-3 bg-burgundy-primary text-white font-bold rounded-xl hover:brightness-110 shadow-glow-burgundy flex items-center gap-2 transition-all active:scale-95">
            <ArrowRight className="w-4 h-4" /> Upgrade to Premium
          </Link>
        </div>
      );
    }
  }

  // 1. Fetch real fans from database
  const fans = await prisma.fan.findMany({
    where: { creatorId: userId },
    select: {
      id: true,
      displayName: true,
      username: true,
      segment: true,
      opportunityScore: true,
      confidenceScore: true,
      aiRecommendation: true,
      revenueEvents: { select: { amount: true } },
    },
  });

  // 2. Transform/Map the data to match the format your UI expects
  const formattedFans = fans.map(fan => ({
    id: fan.id,
    name: fan.displayName ?? fan.username ?? "Unknown",
    segment: fan.segment ?? "Ghost Fan",
    totalSpend: fan.revenueEvents.reduce((sum, e) => sum + e.amount, 0) / 100,
    opportunityScore: fan.opportunityScore ?? 0,
    confidenceScore: fan.confidenceScore ?? 0,
    aiRecommendation: fan.aiRecommendation ?? "Not yet analyzed",
  }));

  // 3. Send the real data to the client component
  return <SegmentationClient initialFans={formattedFans} />;
}