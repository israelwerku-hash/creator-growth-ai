"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, CheckCircle2, MessageSquare, PieChart, BrainCircuit, Mail, Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isMounted, setIsMounted] = React.useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#FAF9F6] text-neutral-900 selection:bg-neutral-200 font-serif">
      {/* 1. Navigation Bar */}
      <nav suppressHydrationWarning className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60 px-8 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0F2942] text-white flex items-center justify-center font-bold text-xl">
              Ω
            </div>
            <span className="font-display text-lg tracking-wider uppercase text-neutral-900">Ataraxia</span>
          </div>
          <Link href="/login" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors font-sans">
            Sign In
          </Link>
      </nav>

      <main>
        {/* 2. Editorial Hero Section — Light Mode Split Layout */}
        <section className="relative w-full overflow-hidden bg-[#FAF9F6]">
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-40 sm:pt-48 pb-24 sm:pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

              {/* Left Column — Copy & CTA */}
              <div className="flex flex-col items-start max-w-xl">
                <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] uppercase tracking-wider text-[#B91C1C] leading-[0.9] mb-10">
                  Flawless Chatter Operations
                </h1>

                <p className="text-base sm:text-lg text-neutral-500 leading-relaxed mb-10 max-w-md italic mt-2">
                  Eliminate chatter handoff chaos and protect VIP revenue. The structured CRM for agency owners who refuse to lose context between shifts.
                </p>

                {/* CTA Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
                  <Link
                    href="/login"
                    className="bg-[#0F2942] hover:bg-[#153554] active:bg-[#0a1e30] text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 flex items-center gap-2.5 text-base font-sans shadow-lg shadow-[#0F2942]/15"
                  >
                    Get Early Beta <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a
                    href="#features"
                    className="text-sm font-medium text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1.5 font-sans"
                  >
                    Watch 10s Demo <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Trust line */}
                <p className="text-xs text-neutral-400 font-sans font-medium tracking-wide">
                  Built for high-volume agency ops&nbsp;&nbsp;·&nbsp;&nbsp;100% Context Retention
                </p>
              </div>

              {/* Right Column — Memory Vault (floating, no wrapper) */}
              <div className="relative flex items-center justify-center lg:justify-end">
                <div className="relative w-full max-w-md p-6 sm:p-8">
                  {/* Terminal header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono ml-2">memory-vault</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-semibold">LIVE</span>
                  </div>

                  {/* VIP Context Entry */}
                  <div className="space-y-4">
                    <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold font-sans">VIP Context Log</span>
                        <span className="text-[10px] font-mono text-emerald-500">2m ago</span>
                      </div>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex gap-2">
                          <span className="text-neutral-400 shrink-0">fan:</span>
                          <span className="text-neutral-700">user_vip_maxR</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-neutral-400 shrink-0">ltv:</span>
                          <span className="text-neutral-900 font-semibold">&#36;4,210</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-neutral-400 shrink-0">note:</span>
                          <span className="text-neutral-500">Prefers voice notes. Birthday May 12. Renewing sub — offer custom bundle.</span>
                        </div>
                      </div>
                    </div>

                    {/* Shift Handoff Log */}
                    <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold font-sans">Shift Handoff</span>
                        <span className="text-[10px] font-mono text-amber-500">pending</span>
                      </div>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex gap-2">
                          <span className="text-neutral-400 shrink-0">from:</span>
                          <span className="text-neutral-700">Sarah K.</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-neutral-400 shrink-0">to:</span>
                          <span className="text-neutral-700">Mike T.</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-neutral-400 shrink-0">ctx:</span>
                          <span className="text-neutral-500">3 active convos, 1 pending custom req (&#36;180 tip potential)</span>
                        </div>
                      </div>
                    </div>

                    {/* Retention Metric Strip */}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <div className="text-center">
                        <p className="text-lg font-bold text-neutral-900 leading-none font-sans">98.2%</p>
                        <p className="text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5 font-sans">Retention</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-neutral-900 leading-none font-sans">342</p>
                        <p className="text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5 font-sans">VIPs Tracked</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-neutral-900 leading-none font-sans">0</p>
                        <p className="text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5 font-sans">Dropped</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Testimonials — Editorial Bento */}
        <section className="w-full bg-[#FAF9F6] pb-24 sm:pb-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-sans font-semibold mb-10">What operators are saying</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "We lost \$12K in a single month from botched handoffs. Ataraxia made that impossible. Every chatter now picks up exactly where the last one left off.",
                  name: "J. Rivera",
                  role: "Agency Owner · 8 creators",
                  stars: 5,
                },
                {
                  quote: "The Memory Vault changed everything. Our VIP renewal rate jumped 23% in the first 60 days because chatters finally had real context.",
                  name: "M. Chen",
                  role: "Operations Lead · Top 0.5% agency",
                  stars: 5,
                },
                {
                  quote: "Clean, fast, no fluff. It's the first tool I've used that actually feels built for how agencies operate — not how developers think we should.",
                  name: "S. Okonkwo",
                  role: "Managing Partner · 14 chatters",
                  stars: 4,
                },
              ].map((t) => (
                <div key={t.name} className="rounded-2xl border border-neutral-200/80 bg-white p-8 shadow-sm">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-sm ${i < t.stars ? 'text-amber-400' : 'text-neutral-200'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-base leading-relaxed text-neutral-600 italic mb-8">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 font-sans">{t.name}</p>
                    <p className="text-xs text-neutral-400 font-sans">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
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
              
              if (!contactForm.name || !contactForm.email || !contactForm.message) {
                setSubmitStatus({ type: 'error', text: 'Please fill in all mandatory fields.' });
                return;
              }

              setIsSubmitting(true);
              setSubmitStatus(null);

              try {
                const res = await fetch('/api/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(contactForm),
                });
                const data = await res.json();
                
                if (res.ok && data.success) {
                  setSubmitStatus({ type: 'success', text: 'Message Sent! We will get back to you shortly.' });
                  setContactForm({ name: '', email: '', message: '' });
                } else {
                  setSubmitStatus({ type: 'error', text: data.error || 'Something went wrong. Please try again.' });
                }
              } catch (err) {
                setSubmitStatus({ type: 'error', text: 'Network error. Please check your connection.' });
              } finally {
                setIsSubmitting(false);
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Name</label>
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white transition-colors" 
                    placeholder="Jane Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Email</label>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white transition-colors" 
                    placeholder="jane@agency.com" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Message</label>
                <textarea 
                  name="message" 
                  rows={5} 
                  required 
                  minLength={10} 
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full bg-black/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white transition-colors resize-none" 
                  placeholder="How can we help you scale?"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" /> Send Message
                  </>
                )}
              </button>
              
              {submitStatus && (
                <p className={`text-sm font-semibold mt-4 text-center ${submitStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {submitStatus.text}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      {/* 6. High-Conversion Footer */}
      <Footer />
    </div>
  );
}