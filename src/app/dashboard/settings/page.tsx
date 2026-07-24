import React from "react";
import { Settings } from "lucide-react";

export const metadata = {
  title: "Settings | Creator Growth AI",
};

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 border-b border-burgundy-dark/40 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-burgundy-primary" />
          Settings
        </h1>
        <p className="text-zinc-400 mt-2">
          Manage your account preferences, connected accounts, and system configuration.
        </p>
      </header>

      <section className="bg-surface-dark border border-neutral-800/60 transition-all duration-200 ease-out hover:border-burgundy-primary/50 hover:shadow-glow-subtle rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center py-20">
        <Settings className="w-12 h-12 text-zinc-600 mb-4 animate-[spin_10s_linear_infinite]" />
        <h2 className="text-xl font-bold mb-2">Settings Hub Coming Soon</h2>
        <p className="text-zinc-400 max-w-md">
          We are currently building out the full settings panel. Soon you will be able to manage your API keys, notification preferences, and team members here.
        </p>
      </section>
    </div>
  );
}
