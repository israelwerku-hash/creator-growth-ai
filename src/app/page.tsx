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
          <Link
            href="/login"
            className="bg-[#0F2942] text-white hover:bg-[#153554] transition-colors rounded-lg px-4 py-2 text-sm font-medium font-sans"
          >
            Sign In
          </Link>
      </nav>

      <main>
        {/* 2. Editorial Hero Section — Light Mode Split Layout */}
        <section className="relative w-full overflow-hidden bg-[#FAF9F6]">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center pt-32 sm:pt-40">

            {/* Left Column — Copy & CTA */}
            <div className="flex flex-col items-start max-w-xl px-6 sm:px-8 lg:pl-12 xl:pl-20 pb-20 sm:pb-28 lg:pb-0">
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

            {/* Right Column — Hero Portrait flush to right edge */}
            <div className="relative w-full h-[520px] lg:h-[580px] overflow-hidden pr-0">
              <img
                src="/hero-portrait.jpg"
                alt="Hero Portrait"
                className="w-full h-full object-cover object-right-top"
                loading="eager"
              />
            </div>

          </div>
        </section>

        {/* Testimonials — 3-Column Bento Grid */}
        <section className="w-full bg-[#FAF9F6] pb-24 sm:pb-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-sans font-semibold mb-10">What operators are saying</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-base ${i < t.stars ? 'text-amber-400' : 'text-neutral-300'}`}>
                        {i < t.stars ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <p className="text-base sm:text-lg leading-relaxed text-neutral-900 font-serif italic mb-8">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 font-sans">{t.name}</p>
                    <p className="text-xs text-neutral-400 font-sans mt-0.5">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Feature Showcase */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-neutral-900">Architected for dominance.</h2>
            <p className="text-neutral-900 text-lg">Every tool you need to maximize lifetime value.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white border border-neutral-200/80 p-8 rounded-2xl shadow-sm hover:border-neutral-300 transition-all">
              <div className="w-12 h-12 bg-neutral-100 border border-neutral-200/80 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-[#0F2942]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-900 font-sans">AI DM Engine</h3>
              <p className="text-neutral-900 leading-relaxed text-sm font-sans">
                Autonomous high-conversion chat sequencing. Generate perfectly toned payload hooks and PPV scripts instantly.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white border border-neutral-200/80 p-8 rounded-2xl shadow-sm hover:border-neutral-300 transition-all">
              <div className="w-12 h-12 bg-neutral-100 border border-neutral-200/80 rounded-xl flex items-center justify-center mb-6">
                <PieChart className="w-6 h-6 text-[#0F2942]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-900 font-sans">Smart Segmentation</h3>
              <p className="text-neutral-900 leading-relaxed text-sm font-sans">
                Identify whales instantly. Predictive analytics categorize your fans by spend habits, churn risk, and conversion opportunity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-neutral-200/80 p-8 rounded-2xl shadow-sm hover:border-neutral-300 transition-all">
              <div className="w-12 h-12 bg-neutral-100 border border-neutral-200/80 rounded-xl flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6 text-[#0F2942]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-900 font-sans">Memory Vault</h3>
              <p className="text-neutral-900 leading-relaxed text-sm font-sans">
                Never forget a detail. Track interactions, store custom traits, and let AI build rich sub-context for every single fan.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Luxury Pricing Structure */}
        <section id="pricing" className="py-32 px-6 max-w-7xl mx-auto bg-[#FAF9F6]">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-neutral-900 font-sans">Invest in your infrastructure.</h2>
            
            <div className="inline-flex items-center bg-neutral-200/80 border border-neutral-300/80 rounded-full p-1.5 font-sans">
              <button 
                onClick={() => setIsAnnual(false)} 
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${!isAnnual ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsAnnual(true)} 
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isAnnual ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                Annual <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isAnnual ? 'bg-[#0F2942] text-white' : 'bg-neutral-300 text-neutral-700'}`}>SAVE 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Starter Tier */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-neutral-900 mb-2 font-sans">Starter</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black tracking-tight text-neutral-900 font-sans">Free</span>
              </div>
              <ul className="space-y-4 mb-8 font-sans">
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#0F2942] shrink-0" /> 50 Starter Credits
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#0F2942] shrink-0" /> Basic Analytics Dashboard
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-400 font-medium">
                  <Lock className="w-5 h-5 text-neutral-300 shrink-0" /> AI DM Generation
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-400 font-medium">
                  <Lock className="w-5 h-5 text-neutral-300 shrink-0" /> Smart Segmentation
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-400 font-medium">
                  <Lock className="w-5 h-5 text-neutral-300 shrink-0" /> Memory Vault Access
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-400 font-medium">
                  <Lock className="w-5 h-5 text-neutral-300 shrink-0" /> Priority Support
                </li>
              </ul>
              <Link href="/login" className="block w-full py-4 rounded-xl border border-neutral-300 text-neutral-900 text-center text-sm font-bold hover:bg-neutral-50 transition-colors font-sans">
                Start Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-white border-2 border-[#0F2942] rounded-2xl p-8 relative transform md:-translate-y-4 shadow-md">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0F2942] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm font-sans tracking-wide">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2 font-sans">Pro</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black tracking-tight text-neutral-900 font-sans">${isAnnual ? '49' : '59'}</span>
                <span className="text-neutral-600 font-medium font-sans">/mo</span>
              </div>
              <p className="text-sm text-neutral-600 mb-8 font-medium pb-6 border-b border-neutral-200 font-sans">2,600 AI Engine Credits / mo</p>
              <ul className="space-y-4 mb-8 font-sans">
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#0F2942] shrink-0" /> Full Analytics Suite
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#0F2942] shrink-0" /> AI DM Generation Engine
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#0F2942] shrink-0" /> Smart Fan Segmentation
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#0F2942] shrink-0" /> Memory Vault Access
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-400 font-medium">
                  <Lock className="w-5 h-5 text-neutral-300 shrink-0" /> Priority Support
                </li>
              </ul>
              <Link href="/login" className="block w-full py-4 rounded-xl bg-[#0F2942] text-white text-center text-sm font-bold hover:bg-[#153554] transition-colors shadow-sm font-sans">
                Upgrade to Pro
              </Link>
            </div>

            {/* Agency Tier */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-neutral-900 mb-2 font-sans">Agency</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black tracking-tight text-neutral-900 font-sans">${isAnnual ? '149' : '199'}</span>
                <span className="text-neutral-600 font-medium font-sans">/mo</span>
              </div>
              <p className="text-sm text-neutral-600 mb-8 font-medium pb-6 border-b border-neutral-200 font-sans">10,000 AI Engine Credits / mo</p>
              <ul className="space-y-4 mb-8 font-sans">
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#0F2942] shrink-0" /> Everything in Pro
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#0F2942] shrink-0" /> Multi-Account Support
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#0F2942] shrink-0" /> Custom AI Training
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#0F2942] shrink-0" /> API Access
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#0F2942] shrink-0" /> 24/7 Priority Support
                </li>
              </ul>
              <Link href="/login" className="block w-full py-4 rounded-xl border border-neutral-300 text-neutral-900 text-center text-sm font-bold hover:bg-neutral-50 transition-colors font-sans">
                Contact Sales
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Modern Contact Portal */}
        <section id="contact" className="py-32 px-6 border-t border-neutral-200/60 bg-[#FAF9F6]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-[#B91C1C] mb-4">Let's talk scale.</h2>
            <p className="text-neutral-600 mb-12 text-lg font-serif italic">Questions about Enterprise or Agency implementation? Send us a message.</p>
            
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
                  <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-widest pl-1 font-sans">Name</label>
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 p-4 focus:border-[#0F2942] focus:ring-1 focus:ring-[#0F2942] outline-none font-sans transition-colors" 
                    placeholder="Jane Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-widest pl-1 font-sans">Email</label>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 p-4 focus:border-[#0F2942] focus:ring-1 focus:ring-[#0F2942] outline-none font-sans transition-colors" 
                    placeholder="jane@agency.com" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-widest pl-1 font-sans">Message</label>
                <textarea 
                  name="message" 
                  rows={5} 
                  required 
                  minLength={10} 
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 p-4 focus:border-[#0F2942] focus:ring-1 focus:ring-[#0F2942] outline-none font-sans transition-colors resize-none" 
                  placeholder="How can we help you scale?"
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#0F2942] text-white hover:bg-[#153554] py-4 rounded-xl font-medium transition-colors font-sans flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
                <p className={`text-sm font-semibold mt-4 text-center ${submitStatus.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
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