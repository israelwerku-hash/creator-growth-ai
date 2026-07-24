import React from 'react';
import { Shield, Zap, TrendingUp, MessageSquare, Calendar, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-purple-500/30 overflow-hidden font-sans relative">
      {/* Background Psychological Depth (The "Glows") */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-20 px-6">
        
        {/* Irresistible Hero Glass Card */}
        <div className="max-w-4xl w-full bg-white/[0.03] backdrop-blur-3xl border border-burgundy-dark/40 rounded-[40px] p-12 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
            CREATOR <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-magenta-500 to-cyan-400 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">
              GROWTH AI
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
            The elite intelligence layer for creators who demand exponential scale. 
            Command the algorithm, dominate the psychology of engagement.
          </p>

          <button className="relative group overflow-hidden bg-white text-black px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            <span className="relative z-10">GET STARTED →</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* The 5 Premium Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-6xl w-full pb-20">
          {[
            { title: "Revenue Predictor", icon: <TrendingUp />, locked: false },
            { title: "Smart DM Generator", icon: <MessageSquare />, locked: true },
            { title: "Fan AI Segmentation", icon: <Shield />, locked: true },
            { title: "Content Calendar", icon: <Calendar />, locked: true },
            { title: "Upsell Scripts", icon: <Zap />, locked: true },
          ].map((feature, i) => (
            <div key={i} className="group relative bg-white/[0.02] border border-white/5 backdrop-blur-xl p-8 rounded-3xl hover:bg-white/[0.05] hover:border-purple-500/30 transition-all cursor-pointer">
              {feature.locked && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/40 text-[10px] font-bold text-purple-300">
                  <Lock size={10} /> PRO
                </div>
              )}
              <div className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                {React.cloneElement(feature.icon as React.ReactElement, { size: 32 } as any)}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">Tap into neural-network powered growth tools designed for the top 1%.</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}