import { getSession } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function RevenueForecastPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard/revenue");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Revenue Forecast</h1>
      <div className="glass-card-soft border border-slate-800/80 px-6 py-8">
        <div className="empty-state">
          <div className="empty-state-icon mb-2" />
          <p className="text-slate-300">Revenue simulator and forecasts will appear here.</p>
          <p className="text-xs text-slate-500">Add revenue events to see best / worst case projections.</p>
        </div>
      </div>
    </div>
  );
}
