"use client";

import React, { useState } from "react";
import { toggleFeatureFlag } from "./actions";
import { Loader2 } from "lucide-react";

type Flag = {
  id: string;
  name: string;
  isEnabled: boolean;
};

export default function FeatureToggle({ id, name, initialEnabled }: { id: string, name: string, initialEnabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleToggle() {
    setIsUpdating(true);
    const result = await toggleFeatureFlag(id, name, isEnabled);
    if (result.success) {
      setIsEnabled(!isEnabled);
    }
    setIsUpdating(false);
  }

  return (
    <div className="flex items-center justify-between p-4 bg-app-black border border-zinc-800 rounded-xl">
      <div>
        <h3 className="text-white font-bold text-sm mb-1">{name}</h3>
        <p className="text-zinc-500 text-xs">ID: {id}</p>
      </div>
      
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isEnabled ? "bg-emerald-500" : "bg-zinc-700"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isEnabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
        {isUpdating && (
          <span className="absolute -left-6">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          </span>
        )}
      </button>
    </div>
  );
}
