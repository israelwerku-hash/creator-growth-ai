import React from "react";
import { Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import FeatureToggle from "./FeatureToggle";

// Define the core flags the system expects
const CORE_FLAGS = [
  { id: "maintenance_mode", name: "Global Maintenance Mode" },
  { id: "beta_dm_engine", name: "Llama 3.1 70B Generation Engine (Beta)" },
  { id: "stripe_test_mode", name: "Payment Sandbox Testing" },
  { id: "registration_open", name: "Allow New Creator Signups" },
];

export default async function AdminSettingsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const creator = await db.creator.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (creator?.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  // Fetch all existing flags from DB
  const dbFlags = await db.featureFlag.findMany();
  const flagMap = new Map(dbFlags.map(f => [f.id, f.isEnabled]));

  return (
    <div className="min-h-screen bg-app-black text-white font-sans selection:bg-white/20 p-8">
      
      {/* Header */}
      <header className="mb-8 border-b border-neutral-800/60 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="w-10 h-10 rounded-xl bg-white/5 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Settings className="w-5 h-5 text-zinc-400" />
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Feature Flags & Routing</h1>
            </div>
            <p className="text-zinc-500 text-sm font-medium">Control global experimental features and maintenance modes.</p>
          </div>
        </div>
      </header>

      {/* Settings Grid */}
      <div className="bg-surface-dark border border-neutral-800/60 rounded-3xl p-8 max-w-3xl shadow-2xl shadow-black/50">
        <h2 className="text-lg font-bold text-white mb-6">Core System Flags</h2>
        
        <div className="flex flex-col gap-4">
          {CORE_FLAGS.map((flag) => (
            <FeatureToggle 
              key={flag.id} 
              id={flag.id} 
              name={flag.name} 
              initialEnabled={flagMap.get(flag.id) ?? (flag.id === "registration_open")} // default open for registration
            />
          ))}
        </div>
      </div>

    </div>
  );
}
