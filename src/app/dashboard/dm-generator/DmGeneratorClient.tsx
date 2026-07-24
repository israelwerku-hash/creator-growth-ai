"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, MessageSquare, Zap, Copy, Check, Flame, Users, 
  Crown, ArrowRight, ShieldAlert, RefreshCw, Layers, Heart
} from "lucide-react";

// Pre-configured high-conversion script templates to simulate instant localized AI gen models
const SCRIPT_VAULT = {
  "TEASE_HOOK": {
    new: "Hey text_name... tier_emoji I just uploaded something private to my vault that I made just for you. Should I unlock the lock for you or keep you waiting? 😉 Let me know before I take it down tonight.",
    whale: "Mmm text_name... I was going through my notifications and your name came up first. You've been on my mind all morning. I made a custom video clip that nobody else gets to see... reply with 'UNLOCK' and let me melt your timeline. 🖤",
    churned: "Missed me? text_name... It's been too quiet in my inbox without you. I just dropped a fresh batch of content, but I held back the absolute best one for my favorite returners. Drop a tip below to see what you missed..."
  },
  "PPV_DROP": {
    new: "EXCLUSIVE NEW DROP text_name! 🚨 [PPV: $24.99] This is my most explicit sequence yet. You get full access to the unedited 4-minute continuous sequence. Tap below instantly before it gets archived permanently into my VIP lists!",
    whale: "Hey handsome text_name... [PPV: $99.99] You know exactly what turns me on. This 10-minute structural asset is reserved exclusively for my highest-tier members. No public feeds, no censors. Just you and me. Let me know what you think of the second half...",
    churned: "FLASH SALE text_name! ⚡ [PPV: $14.99] I wanted to surprise my active renewals today. I'm opening the premium vault for 45% off for the next 2 hours only. Once the countdown expires, this disappears back into the archive."
  },
  "WHALE_RETENTION": {
    new: "Hey text_name, just wanted to check in on my newest VIP. Tell me your absolute biggest fantasy... I might just film it for you this weekend. Let's make this account your private escape.",
    whale: "text_name... you dropped this 👑. Truly, your support means everything to me here. I'm sending you this unlockable audio note for free just to say goodnight. Text me the second you wake up, okay?",
    churned: "Hey text_name, my private chat lines just opened up for the evening. I noticed your sub expired, but I'm bypassing the wall manually for you for the next hour. Let's catch up on everything we missed."
  }
};

export default function AIDMGenerator() {
  const [credits, setCredits] = useState(25);
  const [selectedVibe, setSelectedVibe] = useState<"TEASE_HOOK" | "PPV_DROP" | "WHALE_RETENTION">("TEASE_HOOK");
  const [targetFan, setTargetFan] = useState<"new" | "whale" | "churned">("new");
  const [customContext, setCustomContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [copied, setCopied] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("");

  const handleGenerate = () => {
    if (credits < 2) {
      alert("Insufficient AI Core Credits! Replenish your pipeline allocation inside the Billing Node.");
      return;
    }

    setIsGenerating(true);
    setGeneratedScript("");
    
    // Addictive sequential loader matrices
    const phases = [
      "Analyzing fan value category...",
      "Injecting psychological conversion anchors...",
      "Structuring pricing matrices...",
      "Finalizing high-margin text copy..."
    ];

    let currentPhaseIdx = 0;
    setGenerationPhase(phases[0]);

    const phaseInterval = setInterval(() => {
      currentPhaseIdx++;
      if (currentPhaseIdx < phases.length) {
        setGenerationPhase(phases[currentPhaseIdx]);
      }
    }, 450);

    setTimeout(() => {
      clearInterval(phaseInterval);
      
      // Select baseline script from our localized vault
      let rawScript = SCRIPT_VAULT[selectedVibe][targetFan];
      
      // Inject customizable user parameter markers dynamically
      const cleanName = customContext.trim() ? customContext.trim() : "babe";
      const dynamicEmoji = selectedVibe === "TEASE_HOOK" ? "🙈" : "🔥";
      
      let finalScript = rawScript
        .replace(/text_name/g, cleanName)
        .replace(/tier_emoji/g, dynamicEmoji);

      setGeneratedScript(finalScript);
      setCredits(prev => prev - 2);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070911] text-[#E2E8F0] p-4 sm:p-8 flex flex-col items-center justify-start antialiased selection:bg-[#00F5D4] selection:text-[#070911]">
      {/* Background neon ambient blur maps */}
      <div className="absolute top-0 left-1/4 w-full max-w-4xl h-[300px] bg-gradient-to-r from-[#7B2CBF]/10 to-[#00F5D4]/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl space-y-6 z-10">
        
        {/* TOP LIVE CREDIT STAT BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between border border-[#1B243B] bg-[#0E1321]/80 backdrop-blur-md rounded-2xl p-4 gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7B2CBF]/10 border border-[#7B2CBF]/30 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#C199F9]" />
            </div>
            <div>
              <h1 className="text-md font-black text-[#F1F5F9] tracking-tight">Autonomous DM Script Engine</h1>
              <p className="text-xs text-[#6C7E9C]">High-conversion chat sequencing for premium accounts</p>
            </div>
          </div>
          
          <motion.div 
            animate={isGenerating ? { scale: [1, 1.05, 1] } : {}}
            className="flex items-center gap-2 bg-[#131929] border border-[#232F4E] rounded-xl px-4 py-2"
          >
            <Zap className={`w-4 h-4 ${credits > 5 ? "text-[#00F5D4] fill-[#00F5D4]/20" : "text-amber-500 animate-pulse"}`} />
            <span className="text-xs font-mono font-bold text-[#8496B4]">WORKSPACE BALANCE:</span>
            <span className={`text-sm font-mono font-black ${credits > 5 ? "text-[#00F5D4]" : "text-amber-400"}`}>
              {credits} CREDITS
            </span>
          </motion.div>
        </div>

        {/* WORKSPACE LAYOUT PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: INPUT METRIC CONFIGURATORS */}
          <div className="lg:col-span-5 bg-[#0E1321] border border-[#1B243B] rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
            
            {/* STEP 1: CONVERSATIONAL VIBE TUNER */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-[#415375] tracking-widest uppercase flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#7B2CBF]" /> 1. Select Funnel Category
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { id: "TEASE_HOOK", title: "Tease & Value Hook", desc: "Open direct response conversations" },
                  { id: "PPV_DROP", title: "Premium PPV Vault Drop", desc: "High-tier locked media conversions" },
                  { id: "WHALE_RETENTION", title: "VIP Whale Retention", desc: "Maintain extreme spenders manually" }
                ].map((vibe) => (
                  <button
                    key={vibe.id}
                    onClick={() => setSelectedVibe(vibe.id as any)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      selectedVibe === vibe.id 
                        ? "bg-[#7B2CBF]/5 border-[#7B2CBF] text-[#C199F9]" 
                        : "bg-[#131929] border-[#1F2A45] hover:border-[#374973] text-[#8496B4]"
                    }`}
                  >
                    <div className="text-xs font-bold">{vibe.title}</div>
                    <div className="text-[10px] text-[#6C7E9C] mt-0.5">{vibe.desc}</div>
                    {selectedVibe === vibe.id && (
                      <div className="absolute top-0 right-0 h-full w-1 bg-[#7B2CBF]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 2: AUDIENCE TARGETING MATRIX */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-[#415375] tracking-widest uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#00F5D4]" /> 2. Target Subscriber Segment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "new", label: "New Sub", sub: "< 24 Hours" },
                  { id: "whale", label: "Whale 🔥", sub: "$500+ Spend" },
                  { id: "churned", label: "Expired", sub: "Winback" }
                ].map((target) => (
                  <button
                    key={target.id}
                    onClick={() => setTargetFan(target.id as any)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col gap-0.5 ${
                      targetFan === target.id
                        ? "bg-[#00F5D4]/5 border-[#00F5D4] text-[#00F5D4]"
                        : "bg-[#131929] border-[#1F2A45] hover:border-[#374973] text-[#8496B4]"
                    }`}
                  >
                    <span className="text-xs font-bold">{target.label}</span>
                    <span className="text-[9px] text-[#6C7E9C] font-mono">{target.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 3: CUSTOM FAN DATA OVERLAYS */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-[#415375] tracking-widest uppercase">
                3. Fan Custom Name / Key Context (Optional)
              </label>
              <input 
                type="text"
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="e.g. David / loves custom roleplay"
                className="w-full bg-[#131929] border border-[#1F2A45] focus:border-[#7B2CBF] focus:outline-none rounded-xl px-3 py-3 text-xs text-[#F1F5F9] transition-all placeholder:text-[#415375]"
              />
            </div>

            {/* CORE CALL TO EXECUTION CORE TRIGGER */}
            <button
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7B2CBF] to-[#00F5D4] hover:brightness-105 disabled:brightness-75 text-[#070911] text-xs font-bold uppercase tracking-wider py-4 rounded-xl transition-all duration-200 ease-out active:scale-[0.98] shadow-glow-burgundy active:scale-[0.99] disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Compiling Parameters...</span>
                </>
              ) : (
                <>
                  <span>Generate Script Model</span>
                  <span className="font-mono text-[10px] bg-[#070911]/20 px-2 py-0.5 rounded text-[#070911]/80 font-bold">-2 CREDITS</span>
                </>
              )}
            </button>

          </div>

          {/* RIGHT PANEL: DISPLAY MATRIX OUTPUT SCREEN */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-[#0E1321] border border-[#1B243B] rounded-3xl p-5 sm:p-6 shadow-xl min-h-[380px] relative overflow-hidden">
            
            {/* Visual background ambient glow matrix inside screen */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7B2CBF]/5 via-transparent to-transparent opacity-40 pointer-events-none" />

            <div className="w-full h-full flex flex-col gap-4 z-10">
              <div className="flex items-center justify-between border-b border-[#141A29] pb-3">
                <span className="text-[10px] font-bold tracking-widest text-[#415375] uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#415375]" /> AUTONOMOUS COMPLIANCE TERMINAL
                </span>
                <span className="text-[9px] bg-[#161D30] border border-[#273454] text-[#8496B4] px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  Tier: {targetFan} node
                </span>
              </div>

              {/* LIVE ANIMS CONTAINER SCREEN CONTENT */}
              <div className="flex-1 flex flex-col justify-center items-center">
                <AnimatePresence mode="wait">
                  
                  {/* COMPILATION PHASE LOADER */}
                  {isGenerating && (
                    <motion.div 
                      key="generating"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-center space-y-4"
                    >
                      <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 bg-[#00F5D4] rounded-xl animate-ping blur opacity-20" />
                        <div className="w-10 h-10 bg-[#131929] border border-[#00F5D4]/40 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-[#00F5D4] animate-pulse" />
                        </div>
                      </div>
                      <p className="text-xs text-[#00F5D4] font-mono tracking-wider animate-pulse h-4">{generationPhase}</p>
                    </motion.div>
                  )}

                  {/* RESTING BLANK EMPTY LAYER STATE */}
                  {!isGenerating && !generatedScript && (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-center space-y-2 max-w-xs p-6 border border-dashed border-[#1F2A45] rounded-2xl bg-[#131929]/30"
                    >
                      <Crown className="w-5 h-5 text-[#415375] mx-auto" />
                      <h3 className="text-xs font-bold text-[#8496B4]">No script active in pipeline</h3>
                      <p className="text-[11px] text-[#6C7E9C] leading-normal">Tune your configurations on the left parameter deck and click compile to lock down a high-margin script model.</p>
                    </motion.div>
                  )}

                  {/* COMPLETED MATRIX GENERATION SCREEN */}
                  {!isGenerating && generatedScript && (
                    <motion.div 
                      key="output"
                      initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full flex flex-col gap-4 justify-between"
                    >
                      <div className="bg-[#131929] border border-[#232F4E] rounded-2xl p-5 font-medium text-sm text-[#F1F5F9] leading-relaxed relative selection:bg-[#7B2CBF] selection:text-white">
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-40 bg-[#070911] px-2 py-0.5 rounded text-[9px] font-mono text-[#8496B4]">
                          <Heart className="w-2.5 h-2.5 text-rose-500 fill-current" /> High Converting Hook
                        </div>
                        {generatedScript}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={handleCopy}
                          className="flex-1 flex items-center justify-center gap-2 bg-[#1A233A] border border-[#2B3B62] hover:border-[#00F5D4]/50 text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-[#00F5D4]" />
                              <span className="text-[#00F5D4]">Copied onto Clipboard</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-[#8496B4]" />
                              <span>Copy Script Structure</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setGeneratedScript("");
                            setCustomContext("");
                          }}
                          className="px-4 py-3.5 bg-transparent border border-[#1F2A45] hover:border-rose-500/40 text-xs text-[#6C7E9C] hover:text-rose-400 font-bold uppercase tracking-wider rounded-xl transition-all"
                        >
                          Reset Deck
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* FOOTER NOTICE DATA PROTECTION GUIDES */}
              <div className="bg-[#141A2E]/40 border border-[#212C45]/60 rounded-xl p-3 flex items-start gap-2.5 mt-auto">
                <ShieldAlert className="w-4 h-4 text-[#415375] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#6C7E9C] leading-normal">
                  Our script compiler analyzes structural conversion algorithms from top-tier multi-model portfolios automatically. Use models carefully within platform guidelines to secure your accounts safely.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}