"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { completeOnboardingAction, autoHealCreatorAction } from "./actions";
import { SignOutButton } from "@/components/SignOutButton";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, DollarSign, Target, Clock, Zap, ArrowRight, CheckCircle2, Check,
  TrendingUp, Users, MessageSquare, ShieldCheck, BarChart3, ChevronRight, Crown, Shield, User, Mic, CreditCard
} from "lucide-react";

const STEPPER_STAGES = [
  { id: 1, label: "Account" },
  { id: 2, label: "Profile" },
  { id: 3, label: "Targeting" },
  { id: 4, label: "AI Voice" },
  { id: 5, label: "Pro Access" },
];

// ==========================================
// CONFIGURATION: 5 DYNAMIC AUDIT QUESTS
// ==========================================
const QUESTIONS = [
  {
    id: 1,
    tag: "TRAFFIC CHANNEL",
    title: "What is your primary traffic generation engine?",
    subtitle: "Select the core platform feeding your conversion funnel.",
    key: "trafficEngine",
    options: [
      { label: "TikTok Native Distribution", icon: Users, desc: "Short-form video trends & viral funneling" },
      { label: "Instagram Reels Engine", icon: TrendingUp, desc: "Broad-appeal reels & lifestyle modeling feeds" },
      { label: "Reddit / X (Twitter) Nodes", icon: Target, desc: "Subreddit marketing communities & thread automation" },
      { label: "Paid Agency Promo & Placements", icon: DollarSign, desc: "Shoutouts, network placement, & cross-promotions" },
      { label: "Closed Networks & Private Lists", icon: ShieldCheck, desc: "Private VIP telegram lists & invite-only loops" },
    ]
  },
  {
    id: 2,
    tag: "REVENUE TARGETS",
    title: "What’s your monthly income goal?",
    subtitle: "We'll optimize generation and distribution loops to align with this bracket.",
    key: "incomeGoal",
    options: [
      { label: "$1,000 – $5,000 / mo", icon: DollarSign, desc: "Accelerating local momentum" },
      { label: "$5,000 – $15,000 / mo", icon: TrendingUp, desc: "Establishing structured growth loops" },
      { label: "$15,000 – $50,000 / mo", icon: Zap, desc: "High-tier premium operational scale" },
      { label: "$50,000+ / mo", icon: Sparkles, desc: "Uncapped enterprise distribution" },
    ]
  },
  {
    id: 3,
    tag: "CRITICAL BOTTLENECK",
    title: "What’s your biggest struggle right now?",
    subtitle: "Our deep learning layers focus resources here first to clear immediate friction.",
    key: "biggestStruggle",
    options: [
      { label: "Inconsistent audience conversion", icon: Target, desc: "High traffic, low sustainable conversions" },
      { label: "Severe operational time deficits", icon: Clock, desc: "Too many manual workflows, not enough freedom" },
      { label: "Under-monetized conversational funnels", icon: MessageSquare, desc: "Missing massive margins hidden inside direct chats" },
      { label: "Unpredictable algorithmic delivery", icon: TrendingUp, desc: "Fluctuating distribution metrics out of your control" },
    ]
  },
  {
    id: 4,
    tag: "OPERATION METRICS",
    title: "How much time do you spend messaging daily?",
    subtitle: "Chat automation delivers compounding high-margin returns instantaneously.",
    key: "messagingTime",
    options: [
      { label: "Less than 1 hour daily", icon: Clock, desc: "Early phase relationship tracking" },
      { label: "1 to 3 hours daily", icon: MessageSquare, desc: "Moderate operational burden" },
      { label: "3 to 6 hours daily", icon: Target, desc: "Severe bottleneck stalling asset building" },
      { label: "6+ hours (Constant maintenance)", icon: Zap, desc: "Critical administrative emergency" },
    ]
  },
  {
    id: 5,
    tag: "AUTOPILOT INTEGRATION",
    title: "Want AI to help grow your revenue automatically?",
    subtitle: "Enabling autonomous agent pipelines processes growth vectors in the background 24/7.",
    key: "enableAutopilot",
    options: [
      { label: "Yes, activate optimization engine", icon: Sparkles, desc: "Complete systemic autopilot configuration" },
      { label: "No, review manual strategies first", icon: BarChart3, desc: "Step-by-step confirmation prompts only" },
    ]
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"questions" | "analyzing">("questions");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisText, setAnalysisText] = useState("Initializing model matrices...");

  // Auto-healing: Ensure row exists when user starts onboarding
  useEffect(() => {
    autoHealCreatorAction();
  }, []);

  const handleSelectOption = async (key: string, value: string) => {
    if (step === "analyzing") return; // Prevent clicks while analyzing

    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    
    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQ(prev => Math.min(prev + 1, QUESTIONS.length - 1));
      }, 250);
    } else {
      setStep("analyzing");
      try {
        await completeOnboardingAction(newAnswers);
      } catch (error) {
        console.error("Failed to complete onboarding:", error);
      }
    }
  };

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ(prev => prev - 1);
  };

  useEffect(() => {
    if (step !== "analyzing") return;

    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push("/paywall"), 600);
          return 100;
        }
        
        if (prev === 20) setAnalysisText("Extracting audience demographic parameters...");
        if (prev === 45) setAnalysisText("Synthesizing context-aware conversational templates...");
        if (prev === 70) setAnalysisText("Generating mathematical milestone projections...");
        if (prev === 90) setAnalysisText("Finalizing custom operational architecture...");
        
        return prev + 1;
      });
    }, 250); // Gives a high-quality processing experience

    return () => clearInterval(interval);
  }, [step, router]);

  const progressPercent = (currentQ / (QUESTIONS.length - 1)) * 100;
  const activeQuestion = QUESTIONS[currentQ] || QUESTIONS[QUESTIONS.length - 1];

  // Bind stepper to actual flow: Step 1 (Account) is permanently completed, so currentQ = 0 maps to currentStep = 2.
  const currentStep = Math.min(currentQ + 2, 5);
  const stepperFill = ((currentStep - 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-app-black text-white flex flex-col items-center justify-center p-4 selection:bg-white/20 font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-burgundy-primary/10 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Escape Hatch */}
      <div className="absolute top-8 right-8 z-50">
        <div className="bg-white/5 border border-burgundy-dark/40 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <SignOutButton />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-xl flex flex-col gap-4">
        
        {/* ========================================== */}
        {/* ENDOWED PROGRESS STEPPER                   */}
        {/* ========================================== */}
        <div className="w-full bg-surface-dark border border-neutral-800/60 rounded-xl px-6 py-3 shadow-lg mb-4 sm:mb-6">
          <div className="flex items-center justify-between w-full relative">
            
            {/* Background track line */}
            <div className="absolute top-[18px] left-[10%] right-[10%] h-[2px] bg-neutral-800 z-0" />
            
            {/* Animated fill line */}
            <div 
              className="absolute top-[18px] left-[10%] h-[2px] bg-[#800020] z-[1] transition-all duration-700 ease-in-out"
              style={{ width: `${stepperFill * 0.8}%` }}
            />

            {STEPPER_STAGES.map((stage) => {
              const isFirstNode = stage.id === 1;
              const isCompleted = isFirstNode || stage.id < currentStep;
              const isActive = !isFirstNode && stage.id === currentStep;
              const isUpcoming = !isFirstNode && stage.id > currentStep;

              let Icon;
              if (stage.id === 1) Icon = User;
              else if (stage.id === 2) Icon = Sparkles;
              else if (stage.id === 3) Icon = Target;
              else if (stage.id === 4) Icon = Mic;
              else Icon = CreditCard;

              return (
                <div key={stage.id} className="relative z-10 flex flex-col items-center gap-1.5">
                  <motion.div 
                    initial={isFirstNode ? { scale: 0 } : false}
                    animate={{ scale: isFirstNode ? [0, 1.2, 1] : isActive ? 1.1 : 1 }}
                    transition={{ duration: isFirstNode ? 0.6 : 0.3, ease: "easeOut" }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ease-in-out
                      ${isCompleted ? 'bg-[#800020] border-[#800020] text-white' : ''}
                      ${isActive ? 'bg-[#0A0A0A] border-[#800020] text-[#800020] shadow-[0_0_15px_rgba(128,0,32,0.4)]' : ''}
                      ${isUpcoming ? 'bg-[#0A0A0A] border-neutral-800 text-neutral-600' : ''}
                    `}
                  >
                    {isCompleted ? <Check className="w-4 h-4 text-white" strokeWidth={3} /> : <Icon className="w-3.5 h-3.5" />}
                  </motion.div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors duration-300
                    ${isCompleted ? 'text-white' : isActive ? 'text-[#800020]' : 'text-neutral-600'}
                  `}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* ========================================== */}
          {/* STATE 1: RUNNING WIZARD AUDIT CHANNELS     */}
          {/* ========================================== */}
          {step === "questions" && (
            <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-[#415375] tracking-widest uppercase">
                    STEP {currentQ + 1} OF {QUESTIONS.length}
                  </span>
                  {currentQ > 0 && (
                    <button onClick={handleBack} className="text-xs text-[#8496B4] hover:text-burgundy-primary transition-colors">
                      ← Back
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-5 sm:p-6 shadow-2xl">
                <div className="space-y-1.5 mb-4">
                  <div className="inline-flex items-center gap-1.5 bg-burgundy-primary/10 border border-burgundy-primary/30 text-burgundy-primary px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest">
                    <Sparkles className="w-3 h-3 text-burgundy-primary" /> {activeQuestion.tag}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-[#F1F5F9] leading-snug">
                    {activeQuestion.title}
                  </h2>
                  <p className="text-sm text-[#6C7E9C] font-normal leading-relaxed">
                    {activeQuestion.subtitle}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {activeQuestion.options.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.label}
                        onClick={() => handleSelectOption(activeQuestion.key, option.label)}
                        className="group w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 bg-[#0A0A0A] border-neutral-800/60 hover:border-[#800020] hover:bg-[#800020]/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-dark text-neutral-500 group-hover:text-[#800020] transition-colors">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="space-y-0">
                            <div className="text-[13px] font-bold text-white">{option.label}</div>
                            <div className="text-[11px] text-neutral-400">{option.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-[#800020] transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* STATE 2: AI INTERPOLATION ENGINE EVAL      */}
          {/* ========================================== */}
          {step === "analyzing" && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-surface-dark border border-neutral-800/60 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-[#141A29]">
                <motion.div className="h-full bg-burgundy-primary" style={{ width: `${analysisProgress}%` }} />
              </div>
              <div className="w-10 h-10 bg-[#131929] border border-[#1F2A45] rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-burgundy-primary animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#F1F5F9]">Constructing Strategy Metrics</h3>
                <p className="text-xs text-burgundy-primary font-mono tracking-wider h-4">{analysisText}</p>
              </div>
              <div className="text-xl font-black text-[#324366] font-mono">{analysisProgress}%</div>
            </motion.div>
          )}



        </AnimatePresence>
      </div>
    </div>
  );
}