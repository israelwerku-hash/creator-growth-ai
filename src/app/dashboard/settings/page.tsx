import React from "react";
import { Settings } from "lucide-react";
import ApiKeyManager from "./ApiKeyManager";

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

      <ApiKeyManager />
    </div>
  );
}
