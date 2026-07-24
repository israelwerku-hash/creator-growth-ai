import React from "react";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import CreatorRow from "./CreatorRow";

export default async function AdminCreatorsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const activeAdmin = await db.creator.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (activeAdmin?.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const creators = await db.creator.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      tier: true,
      aiCredits: true,
      status: true,
    }
  });

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
              <Users className="w-5 h-5 text-blue-400" />
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Creator Management</h1>
            </div>
            <p className="text-zinc-500 text-sm font-medium">Moderate accounts, manage tiers, and allocate AI credits globally.</p>
          </div>
        </div>
      </header>

      {/* Data Table */}
      <div className="bg-surface-dark border border-neutral-800/60 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 border-b border-neutral-800/60">
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">ID</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Tier</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Credits</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {creators.map((c) => (
                <CreatorRow key={c.id} creator={c} />
              ))}
              {creators.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500 text-sm">
                    No creators found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
