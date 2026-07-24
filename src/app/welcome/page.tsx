"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { activatePremiumPlanAction, activateAgencyPlanAction } from "@/app/dashboard/actions";
import { useSearchParams } from "next/navigation";

export default function WelcomePage() {
  const [isUpdating, setIsUpdating] = useState(true);
  const searchParams = useSearchParams();
  const tier = searchParams.get("tier");
  
  const isAgency = tier === "agency";
  const dashboardHref = "/dashboard";

  useEffect(() => {
    const updatePremiumStatus = async () => {
      // Because local testing doesn't receive Paddle webhooks, 
      // we manually trigger the DB upgrade via server action here.
      if (isAgency) {
        await activateAgencyPlanAction();
      } else {
        await activatePremiumPlanAction();
      }
      
      // DB write is confirmed. Now show the button after a brief visual delay.
      setTimeout(() => {
        setIsUpdating(false);
      }, 1500);
    };

    updatePremiumStatus();
  }, [isAgency]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 selection:bg-white/20 font-sans relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl text-center flex flex-col items-center">
        
        {/* 3D Animated Core Engine */}
        <div className="relative w-40 h-40 mb-12 flex items-center justify-center perspective-[1000px] mx-auto">
          <div className={`absolute inset-0 rounded-full bg-purple-500/20 blur-2xl transition-opacity duration-1000 ${isUpdating ? 'opacity-100 animate-pulse' : 'opacity-50'}`} />
          
          <div className={`relative w-24 h-24 [transform-style:preserve-3d] transition-all duration-[2000ms] ease-out ${isUpdating ? 'animate-[spin_4s_linear_infinite]' : '[transform:rotateY(180deg)_scale(1.1)]'}`}>
            {/* Core Box Faces */}
            <div className="absolute inset-0 border-2 border-purple-500/50 bg-purple-500/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)]" style={{ transform: 'translateZ(48px)' }}>
              <div className="w-8 h-8 rounded-full bg-purple-400 animate-pulse shadow-[0_0_20px_#c084fc]" />
            </div>
            <div className="absolute inset-0 border-2 border-purple-500/30 bg-purple-500/5 rounded-xl" style={{ transform: 'rotateY(90deg) translateZ(48px)' }} />
            <div className="absolute inset-0 border-2 border-purple-500/30 bg-purple-500/5 rounded-xl" style={{ transform: 'rotateY(180deg) translateZ(48px)' }} />
            <div className="absolute inset-0 border-2 border-purple-500/30 bg-purple-500/5 rounded-xl" style={{ transform: 'rotateY(-90deg) translateZ(48px)' }} />
            <div className="absolute inset-0 border-2 border-purple-500/30 bg-purple-500/5 rounded-xl" style={{ transform: 'rotateX(90deg) translateZ(48px)' }} />
            <div className="absolute inset-0 border-2 border-purple-500/30 bg-purple-500/5 rounded-xl" style={{ transform: 'rotateX(-90deg) translateZ(48px)' }} />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          {isUpdating ? "Initializing Engine..." : (isAgency ? "Welcome to Agency Elite" : "Welcome to Pro Tier")}
        </h1>
        
        <p className={`text-lg md:text-xl text-zinc-400 mb-12 leading-relaxed font-medium max-w-lg transition-opacity duration-700 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
          {isUpdating 
            ? "Securing payment and provisioning your dedicated AI workspace. Please wait." 
            : "Your payment has been secured. You now have the power to scale endlessly."}
        </p>

        <a
          href={isUpdating ? "#" : dashboardHref}
          className={`group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-xl text-lg transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.2)] ${
            isUpdating 
              ? "opacity-0 translate-y-4 pointer-events-none" 
              : "opacity-100 translate-y-0 hover:bg-zinc-200 hover:scale-[1.02] active:scale-95"
          }`}
        >
          Enter Dashboard & Launch DM Gen
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}