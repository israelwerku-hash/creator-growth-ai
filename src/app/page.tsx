"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, CheckCircle2, MessageSquare, PieChart, BrainCircuit, Instagram, Mail } from "lucide-react";

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#050505] text-white selection:bg-white/20 font-sans">
      {/* 1. Navigation Bar */}
      <nav suppressHydrationWarning className="fixed top-0 inset-x-0 z-50 flex justify-center p-6">
        <div suppressHydrationWarning className="w-full max-w-5xl rounded-2xl bg-white/5 border border-burgundy-dark/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              Ω
            </div>
            <span className="font-bold tracking-tight text-lg">DNA Growth</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/login" className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* 2. Immersive Hero Section */}
        <section className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center z-0">
          {isMounted && (
            <video autoPlay loop muted playsInline preload="auto" suppressHydrationWarning className="absolute top-0 left-0 w-full h-full object-cover">
              <source src="/premium-hero.mp4" type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white drop-shadow-glow-burgundy mb-6">
              Scale Your OnlyFans With AI.
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mb-10 leading-relaxed font-medium">
              The premier AI growth engine and automated DM system for top 0.1% creators.
            </p>
            <Link 
              href="/login" 
              className="backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl"
            >
              Start Scaling Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* 3. Feature Showcase */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Architected for dominance.</h2>
            <p className="text-zinc-400 text-lg">Every tool you need to maximize lifetime value.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 p-10 rounded-[2rem] hover:bg-zinc-900/80 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />
              <div className="w-14 h-14 bg-white/10 border border-burgundy-dark/40 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-glow-burgundy">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI DM Engine</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Autonomous high-conversion chat sequencing. Generate perfectly toned payload hooks and PPV scripts instantly.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 p-10 rounded-[2rem] hover:bg-zinc-900/80 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />
              <div className="w-14 h-14 bg-white/10 border border-burgundy-dark/40 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-glow-burgundy">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Smart Segmentation</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Identify whales instantly. Predictive analytics categorize your fans by spend habits, churn risk, and conversion opportunity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 p-10 rounded-[2rem] hover:bg-zinc-900/80 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />
              <div className="w-14 h-14 bg-white/10 border border-burgundy-dark/40 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-glow-burgundy">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Memory Vault</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Never forget a detail. Track interactions, store custom traits, and let AI build rich sub-context for every single fan.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Luxury Pricing Structure */}
        <section id="pricing" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Invest in your infrastructure.</h2>
            
            <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 rounded-full p-1.5">
              <button 
                onClick={() => setIsAnnual(false)} 
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${!isAnnual ? 'bg-white text-black shadow-glow-burgundy' : 'text-zinc-400 hover:text-white'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsAnnual(true)} 
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isAnnual ? 'bg-white text-black shadow-glow-burgundy' : 'text-zinc-400 hover:text-white'}`}
              >
                Annual <span className={`text-[10px] px-2 py-0.5 rounded-full ${isAnnual ? 'bg-black text-white' : 'bg-white/10 text-white'}`}>SAVE 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Starter Tier */}
            <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-[2.5rem] p-10 relative overflow-hidden">
              <h3 className="text-xl font-bold text-zinc-400 mb-2">Starter</h3>
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-5xl font-black tracking-tight">Free</span>
              </div>
              <ul className="space-y-5 mb-10">
                <li className="flex items-center gap-4 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-white" /> 50 Starter Credits
                </li>
                <li className="flex items-center gap-4 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-white" /> Basic Analytics Dashboard
                </li>
                <li className="flex items-center gap-4 text-sm text-zinc-600 font-medium">
                  <Lock className="w-5 h-5 text-zinc-800" /> AI DM Generation
                </li>
                <li className="flex items-center gap-4 text-sm text-zinc-600 font-medium">
                  <Lock className="w-5 h-5 text-zinc-800" /> Smart Segmentation
                </li>
                <li className="flex items-center gap-4 text-sm text-zinc-600 font-medium">
                  <Lock className="w-5 h-5 text-zinc-800" /> Memory Vault Access
                </li>
                <li className="flex items-center gap-4 text-sm text-zinc-600 font-medium">
                  <Lock className="w-5 h-5 text-zinc-800" /> Priority Support
                </li>
              </ul>
              <Link href="/login" className="block w-full py-4 rounded-2xl border border-zinc-800 text-center text-sm font-bold hover:bg-zinc-900 transition-colors">
                Start Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-[2.5rem] p-10 relative transform md:-translate-y-4 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2.5rem] pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black tracking-tight">${isAnnual ? '49' : '59'}</span>
                <span className="text-zinc-400 font-medium">/mo</span>
              </div>
              <p className="text-sm text-zinc-400 mb-10 font-medium pb-6 border-b border-zinc-800">2,600 AI Engine Credits / mo</p>
              <ul className="space-y-5 mb-10">
                <li className="flex items-center gap-4 text-sm text-white font-medium">
                  <CheckCircle2 className="w-5 h-5 text-white" /> Full Analytics Suite
                </li>
                <li className="flex items-center gap-4 text-sm text-white font-medium">
                  <CheckCircle2 className="w-5 h-5 text-white" /> AI DM Generation Engine
                </li>
                <li className="flex items-center gap-4 text-sm text-white font-medium">
                  <CheckCircle2 className="w-5 h-5 text-white" /> Smart Fan Segmentation
                </li>
                <li className="flex items-center gap-4 text-sm text-white font-medium">
                  <CheckCircle2 className="w-5 h-5 text-white" /> Memory Vault Access
                </li>
                <li className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
                  <Lock className="w-5 h-5 text-zinc-700" /> Priority Support
                </li>
              </ul>
              <Link href="/login" className="block w-full py-4 rounded-2xl bg-white text-black text-center text-sm font-bold hover:bg-zinc-200 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Upgrade to Pro
              </Link>
            </div>

            {/* Agency Tier */}
            <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-[2.5rem] p-10 relative overflow-hidden">
              <h3 className="text-xl font-bold text-zinc-400 mb-2">Agency</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black tracking-tight">${isAnnual ? '149' : '199'}</span>
                <span className="text-zinc-500 font-medium">/mo</span>
              </div>
              <p className="text-sm text-zinc-500 mb-10 font-medium pb-6 border-b border-zinc-800/50">10,000 AI Engine Credits / mo</p>
              <ul className="space-y-5 mb-10">
                <li className="flex items-center gap-4 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-white" /> Everything in Pro
                </li>
                <li className="flex items-center gap-4 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-white" /> Multi-Account Support
                </li>
                <li className="flex items-center gap-4 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-white" /> Custom AI Training
                </li>
                <li className="flex items-center gap-4 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-white" /> API Access
                </li>
                <li className="flex items-center gap-4 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-white" /> 24/7 Priority Support
                </li>
              </ul>
              <Link href="/login" className="block w-full py-4 rounded-2xl border border-zinc-800 text-center text-sm font-bold hover:bg-zinc-900 transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Modern Contact Portal */}
        <section id="contact" className="py-32 px-6 border-t border-white/5 bg-zinc-950/30">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Let's talk scale.</h2>
            <p className="text-zinc-400 mb-12 text-lg">Questions about Enterprise or Agency implementation? Send us a message.</p>
            
            <form className="space-y-6 text-left" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
              const statusEl = document.getElementById('contact-status');
              
              submitBtn.disabled = true;
              submitBtn.textContent = 'Sending...';
              if (statusEl) { statusEl.textContent = ''; statusEl.className = ''; }

              try {
                const res = await fetch('/api/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    message: formData.get('message'),
                  }),
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  if (statusEl) {
                    statusEl.textContent = 'Message Sent! We will get back to you shortly.';
                    statusEl.className = 'text-sm text-emerald-400 font-semibold mt-4 text-center';
                  }
                  form.reset();
                } else {
                  if (statusEl) {
                    statusEl.textContent = data.error || 'Something went wrong. Please try again.';
                    statusEl.className = 'text-sm text-red-400 font-semibold mt-4 text-center';
                  }
                }
              } catch (err) {
                if (statusEl) {
                  statusEl.textContent = 'Network error. Please check your connection.';
                  statusEl.className = 'text-sm text-red-400 font-semibold mt-4 text-center';
                }
              } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg> Send Message';
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Name</label>
                  <input name="name" type="text" required className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white transition-colors" placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Email</label>
                  <input name="email" type="email" required className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white transition-colors" placeholder="jane@agency.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Message</label>
                <textarea name="message" rows={5} required minLength={10} className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white transition-colors resize-none" placeholder="How can we help you scale?"></textarea>
              </div>
              <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-transform active:scale-95 flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" /> Send Message
              </button>
              <p id="contact-status"></p>
            </form>
          </div>
        </section>
      </main>

      {/* 6. High-Conversion Footer */}
      <footer className="border-t border-white/5 pt-20 pb-10 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xl">
              Ω
            </div>
            <span className="font-bold tracking-tight text-xl">DNA Growth</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign Up</Link>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 hover:border-zinc-700 transition-all group">
              <svg width="24" height="24" viewBox="0 0 24 24" className="text-zinc-400 group-hover:text-white transition-colors" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 hover:border-zinc-700 transition-all group">
              <Instagram className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>
        <div className="text-center text-sm font-medium text-zinc-600">
          &copy; {new Date().getFullYear()} DNA Growth. All rights reserved. Built for Elite Creators.
        </div>
      </footer>
    </div>
  );
}