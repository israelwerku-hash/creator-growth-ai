"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  BrainCircuit, ArrowLeft, Sparkles, Plus, ShieldCheck, User, Bookmark, Loader2, Activity, Tag, CheckCircle2
} from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";

const memorySchema = z.object({
  newFact: z.string().min(1, "Memory fact is required"),
  category: z.string(),
  isPriority: z.boolean(),
});
type MemoryFormValues = z.infer<typeof memorySchema>;

import { getCreatorFansAction, addFanMemoryAction } from "@/app/dashboard/actions";

export default function AIMemoryVaultPage() {
  const router = useRouter();
  
  // 1. POPULATE FANS
  const [fans, setFans] = useState<any[]>([]);
  const [selectedFanId, setSelectedFanId] = useState<string>("");
  
  React.useEffect(() => {
    const fetchFans = async () => {
      const res = await getCreatorFansAction();
      if (res.success && res.fans && res.fans.length > 0) {
        setFans(res.fans);
        setSelectedFanId(res.fans[0].id);
      }
    };
    fetchFans();
  }, []);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // React Hook Form for Memory
  const {
    register: registerMemory,
    handleSubmit: handleMemorySubmit,
    reset: resetMemory,
    watch: watchMemory,
    setValue: setMemoryValue,
    formState: { errors: memoryErrors, isSubmitting: isSubmittingFact },
  } = useForm<MemoryFormValues>({
    resolver: zodResolver(memorySchema),
    defaultValues: { newFact: "", category: "Preference", isPriority: false },
  });
  const isPriorityValue = watchMemory("isPriority");

  // AI Analysis Results State
  const [vaultResults, setVaultResults] = useState<Record<string, any>>({});

  const handleAddFact = async (data: MemoryFormValues) => {
    if (!selectedFanId) return;

    const result = await addFanMemoryAction(selectedFanId, {
      text: data.newFact,
      category: data.category,
      isPriority: data.isPriority
    });

    if (result.success && result.memory) {
      setFans(prevFans => prevFans.map(fan => {
        if (fan.id === selectedFanId) {
          return {
            ...fan,
            memories: [result.memory, ...(fan.memories || [])]
          };
        }
        return fan;
      }));
    }
    
    resetMemory({ newFact: "", category: "Preference", isPriority: false });
  };

  const handleAnalyzeVault = async () => {
    if (!selectedFanId) return;
    setIsAnalyzing(true);
    
    try {
      const selectedFan = fans.find(f => f.id === selectedFanId);
      const fanMemories = selectedFan?.memories || [];
      const memoryContext = fanMemories.map((m: any) => `[${m.category}] ${m.keyFact}`).join('\n');
      
      const response = await fetch("/api/memory-vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: "user_123", // Using mock ID as required for now
          fanId: selectedFanId,
          chatHistory: memoryContext || "No history yet. Fan has just subscribed.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setVaultResults(prev => ({
        ...prev,
        [selectedFanId]: data.data // Stores the returned Zod schema object
      }));
      
      // Update global credit UI via Server Component Layout refresh
      router.refresh();

    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentMemories = fans.find(f => f.id === selectedFanId)?.memories || [];
  const currentResult = vaultResults[selectedFanId];

  return (
    <div className="min-h-screen bg-[#05020a] text-zinc-100 p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-1/4 w-full max-w-4xl h-[300px] bg-burgundy-primary/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Memory Vault Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between border border-zinc-900 bg-[#0E1321]/80 backdrop-blur-md rounded-2xl p-4 gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-burgundy-primary/10 border border-burgundy-primary/30 rounded-xl flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-burgundy-primary" />
            </div>
            <div>
              <h1 className="text-md font-black text-white tracking-tight">Fan Memory Vault <span className="text-burgundy-primary text-xs">(Local Test Mode)</span></h1>
              <p className="text-xs text-zinc-500">Track interactions, traits, and let AI build context.</p>
            </div>
          </div>
          <Link href="/dashboard" className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-400 transition flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0b0714]/60 border border-zinc-900 p-5 rounded-2xl backdrop-blur-xl space-y-4">
              <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-zinc-500" /> Select Target Fan Profile
              </h3>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {fans.map((fan) => (
                  <button
                    key={fan.id}
                    onClick={() => setSelectedFanId(fan.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border font-mono text-xs transition relative overflow-hidden flex items-center justify-between ${
                      selectedFanId === fan.id 
                        ? "bg-burgundy-primary/20 border-burgundy-primary/50 text-white shadow-glow-burgundy" 
                        : "bg-black/40 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <span className="truncate max-w-[150px]">{fan.name || fan.username || 'Anonymous Fan'}</span>
                    <span className="text-[10px] text-zinc-500 shrink-0">${fan.totalSpend} spent</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0b0714]/60 border border-zinc-900 p-5 rounded-2xl backdrop-blur-xl space-y-4 shadow-xl">
              <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5 text-zinc-500" /> Log Core Memory
              </h3>
              <form onSubmit={handleMemorySubmit(handleAddFact)} className="space-y-4">
                <textarea 
                  {...registerMemory("newFact")}
                  placeholder="E.g., Prefers DMs around 9PM, high spender on customs..."
                  className="w-full bg-black/40 border border-zinc-900 focus:border-burgundy-primary/50 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-700 min-h-[100px] transition outline-none"
                  disabled={!selectedFanId || isSubmittingFact}
                />
                {memoryErrors.newFact && <p className="text-red-400 text-xs">{memoryErrors.newFact.message}</p>}
                
                <div className="flex items-center gap-3">
                  <CustomSelect 
                    value={watchMemory("category")}
                    onChange={(val) => setMemoryValue("category", val)}
                    options={[
                      { label: "Preference", value: "Preference" },
                      { label: "Fact", value: "Fact" },
                      { label: "Interaction", value: "Interaction" },
                      { label: "Milestone", value: "Milestone" }
                    ]}
                    disabled={!selectedFanId || isSubmittingFact}
                    className="flex-1"
                  />
                  <button 
                    type="button"
                    onClick={() => setMemoryValue("isPriority", !isPriorityValue)}
                    className={`px-3 py-2 rounded-lg text-xs font-mono border transition ${isPriorityValue ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-black/40 border-zinc-900 text-zinc-500'}`}
                    disabled={!selectedFanId || isSubmittingFact}
                  >
                    ★ Priority
                  </button>
                </div>
                <button 
                  type="submit"
                  disabled={!selectedFanId || isSubmittingFact}
                  className="w-full bg-burgundy-primary hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-glow-burgundy"
                >
                  {isSubmittingFact ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Append Trait
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#0b0714]/60 border border-zinc-900 p-6 rounded-2xl backdrop-blur-xl min-h-[400px] flex flex-col shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-burgundy-primary" /> Core Memories & Insights
                </h2>
                
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-mono px-3 py-1 bg-burgundy-primary/10 text-burgundy-primary border border-burgundy-primary/20 rounded-full">
                    {currentMemories.length} Active Vectors
                  </div>
                  
                  {selectedFanId && (
                    <button 
                      onClick={handleAnalyzeVault}
                      disabled={isAnalyzing}
                      className="text-xs px-4 py-1.5 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      Run AI Analysis
                    </button>
                  )}
                </div>
              </div>
              
              {/* AI Analysis Results DOM Update */}
              {currentResult && (
                <div className="mb-6 bg-white/[0.03] border border-burgundy-primary/20 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Analysis Complete</span>
                  </div>
                  
                  <p className="text-sm text-zinc-300 leading-relaxed font-medium">"{currentResult.fanSummary}"</p>
                  
                  <div className="flex flex-wrap gap-3 mt-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-burgundy-primary/10 border border-burgundy-primary/30">
                      <Activity className="w-3.5 h-3.5 text-burgundy-primary" />
                      <span className="text-[11px] font-bold text-zinc-200 uppercase">{currentResult.spendingSentiment}</span>
                    </div>
                    {currentResult.keyInterests?.map((interest: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <Tag className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[11px] font-medium text-zinc-300">{interest}</span>
                      </div>
                    ))}
                  </div>

                  {currentResult.suggestedAction && (
                    <div className="mt-4 bg-black/40 p-3 rounded-lg border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono mb-1 block">Suggested Next Action</span>
                      <p className="text-xs text-zinc-300">{currentResult.suggestedAction}</p>
                    </div>
                  )}
                </div>
              )}

              {!selectedFanId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-3">
                  <ShieldCheck className="w-8 h-8 opacity-20" />
                  <p className="text-xs font-mono">Select a fan profile to unlock their core memories.</p>
                </div>
              ) : currentMemories.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-3">
                  <BrainCircuit className="w-8 h-8 opacity-20" />
                  <p className="text-xs font-mono">No core memories established yet. Log a trait below.</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-2 max-h-[400px]">
                  {currentMemories.map((mem: any) => (
                    <div key={mem.id} className={`p-4 rounded-xl border ${mem.isPriority ? 'bg-amber-950/20 border-amber-500/30' : 'bg-[#140e1f] border-zinc-800/50'} relative group`}>
                      {mem.isPriority && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-xl" />}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${mem.isPriority ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}>
                          {mem.category}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-mono">
                          {new Date(mem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-200 leading-relaxed">{mem.keyFact}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA for Unified Ecosystem */}
            {selectedFanId && currentMemories.length > 0 && (
              <div className="bg-[#0b0714]/80 border border-burgundy-primary/40 p-8 rounded-2xl relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col items-center text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-burgundy-primary/10 blur-[60px] pointer-events-none" />
                <h3 className="text-lg font-bold text-white mb-2 relative z-10">Ready to engage?</h3>
                <p className="text-zinc-400 text-sm mb-6 max-w-md relative z-10">
                  Leverage these active memory vectors to generate a hyper-personalized outreach message.
                </p>
                <Link 
                  href={`/dashboard/dm-generation?fanId=${selectedFanId}`}
                  className="relative z-10 px-8 py-3.5 bg-burgundy-primary hover:brightness-110 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-glow-burgundy flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate DM for this Fan
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}