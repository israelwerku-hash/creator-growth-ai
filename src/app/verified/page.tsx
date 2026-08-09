"use client";

import Link from "next/link";
import { CheckCircle2, Monitor, ArrowRight } from "lucide-react";

export default function VerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505] text-white font-sans selection:bg-white/20 px-4 py-12">
      {/* Ambient glow */}
      <div className="absolute top-1/3 -left-1/4 w-[700px] h-[700px] bg-amber-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-yellow-900/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-[2.5rem] bg-black/40 backdrop-blur-xl border border-amber-900/30 p-10 shadow-[0_0_60px_rgba(0,0,0,0.6)] text-center">
        {/* Success icon */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.15)]">
          <CheckCircle2 className="w-10 h-10 text-amber-400" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">
          Email Confirmed! <span className="inline-block animate-bounce">🎉</span>
        </h1>

        {/* Cross-device message */}
        <div className="mt-4 mb-8 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Monitor className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Cross-Device Sync</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            If you started setup on your computer, you can <strong className="text-white">close this tab</strong> and return to your PC to continue seamlessly.
          </p>
          <p className="text-xs text-zinc-500 mt-3">
            Your original browser tab will detect the verification automatically.
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-zinc-800" />
          <span className="shrink-0 px-3 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
            or
          </span>
          <div className="flex-grow border-t border-zinc-800" />
        </div>

        {/* Continue on this device */}
        <Link
          href="/onboarding"
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
        >
          Continue on this device
          <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="text-xs text-zinc-600 mt-4">
          Choose this if you opened the verification email on the same device.
        </p>
      </div>
    </div>
  );
}
