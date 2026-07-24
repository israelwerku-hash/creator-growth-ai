import React from "react";
import { HelpCircle, Chrome, MessageSquare, PieChart, Database, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Help & Tutorials | Creator Growth AI",
};

export default function HelpPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-burgundy-primary" />
          Help & Tutorials
        </h1>
        <p className="text-zinc-400 mt-2">
          Learn how to maximize your AI growth engine and set up your environment.
        </p>
      </header>

      {/* Tools Overview Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b border-burgundy-dark/40 pb-2">Core Tools Masterclass</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card: DM Gen */}
          <div className="bg-surface-dark border border-neutral-800/60 transition-all duration-200 ease-out hover:border-burgundy-primary/50 hover:shadow-glow-subtle rounded-2xl p-6 shadow-xl hover:shadow-burgundy-primary/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-burgundy-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-burgundy-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">DM Generation</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Our most powerful tool. Set your campaign goals and let the AI draft personalized outreach messages.
            </p>
            <ul className="text-xs text-zinc-500 space-y-2 mb-6">
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 mt-0.5 text-zinc-400"/> Best for: Cold outreach and brand deals.</li>
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 mt-0.5 text-zinc-400"/> Pro Tip: Always include context about the target.</li>
            </ul>
          </div>

          {/* Card: Segmentation */}
          <div className="bg-surface-dark border border-neutral-800/60 transition-all duration-200 ease-out hover:border-burgundy-primary/50 hover:shadow-glow-subtle rounded-2xl p-6 shadow-xl hover:shadow-burgundy-primary/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-burgundy-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PieChart className="w-6 h-6 text-burgundy-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">AI Segmentation</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Automatically categorize your audience based on revenue, engagement, and opportunity scores.
            </p>
            <ul className="text-xs text-zinc-500 space-y-2 mb-6">
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 mt-0.5 text-zinc-400"/> Best for: Identifying high-value VIPs.</li>
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 mt-0.5 text-zinc-400"/> Pro Tip: Target the "Whale" segment first.</li>
            </ul>
          </div>

          {/* Card: Memory Vault */}
          <div className="bg-surface-dark border border-neutral-800/60 transition-all duration-200 ease-out hover:border-burgundy-primary/50 hover:shadow-glow-subtle rounded-2xl p-6 shadow-xl hover:shadow-burgundy-primary/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-burgundy-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6 text-burgundy-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">Memory Vault</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Store crucial fan facts permanently. The AI reads this vault to simulate conversations and tailor scripts.
            </p>
            <ul className="text-xs text-zinc-500 space-y-2 mb-6">
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 mt-0.5 text-zinc-400"/> Best for: Building long-term relationships.</li>
              <li className="flex items-start gap-2"><ArrowRight className="w-3 h-3 mt-0.5 text-zinc-400"/> Pro Tip: Log personal details like birthdays.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Extension Guide Section */}
      <section className="space-y-6 mt-12 pt-8 border-t border-burgundy-dark/40">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Chrome className="w-6 h-6 text-zinc-300" /> Extension Integration Guide
        </h2>
        
        <div className="bg-surface-dark border border-neutral-800/60 transition-all duration-200 ease-out hover:border-burgundy-primary/50 hover:shadow-glow-subtle rounded-2xl p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <p className="text-zinc-300">
                To unleash the full power of Creator Growth AI, you need to sync your real-time platform data using our secure Chrome Extension.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-burgundy-primary/20 text-burgundy-primary flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-sm">Download the Extension</h4>
                    <p className="text-xs text-zinc-400 mt-1">Get the latest ZIP file from our releases page and extract it to your local machine.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-burgundy-primary/20 text-burgundy-primary flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-sm">Enable Developer Mode</h4>
                    <p className="text-xs text-zinc-400 mt-1">Open Chrome, navigate to <code className="bg-black px-1.5 py-0.5 rounded text-burgundy-primary">chrome://extensions</code>, and toggle "Developer Mode" in the top right.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-burgundy-primary/20 text-burgundy-primary flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-sm">Load Unpacked</h4>
                    <p className="text-xs text-zinc-400 mt-1">Click "Load Unpacked" and select the folder you extracted in Step 1. The extension will now appear in your browser toolbar.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Placeholder for Tutorial */}
            <div className="bg-black/50 border border-white/5 rounded-xl aspect-video flex flex-col items-center justify-center p-6 text-center shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-burgundy-primary/5 to-transparent z-0" />
              <Chrome className="w-16 h-16 text-zinc-600 mb-4 z-10 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="font-bold text-zinc-300 z-10">Video Tutorial</h3>
              <p className="text-xs text-zinc-500 mt-2 z-10 max-w-xs">Click to watch the 60-second setup walkthrough showing the exact installation process.</p>
              
              <button className="mt-6 z-10 px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-lg border border-burgundy-dark/40 transition-colors backdrop-blur-md">
                Play Video
              </button>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
