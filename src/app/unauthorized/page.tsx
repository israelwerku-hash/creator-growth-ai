"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-white/20 font-sans">
      <div className="max-w-md w-full text-center space-y-8">
        
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-900/20 blur-2xl rounded-full" />
            <div className="w-20 h-20 bg-app-black border border-red-900/30 rounded-2xl flex items-center justify-center relative shadow-[0_0_40px_rgba(153,27,27,0.15)]">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
            Access Denied
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            You do not have the required permissions to access this area. If you believe this is a mistake, please contact your workspace administrator.
          </p>
        </div>

        <div className="pt-4 border-t border-neutral-800/60 flex flex-col gap-3">
          <Link 
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-burgundy-primary text-white rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-[0.98] shadow-glow-burgundy"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-full py-3.5 bg-transparent border border-zinc-800 text-zinc-400 rounded-xl text-sm font-bold transition-all hover:bg-zinc-900 hover:text-zinc-300"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
}
