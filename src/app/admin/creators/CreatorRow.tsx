"use client";

import React, { useState } from "react";
import { updateCreatorCredits, toggleCreatorStatus } from "./actions";
import { Check, Edit2, Loader2, Ban, ShieldCheck } from "lucide-react";

type Creator = {
  id: string;
  email: string;
  role: string;
  tier: string;
  aiCredits: number;
  status: "ACTIVE" | "SUSPENDED";
};

export default function CreatorRow({ creator }: { creator: Creator }) {
  const [isEditingCredits, setIsEditingCredits] = useState(false);
  const [credits, setCredits] = useState(creator.aiCredits.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleSaveCredits() {
    setIsUpdating(true);
    await updateCreatorCredits(creator.id, parseInt(credits, 10));
    setIsEditingCredits(false);
    setIsUpdating(false);
  }

  async function handleToggleStatus() {
    setIsUpdating(true);
    await toggleCreatorStatus(creator.id, creator.status);
    setIsUpdating(false);
  }

  return (
    <tr className="border-b border-neutral-800/60 hover:bg-white/5 transition-colors">
      <td className="p-4 text-zinc-400 font-mono text-xs">{creator.id.substring(0, 8)}...</td>
      <td className="p-4 text-white text-sm font-medium">{creator.email}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
          creator.role === "ADMIN" ? "bg-burgundy-primary/20 text-burgundy-primary border border-burgundy-primary/30" :
          creator.role === "MANAGER" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
          "bg-zinc-800 text-zinc-400 border border-zinc-700"
        }`}>
          {creator.role}
        </span>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
          creator.tier === "FREE" ? "bg-zinc-800 text-zinc-400 border border-zinc-700" :
          "bg-amber-500/20 text-amber-400 border border-amber-500/30"
        }`}>
          {creator.tier}
        </span>
      </td>
      <td className="p-4">
        {isEditingCredits ? (
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="w-20 bg-app-black border border-zinc-700 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-zinc-500"
            />
            <button 
              onClick={handleSaveCredits}
              disabled={isUpdating}
              className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-white text-sm font-bold">{creator.aiCredits}</span>
            <button 
              onClick={() => setIsEditingCredits(true)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </td>
      <td className="p-4">
        <span className={`flex items-center gap-1.5 text-xs font-bold ${
          creator.status === "ACTIVE" ? "text-emerald-400" : "text-red-500"
        }`}>
          {creator.status === "ACTIVE" ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
          {creator.status}
        </span>
      </td>
      <td className="p-4 text-right">
        <button
          onClick={handleToggleStatus}
          disabled={isUpdating}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            creator.status === "ACTIVE" 
              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20" 
              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
          }`}
        >
          {creator.status === "ACTIVE" ? "Suspend" : "Activate"}
        </button>
      </td>
    </tr>
  );
}
