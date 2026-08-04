"use client";

import React, { useState } from "react";
import { Download, KeyRound, Chrome, Sparkles, MessageSquare, ChevronDown, CheckCircle2 } from "lucide-react";

export default function GuidePage() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      title: "Download the Companion Extension",
      icon: <Download className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm leading-relaxed">
            The Chrome Extension is where the magic happens. It overlays directly onto your creator platform (OnlyFans, Fansly, etc.) so you can generate messages without switching tabs.
          </p>
          <div className="bg-[#121218] border border-[#800020]/30 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between shadow-[0_0_15px_rgba(128,0,32,0.1)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#800020]/20 rounded-lg flex items-center justify-center">
                <Chrome className="w-5 h-5 text-[#800020]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Agency Elite Chrome Extension</h4>
                <p className="text-xs text-zinc-500">v1.2.0 • ZIP Archive</p>
              </div>
            </div>
            {/* The user explicitly requested this to have the download attribute */}
            <a 
              href="/agency-elite-extension.zip" 
              download="agency-elite-extension.zip"
              className="w-full md:w-auto bg-white text-black text-xs font-bold px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
            >
              <Download className="w-4 h-4" /> Download Extension
            </a>
          </div>
          
          <div className="bg-[#1a1a24] border border-[#800020]/40 rounded-xl p-5 mt-4">
            <h4 className="text-sm font-bold text-white mb-3">How to Unzip & Load the Extension</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-bold text-zinc-300 mb-1 uppercase tracking-wider">1. Unpack the File</h5>
                <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside ml-1">
                  <li><strong className="text-white">Windows:</strong> Right-click <span className="font-mono text-zinc-300 bg-white/5 px-1 rounded">agency-elite-extension.zip</span> ➔ Click "Extract All..." ➔ Click "Extract".</li>
                  <li><strong className="text-white">Mac:</strong> Double-click <span className="font-mono text-zinc-300 bg-white/5 px-1 rounded">agency-elite-extension.zip</span> to automatically unzip it into a regular folder.</li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-xs font-bold text-zinc-300 mb-1 uppercase tracking-wider">2. Load into Chrome</h5>
                <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside ml-1">
                  <li>Open a new tab and go to <span className="font-mono text-zinc-300 bg-white/5 px-1 rounded">chrome://extensions</span></li>
                  <li>Turn ON "Developer mode" (toggle switch in the top-right corner).</li>
                  <li>Click the "Load unpacked" button (top-left).</li>
                  <li>Select the extracted regular folder (NOT the <span className="font-mono text-zinc-300 bg-white/5 px-1 rounded">.zip</span> file).</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 bg-[#800020]/20 border border-[#800020]/50 rounded-lg p-3 text-xs text-zinc-300 flex items-start gap-2">
              <span className="font-bold text-[#ef4444]">Note:</span> Make sure to select the unzipped folder, not the .zip file itself!
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Secure Your API Key",
      icon: <KeyRound className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm leading-relaxed">
            To link the extension to your account and credit balance, you need to input your unique API Key into the extension's settings.
          </p>
          <div className="bg-[#121218] border border-white/5 rounded-xl p-4">
            <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-400">
              <li>Click the extension icon in your Chrome toolbar.</li>
              <li>Navigate to the <strong className="text-white">Settings</strong> tab.</li>
              <li>Paste your API Key (found in your Dashboard settings).</li>
              <li>Click <strong className="text-white">Save Changes</strong> to verify.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Activate the Overlay",
      icon: <Sparkles className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm leading-relaxed">
            Once connected, navigate to your creator platform's chat page. You will see the Agency Elite floating action button in the bottom right corner.
          </p>
          <div className="flex items-center gap-3 bg-[#121218] border border-white/5 rounded-xl p-4">
            <div className="w-12 h-12 bg-black rounded-full border border-zinc-800 flex items-center justify-center shadow-lg relative">
              <div className="absolute inset-0 bg-[#800020]/20 rounded-full blur-md" />
              <span className="font-bold text-white relative z-10 text-lg">Ω</span>
            </div>
            <p className="text-sm text-zinc-400">
              Clicking this button expands the AI control panel directly over your chat window.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Save Fan Memories",
      icon: <CheckCircle2 className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm leading-relaxed">
            Before generating messages, build context. Use the extension to save key details about the fan you are chatting with.
          </p>
          <p className="text-xs text-zinc-500 italic">
            Example: "Loves when I wear red", "Works night shifts", "Big spender on Fridays".
          </p>
          <p className="text-sm text-zinc-400">
            The AI automatically retrieves these memories during generation to ensure responses are hyper-personalized and authentic.
          </p>
        </div>
      )
    },
    {
      id: 5,
      title: "Generate High-Converting DMs",
      icon: <MessageSquare className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm leading-relaxed">
            You are ready to scale your engagement. Open the extension overlay, select your campaign goal, and let the AI do the heavy lifting.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-gradient-to-br from-[#121218] to-[#0A0A0C] border border-[#800020]/20 rounded-xl p-3">
              <span className="text-[#800020] font-bold text-xs uppercase tracking-wider block mb-1">PPV Upsell</span>
              <span className="text-zinc-500 text-xs block">Generates a natural lead-in to sell locked content.</span>
            </div>
            <div className="bg-gradient-to-br from-[#121218] to-[#0A0A0C] border border-white/5 rounded-xl p-3">
              <span className="text-zinc-300 font-bold text-xs uppercase tracking-wider block mb-1">Re-Engagement</span>
              <span className="text-zinc-500 text-xs block">Sparks conversation with inactive spenders.</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-[80vh] bg-[#0A0A0C] text-white max-w-4xl mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Setup & Usage Guide</h1>
        <p className="text-zinc-500">Master the Growth Engine and your AI Companion in 5 simple steps.</p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => {
          const isActive = activeStep === step.id;
          return (
            <div 
              key={step.id}
              className={`rounded-2xl transition-all duration-300 overflow-hidden border ${
                isActive 
                  ? "bg-[#121218] border-[#800020]/50 shadow-[0_0_30px_rgba(128,0,32,0.08)]" 
                  : "bg-[#0A0A0C] border-white/5 hover:border-white/10 hover:bg-[#121218]/50 cursor-pointer"
              }`}
              onClick={() => setActiveStep(step.id)}
            >
              <div className="flex items-center justify-between p-5 md:p-6 select-none">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
                    isActive ? "bg-[#800020]/20 text-[#800020]" : "bg-white/5 text-zinc-500"
                  }`}>
                    {step.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-bold tracking-widest uppercase mb-1 transition-colors ${
                      isActive ? "text-[#800020]" : "text-zinc-600"
                    }`}>
                      Step 0{step.id}
                    </p>
                    <h3 className={`text-base font-semibold transition-colors ${
                      isActive ? "text-white" : "text-zinc-300"
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                </div>
                <div className={`transition-transform duration-300 ${isActive ? "rotate-180" : "rotate-0"}`}>
                  <ChevronDown className={`w-5 h-5 ${isActive ? "text-[#800020]" : "text-zinc-600"}`} />
                </div>
              </div>

              {isActive && (
                <div className="px-5 md:px-6 pb-6 pt-0 animate-in slide-in-from-top-2 fade-in duration-300">
                  <div className="pl-14">
                    {step.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
