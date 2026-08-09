"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Send,
  ChevronDown,
  Tag,
  Activity
} from "lucide-react";

import { getCreatorFansAction, getUserTierAction } from "@/app/dashboard/actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function DmGenerationPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 text-burgundy-primary animate-spin" /></div>}>
      <DmGenerationPage />
    </Suspense>
  );
}

function DmGenerationPage() {
  const router = useRouter();
  const [userTier, setUserTier] = useState<string>("FREE");
  const [isChecking, setIsChecking] = useState(true);

  // Hierarchical Logic Check
  const featureRequiresPro = false; // DM Gen is unlocked for FREE tier per requirements
  const isLocked = featureRequiresPro && userTier === "FREE";

  // Form state
  const searchParams = useSearchParams();
  const urlFanId = searchParams.get("fanId") || "";
  const [targetFanId, setTargetFanId] = useState<string>(urlFanId);
  const [fans, setFans] = useState<any[]>([]);
  
  const [targetAccount, setTargetAccount] = useState("OnlyFans");
  const [campaignGoal, setCampaignGoal] = useState("Fan Welcome / New Subscriber Greeting");
  const [tone, setTone] = useState("Flirty & Playful");
  const [context, setContext] = useState("");

  // Sync URL fanId to state if it changes
  useEffect(() => {
    if (urlFanId && urlFanId !== targetFanId) {
      setTargetFanId(urlFanId);
    }
  }, [urlFanId, targetFanId]);

  // Output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [toneDetected, setToneDetected] = useState("");
  const [campaignTags, setCampaignTags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTier = async () => {
      const res = await getUserTierAction();
      if (res.success && res.tier) {
        setUserTier(res.tier);
      }
      setIsChecking(false);
    };
    const fetchFans = async () => {
      const res = await getCreatorFansAction();
      if (res.success && res.fans) {
        setFans(res.fans);
        // If the URL has a fanId that doesn't exist in the fetched fans, 
        // we should either clear it or keep it (it will fallback to General Broadcast visually).
        // Since we want it to match, let's reset it to "" if it's not found in real fans to be safe.
        if (urlFanId && !res.fans.some((f: any) => f.id === urlFanId)) {
          setTargetFanId("");
        }
      }
    };
    fetchTier();
    fetchFans();
  }, [urlFanId]);

  const handleGenerate = async () => {
    if (isLocked) return;
    setIsGenerating(true);
    setGeneratedMessage("");
    setToneDetected("");
    setCampaignTags([]);
    setCopied(false);

    try {
      const response = await fetch("/api/generate-dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetAccount,
          campaignGoal,
          tone,
          context,
          fanId: targetFanId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate outreach.");
      }

      setGeneratedMessage(data.generatedText || data.messageBody);
      if (data.toneDetected) setToneDetected(data.toneDetected);
      if (data.campaignTags) setCampaignTags(data.campaignTags);
      
      // Refresh the route to update the server-rendered global navbar credit balance
      router.refresh();

    } catch (err: any) {
      console.error(err);
      setGeneratedMessage(`Error: ${err.message}`);
      alert(`Error generating DM: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedMessage) return;
    await navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-burgundy-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          DM Generation
        </h1>
        <p className="text-zinc-400 mt-2">
          Craft hyper-targeted outreach messages powered by AI.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INPUT FORM CARD */}
        <div className="relative bg-black/40 backdrop-blur-xl border border-burgundy-dark/40 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-burgundy-primary rounded-t-3xl" />

          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-burgundy-primary" /> Campaign Brief
          </h2>

          <div className="space-y-5">
            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 ml-1">
                Target Audience
              </label>
              <div className="relative">
                <select
                  value={targetFanId}
                  onChange={(e) => setTargetFanId(e.target.value)}
                  disabled={isLocked || fans.length === 0}
                  className="w-full bg-white/5 border border-burgundy-dark/40 rounded-xl py-3 px-4 pr-10 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-burgundy-primary/50 focus:border-burgundy-primary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option className="bg-[#0A0A0A] text-zinc-500" value="">General Broadcast (No Specific Fan)</option>
                  {fans.map(f => (
                    <option key={f.id} className="bg-[#0A0A0A] text-white" value={f.id}>{f.name || f.username || 'Anonymous Fan'}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
              {targetFanId && fans.some(f => f.id === targetFanId) && (
                <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-burgundy-primary/10 border border-burgundy-primary/30 rounded-lg w-fit">
                  <Activity className="w-3.5 h-3.5 text-burgundy-primary" />
                  <span className="text-[10px] font-bold text-burgundy-primary uppercase tracking-wider">Active Memory Vectors Linked</span>
                </div>
              )}
            </div>
            {/* Target Account / Industry */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 ml-1">
                Target Account / Industry
              </label>
              <input
                type="text"
                value={targetAccount}
                onChange={(e) => setTargetAccount(e.target.value)}
                placeholder="Fashion Creators, Tech Founders..."
                disabled={isLocked}
                className="w-full bg-white/5 border border-burgundy-dark/40 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-burgundy-primary/50 focus:border-burgundy-primary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Campaign Goal */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 ml-1">
                Campaign Goal
              </label>
              <div className="relative">
                <select
                  value={campaignGoal}
                  onChange={(e) => setCampaignGoal(e.target.value)}
                  disabled={isLocked}
                  className="w-full bg-white/5 border border-burgundy-dark/40 rounded-xl py-3 px-4 pr-10 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-burgundy-primary/50 focus:border-burgundy-primary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option className="bg-[#0A0A0A] text-white" value="Fan Welcome / New Subscriber Greeting">Fan Welcome / New Subscriber Greeting</option>
                  <option className="bg-[#0A0A0A] text-white" value="Pay-Per-View (PPV) Teaser & Pitch">Pay-Per-View (PPV) Teaser & Pitch</option>
                  <option className="bg-[#0A0A0A] text-white" value="Tip Menu Upsell & Custom Request">Tip Menu Upsell & Custom Request</option>
                  <option className="bg-[#0A0A0A] text-white" value="Dormant Fan Re-engagement">Dormant Fan Re-engagement</option>
                  <option className="bg-[#0A0A0A] text-white" value="Mass DM Broadcast / General Promo">Mass DM Broadcast / General Promo</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Tone & Vibe */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 ml-1">
                Tone & Vibe
              </label>
              <div className="relative">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  disabled={isLocked}
                  className="w-full bg-white/5 border border-burgundy-dark/40 rounded-xl py-3 px-4 pr-10 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-burgundy-primary/50 focus:border-burgundy-primary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option className="bg-[#0A0A0A] text-white" value="Flirty & Playful">Flirty & Playful</option>
                  <option className="bg-[#0A0A0A] text-white" value="Casual & Warm">Casual & Warm</option>
                  <option className="bg-[#0A0A0A] text-white" value="Direct & Bold">Direct & Bold</option>
                  <option className="bg-[#0A0A0A] text-white" value="Exclusive & VIP Tease">Exclusive & VIP Tease</option>
                  <option className="bg-[#0A0A0A] text-white" value="Sweet & Engaging">Sweet & Engaging</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Context / Hook */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 ml-1">
                Context / Hook
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Add any background info, specific angles, or talking points..."
                rows={4}
                disabled={isLocked}
                className="w-full bg-white/5 border border-burgundy-dark/40 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-burgundy-primary/50 focus:border-burgundy-primary/50 transition-all resize-none disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLocked || isGenerating}
              className="w-full py-4 rounded-xl bg-white text-black text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Generate AI Outreach
                </>
              )}
            </button>
          </div>

          {/* FEATURE LOCK OVERLAY */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl z-10 flex flex-col items-center justify-center text-center p-8">
              <div className="bg-black/60 backdrop-blur-xl border border-burgundy-dark/40 rounded-2xl p-8 max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                <ShieldAlert className="w-8 h-8 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Pro Feature</h3>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                  AI Outreach Generation is a Pro feature. Upgrade your
                  workspace to unlock unlimited campaign creation.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-burgundy-primary text-white font-bold rounded-xl text-sm hover:brightness-110 transition-all duration-200 ease-out active:scale-[0.98] shadow-glow-burgundy"
                >
                  Upgrade to Premium <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* OUTPUT CARD */}
        <div className="bg-black/40 backdrop-blur-xl border border-burgundy-dark/40 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Send className="w-5 h-5 text-zinc-400" /> Generated Output
            </h2>
            {generatedMessage && !generatedMessage.startsWith("Error:") && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-burgundy-dark/40 text-xs font-bold text-zinc-300 hover:bg-white/10 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />{" "}
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            )}
          </div>

          {isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-burgundy-primary/30 border-t-burgundy-primary animate-spin" />
                <Sparkles className="w-6 h-6 text-burgundy-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-zinc-400 text-sm mt-6 font-medium">
                AI is crafting your outreach...
              </p>
            </div>
          ) : generatedMessage ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-white/[0.03] border border-burgundy-dark/40 rounded-2xl p-6">
                <pre className="whitespace-pre-wrap text-sm text-zinc-200 font-sans leading-relaxed">
                  {generatedMessage}
                </pre>
              </div>
              
              {!generatedMessage.startsWith("Error:") && (
                <div className="mt-6 flex flex-wrap gap-4">
                  {toneDetected && (
                    <div className="flex items-center gap-2 bg-burgundy-primary/10 border border-burgundy-primary/30 rounded-xl px-3 py-2">
                      <Activity className="w-4 h-4 text-burgundy-primary" />
                      <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">{toneDetected}</span>
                    </div>
                  )}
                  {campaignTags.length > 0 && campaignTags.map((tag, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                      <Tag className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-300">{tag}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 border border-dashed border-burgundy-dark/40 rounded-2xl bg-white/[0.02]">
              <Send className="w-8 h-8 text-zinc-600 mb-3" />
              <p className="text-zinc-500 font-medium">
                No message generated yet.
              </p>
              <p className="text-zinc-600 text-sm mt-1">
                Fill out the brief and hit generate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

