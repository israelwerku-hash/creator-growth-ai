"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, RefreshCw, Activity, Tag, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const BADGE_THEMES: Record<string, string> = {
  "Whale": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Loyal Fan": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Potential Whale": "bg-burgundy-primary/10 text-burgundy-primary border-burgundy-primary/20",
  "Ghost Fan": "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  "Churn Risk": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Time Waster": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  // Map our new schema segments dynamically
  "whale": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "active_spender": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "lurker": "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  "churn_risk": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "new_lead": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "highly_engaged": "bg-burgundy-primary/10 text-burgundy-primary border-burgundy-primary/20",
};

function formatSegmentName(seg: string) {
  return seg.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function AISegmentationClient({ initialFans = [] }: { initialFans: any[] }) {
  const router = useRouter();
  const [fans, setFans] = useState(initialFans);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});

  const handleReanalyze = async (fanId: string) => {
    setLoadingId(fanId);
    
    try {
      const fanData = fans.find(f => f.id === fanId);
      
      const response = await fetch("/api/ai-segmentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: "user_123", // Required by backend
          fanId: fanId,
          chatHistory: "Simulated recent chat activity for context.",
          spendingBehavior: `Total spend: $${fanData?.totalSpend || 0}`
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Analysis failed.");
      }

      // Capture Zod structured output
      setAnalysisResults(prev => ({
        ...prev,
        [fanId]: result.data
      }));

      // Update global credits via Layout
      router.refresh();

    } catch (err: any) {
      alert(`AI Engine Error: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const filteredFans = fans.filter(fan => {
    const matchesSearch = fan.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeFilter === "ALL" || fan.segment.toUpperCase() === activeFilter.toUpperCase();
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-[#06030a] text-zinc-100 p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-1/4 w-full max-w-4xl h-[300px] bg-burgundy-primary/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              AI Segmentation Engine
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-xl">
              Identify whales, churn risks, and hidden opportunities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredFans.map((fan) => {
              const result = analysisResults[fan.id];
              const displaySegment = result?.segments?.[0] || fan.segment;
              const displayScore = result?.engagementScore ?? fan.opportunityScore;
              const displayReasoning = result?.segmentationReasoning || fan.aiRecommendation;
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={fan.id}
                  className="bg-[#0e0917]/40 border border-zinc-800/60 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
                      <h3 className="text-lg font-bold text-white font-mono">{fan.name}</h3>
                      <span className={`text-[10px] font-mono px-3 py-1 rounded-full border ${BADGE_THEMES[displaySegment] || BADGE_THEMES["Ghost Fan"]}`}>
                        {formatSegmentName(displaySegment)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-black/40 border border-zinc-800 rounded-xl p-4 flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Total Spend</span>
                        <span className="text-xl font-bold text-emerald-400">${fan.totalSpend}</span>
                      </div>
                      <div className="bg-black/40 border border-zinc-800 rounded-xl p-4 flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1 flex items-center gap-1">
                          <Activity className="w-3 h-3" /> Engagement Score
                        </span>
                        <span className="text-xl font-bold text-white">{displayScore}<span className="text-sm text-zinc-500">/100</span></span>
                      </div>
                    </div>

                    {/* AI Segments Display */}
                    {result?.segments && result.segments.length > 1 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {result.segments.map((seg: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] font-medium text-zinc-300">
                            <Tag className="w-3 h-3 text-zinc-500" />
                            {formatSegmentName(seg)}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 bg-burgundy-primary/10 border border-burgundy-primary/20 p-4 rounded-xl relative">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-burgundy-primary" />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-burgundy-primary">AI Reasoning</span>
                      </div>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">{displayReasoning}</p>
                    </div>

                    <button 
                      onClick={() => handleReanalyze(fan.id)}
                      disabled={loadingId === fan.id}
                      className="mt-6 w-full py-2 bg-zinc-900 hover:bg-burgundy-primary/10 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-burgundy-primary transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingId === fan.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      {loadingId === fan.id ? "Analyzing Behavior..." : "Trigger AI Deep-Dive"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}