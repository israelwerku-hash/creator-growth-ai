"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Send, ShieldAlert, ArrowRight, Languages, AlertCircle, Info } from "lucide-react";
import { getUserTierAction } from "@/app/dashboard/actions";

export default function TranslatorPage() {
  const router = useRouter();
  const [userTier, setUserTier] = useState<string>("FREE");
  const [isChecking, setIsChecking] = useState(true);

  // Form state
  const [sourceText, setSourceText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  
  // Output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [translationNotes, setTranslationNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTier = async () => {
      const res = await getUserTierAction();
      if (res.success && res.tier) {
        setUserTier(res.tier);
      }
      setIsChecking(false);
    };
    fetchTier();
  }, []);

  const handleTranslate = async () => {
    if (!sourceText) return;
    setIsGenerating(true);
    setTranslatedText("");
    setDetectedLanguage("");
    setConfidenceScore(null);
    setTranslationNotes("");
    setError("");

    try {
      const response = await fetch("/api/language-translator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textToTranslate: sourceText,
          targetLanguage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Translation failed.");
      }
      
      const { data } = result;

      setTranslatedText(data.translatedText);
      if (data.detectedLanguage) setDetectedLanguage(data.detectedLanguage);
      if (data.confidenceScore !== undefined) setConfidenceScore(data.confidenceScore);
      if (data.translationNotes) setTranslationNotes(data.translationNotes);

      // Refresh layout to update global credit count
      router.refresh();

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-burgundy-primary animate-spin" />
      </div>
    );
  }

  if (userTier === "FREE") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-16 h-16 bg-red-950/30 rounded-2xl border border-red-900/30 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Feature Locked</h2>
          <p className="text-zinc-400 max-w-md mx-auto">This feature is part of the Enterprise Engine. Upgrade to Premium to unlock Language Translator and other advanced AI features.</p>
        </div>
        <Link href="/pricing" className="px-6 py-3 bg-burgundy-primary text-white font-bold rounded-xl hover:brightness-110 shadow-glow-burgundy flex items-center gap-2 transition-all active:scale-95">
          <ArrowRight className="w-4 h-4" /> Upgrade to Premium
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Language Translator
        </h1>
        <p className="text-zinc-400 mt-2">
          Translate your hooks and copy effortlessly. 15 credits per run.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative bg-black/40 backdrop-blur-xl border border-burgundy-dark/40 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl" />
          
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" /> Input
          </h2>
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 ml-1">
                Target Language
              </label>
              <input
                type="text"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                placeholder="e.g. Spanish, French, Japanese"
                className="w-full bg-white/5 border border-burgundy-dark/40 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 ml-1">
                Source Text
              </label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter the text to translate..."
                rows={6}
                className="w-full bg-white/5 border border-burgundy-dark/40 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
              />
            </div>

            {error && <p className="text-red-400 text-sm font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}

            <button
              type="button"
              onClick={handleTranslate}
              disabled={isGenerating || !sourceText.trim()}
              className="w-full py-4 rounded-xl bg-white text-black text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Translating...</>
              ) : (
                <><Send className="w-4 h-4" /> Translate (15 Credits)</>
              )}
            </button>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-burgundy-dark/40 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-zinc-400" /> Output
          </h2>
          
          <div className="flex-1 flex flex-col">
            {translatedText ? (
              <>
                <div className="bg-white/[0.03] border border-burgundy-dark/40 rounded-2xl p-6 flex-1 min-h-[200px]">
                  <pre className="whitespace-pre-wrap text-sm text-zinc-200 font-sans leading-relaxed">
                    {translatedText}
                  </pre>
                </div>

                <div className="mt-6 flex flex-wrap gap-4">
                  {detectedLanguage && (
                    <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-xl px-3 py-2">
                      <Languages className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Detected: {detectedLanguage}</span>
                    </div>
                  )}
                  {confidenceScore !== null && (
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                      <span className="text-[11px] font-medium text-zinc-400">Confidence:</span>
                      <span className="text-[11px] font-bold text-emerald-400">{Math.round(confidenceScore * 100)}%</span>
                    </div>
                  )}
                </div>

                {translationNotes && (
                  <div className="mt-4 p-4 rounded-xl border border-zinc-800 bg-black/40 flex gap-3 items-start">
                    <Info className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-1">Translation Notes</p>
                      <p className="text-xs text-zinc-300 leading-relaxed">{translationNotes}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 h-full min-h-[200px] flex flex-col items-center justify-center py-16 border border-dashed border-burgundy-dark/40 rounded-2xl bg-white/[0.02]">
                <p className="text-zinc-500 font-medium">No translation yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
