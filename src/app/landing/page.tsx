"use client";

import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div 
      className="min-h-screen text-[#e4e4e7] relative overflow-hidden tracking-tight selection:bg-[#f43f5e]/30 selection:text-white" 
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro", "SF Pro Text", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
        background: "radial-gradient(circle at 10% 20%, rgba(30, 9, 52, 0.95), transparent 45%), radial-gradient(circle at 90% 10%, rgba(93, 16, 73, 0.9), transparent 50%), radial-gradient(circle at 50% 90%, rgba(244, 63, 94, 0.4), transparent 60%), #0d0616",
      }}
    >
      {/* Drifting ambient glowing circles */}
      <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full filter blur-[120px] pointer-events-none z-0 ambient-orb-1" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[700px] h-[700px] rounded-full filter blur-[130px] pointer-events-none z-0 ambient-orb-2" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_0.5px,transparent_0.5px),linear-gradient(to_bottom,#1f1f2e_0.5px,transparent_0.5px)] bg-[size:5rem_5rem] opacity-[0.05] pointer-events-none z-0" />

      <nav className="w-full border-b border-white/5 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-3 group text-left bg-transparent border-0 cursor-pointer no-underline">
            <div className="relative h-10 w-10 bg-black border border-pink-500/20 rounded-lg flex items-center justify-center overflow-hidden transition duration-300 group-hover:border-pink-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-indigo-500/15 group-hover:opacity-40 transition-opacity duration-500" />
              <span className="text-white font-black text-lg font-mono relative z-10">Ω</span>
            </div>
            <div>
              <span className="font-mono text-[9px] tracking-widest text-pink-400 uppercase block font-bold leading-none mb-0.5">PLATFORM TRACK</span>
              <span className="text-sm font-black text-white tracking-tight block leading-none">DNA GROWTH</span>
            </div>
          </Link>

          <div className="flex items-center gap-8 font-mono text-xs tracking-wider">
            <Link href="#pricing" className="text-zinc-400 hover:text-white transition duration-150 no-underline">PRICING</Link>
            <div className="h-4 w-[1px] bg-zinc-800" />
            <Link href="/login" className="text-zinc-400 hover:text-white transition duration-150 no-underline">LOG IN</Link>
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-bold px-5 py-2.5 rounded-lg hover:brightness-110 active:scale-[0.98] transition shadow-[0_2px_15px_rgba(244,63,94,0.25)] cursor-pointer border-0 text-xs uppercase tracking-wider no-underline"
            >
              SIGN UP
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          <div className="lg:col-span-7 space-y-8">
            <h2 
              className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.95]"
              style={{ textShadow: "0 4px 15px rgba(0,0,0,0.5), 0 0 60px rgba(244,63,94,0.08)" }}
            >
              We build <br />
              <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">Whale Pipelines</span> <br />
              For Creators.
            </h2>
            <p className="text-zinc-300 text-base md:text-lg max-w-xl font-normal leading-relaxed">
              Stop treating your profile like a casual feed. Turn your traffic into automated retention funnels with predictive churn modeling, deep creator CRM logs, and smart real-time translation tools.
            </p>
            <div className="flex pt-4">
              <Link
                href="/login"
                className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white text-xs font-mono font-bold uppercase tracking-widest px-8 py-4.5 rounded-xl text-center shadow-[0_4px_25px_rgba(244,63,94,0.35)] hover:-translate-y-0.5 hover:scale-[1.02] hover:brightness-110 active:scale-[0.985] transition-all duration-300 ease-out border-0 cursor-pointer no-underline"
              >
                Launch Operational Engine
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-12 border-t border-zinc-800/60 max-w-lg font-mono">
              <div>
                <span className="block text-2xl font-bold text-white tracking-tight">66.4%</span>
                <span className="block text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Avg Vol Spike</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-white tracking-tight">AI-Driven</span>
                <span className="block text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Chat Closers</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-white tracking-tight">24/7</span>
                <span className="block text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Stream Sync</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-indigo-500/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-700 pointer-events-none" />
            
            {/* Overhauled Tactile Glassmorphism Card Mockup */}
            <div 
              className="relative border rounded-3xl p-6 shadow-2xl backdrop-blur-3xl transform lg:rotate-2 hover:rotate-0 transition-all duration-500 ease-out overflow-hidden"
              style={{
                background: "rgba(22, 11, 38, 0.45)",
                borderColor: "rgba(244, 63, 94, 0.3)",
                backdropFilter: "blur(40px) saturate(2)",
                WebkitBackdropFilter: "blur(40px) saturate(2)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500 to-indigo-500" />
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4 mb-6 font-mono text-[10px] text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500/30" />
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500/30" />
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/30" />
                </div>
                <span>PRED_MODULE_NODE.SH</span>
              </div>
              <div className="space-y-4">
                <div className="bg-black/40 border border-pink-500/20 rounded-xl p-4">
                  <span className="text-pink-400 block font-mono text-[10px] mb-1 font-semibold tracking-wider">AT-RISK SUBS DETECTED</span>
                  <p className="text-sm font-bold text-white font-mono">User: @fan_matrix_92</p>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">High probability of cancellation. Active retention coupon sequence recommended.</p>
                </div>
                <div className="bg-black/40 border border-purple-500/20 rounded-xl p-4">
                  <span className="text-purple-400 block font-mono text-[10px] mb-1 font-semibold tracking-wider">AI DM CLOSER SUGGESTION</span>
                  <p className="text-xs text-zinc-300 italic leading-relaxed">"What else you got for me tonight?"</p>
                  <div className="mt-2.5 p-2 bg-purple-950/30 border border-purple-500/20 rounded text-[11px] font-mono text-pink-400 font-medium">
                    👉 "Got a VIP bundle for $40 that's way better than this 😏"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-900 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h3 className="text-3xl font-black text-white uppercase tracking-tight">Predictable Operational Pricing</h3>
          <p className="text-zinc-500 text-xs font-mono mt-2">Scale fluidly based on your agency requirements.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-[#09090b] border border-zinc-800 p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="font-mono text-xs text-[#00bfff] uppercase font-bold tracking-widest mb-2">Creator Mode</h4>
              <p className="text-4xl font-black text-white font-mono">$49<span className="text-xs text-zinc-500 font-normal">/mo</span></p>
              <ul className="mt-6 space-y-3 text-xs text-zinc-400 font-mono list-none p-0">
                <li>• Unified Analytics Tracking</li>
                <li>• Core CRM & Churn Predictor</li>
              </ul>
            </div>
            <Link href="/login" className="mt-8 block w-full bg-zinc-900 text-white hover:bg-zinc-800 font-mono text-center text-xs py-3 rounded-xl transition cursor-pointer border-0 no-underline">
              Deploy Instance
            </Link>
          </div>
          <div className="bg-[#09090b] border border-zinc-700 p-8 rounded-2xl flex flex-col justify-between relative shadow-xl">
            <div className="absolute top-0 right-0 bg-[#00ffcc] text-black font-mono font-bold text-[9px] uppercase px-3 py-1 rounded-bl-xl">POPULAR</div>
            <div>
              <h4 className="font-mono text-xs text-[#00ffcc] uppercase font-bold tracking-widest mb-2">Agency Engine</h4>
              <p className="text-4xl font-black text-white font-mono">$199<span className="text-xs text-zinc-500 font-normal">/mo</span></p>
              <ul className="mt-6 space-y-3 text-xs text-zinc-400 font-mono list-none p-0">
                <li>• Unlimited Creator Profiles</li>
                <li>• Real-Time Translator Subsystem</li>
              </ul>
            </div>
            <Link href="/login" className="mt-8 block w-full bg-white text-black font-mono font-bold text-center text-xs py-3 rounded-xl transition hover:bg-zinc-200 cursor-pointer border-0 no-underline">
              Deploy Scale Tier
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Keyframe Animations */}
      <style>{`
        @keyframes driftOrb1 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, -50px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes driftOrb2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-40px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .ambient-orb-1 {
          animation: driftOrb1 18s ease-in-out infinite;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 100%);
        }
        .ambient-orb-2 {
          animation: driftOrb2 22s ease-in-out infinite;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(244, 63, 94, 0.1) 50%, transparent 100%);
        }
      `}</style>
    </div>
  );
}