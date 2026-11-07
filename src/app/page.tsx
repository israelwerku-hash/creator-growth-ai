"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, CheckCircle2, MessageSquare, PieChart, BrainCircuit, Mail, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Footer } from "@/components/Footer";

const TESTIMONIALS = [
  {
    quote:
      "Managing chatter handoffs across timezones used to bleed thousands in lost VIP context every weekend. With Ataraxia's Memory Vault, our chatters know every whale's preferences instantly. Our VIP retention jumped 28% in the first 30 days.",
    author: "Sarah Hayes",
    role: "Founder & Head of Operations",
    agency: "Veloce Talent Agency (14 Creators)",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    stars: 5,
  },
  {
    quote:
      "Before Ataraxia, our shift notes were scattered across Slack channels and Notion docs. Now the Memory Vault logs VIP spend habits, tone notes, and open tips automatically. It paid for itself within 48 hours of onboarding.",
    author: "Marcus Vance",
    role: "Managing Partner",
    agency: "Apex Creator Management (8 Creators)",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
    stars: 5,
  },
  {
    quote:
      "Clean, fast, and engineered specifically for high-volume agencies. We eliminated chatter handoff confusion completely, and our top-spending fans are renewing without any dropped conversations.",
    author: "Elena Rostova",
    role: "Operations Lead",
    agency: "Illume Talent Group (18 Creators)",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    stars: 5,
  },
];

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
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

              {/* Right Column — Memory Vault (floating raw, zero box wrapper) */}
              <div className="relative flex items-center justify-center lg:justify-end">
                <div className="relative w-full max-w-md">
                  {/* Terminal header */}
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-200/50">
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
                    <div className="py-2.5 border-b border-neutral-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold font-sans">VIP Context Log</span>
                        <span className="text-[10px] font-mono text-emerald-600 font-medium">2m ago</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
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
                          <span className="text-neutral-600">Prefers voice notes. Birthday May 12. Renewing sub — offer custom bundle.</span>
                        </div>
                      </div>
                    </div>

                    {/* Shift Handoff Log */}
                    <div className="py-2.5 border-b border-neutral-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold font-sans">Shift Handoff</span>
                        <span className="text-[10px] font-mono text-amber-600 font-medium">pending</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
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
                          <span className="text-neutral-600">3 active convos, 1 pending custom req (&#36;180 tip potential)</span>
                        </div>
                      </div>
                    </div>

                    {/* Retention Metric Strip */}
                    <div className="flex items-center justify-between pt-3">
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

        {/* Testimonial — Dribbble Editorial Layout */}
        <section className="w-full bg-[#FAF9F6] py-20 sm:py-28 border-t border-b border-neutral-200/50">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Side: Avatar Image Frame */}
              <div className="lg:col-span-5 flex justify-center lg:justify-start">
                <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-neutral-950/10 border border-neutral-200/80 bg-neutral-100">
                  <img
                    src={TESTIMONIALS[testimonialIndex].avatar}
                    alt={TESTIMONIALS[testimonialIndex].author}
                    className="w-full h-full object-cover object-top transition-all duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none" />
                </div>
              </div>

              {/* Right Side: Stars, Editorial Quote, Author, Arrows */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  {/* 5 glowing gold stars */}
                  <div className="flex items-center gap-1.5 mb-8">
                    {Array.from({ length: TESTIMONIALS[testimonialIndex].stars }).map((_, i) => (
                      <span key={i} className="text-xl text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)]">
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Sharp Editorial Quote in Instrument Serif */}
                  <blockquote className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-neutral-900 leading-[1.3] mb-8">
                    &ldquo;{TESTIMONIALS[testimonialIndex].quote}&rdquo;
                  </blockquote>

                  {/* Author Meta */}
                  <div className="pt-2">
                    <p className="font-sans font-bold text-lg sm:text-xl text-neutral-900 tracking-tight">
                      {TESTIMONIALS[testimonialIndex].author}
                    </p>
                    <p className="font-sans text-sm text-neutral-500 mt-1">
                      {TESTIMONIALS[testimonialIndex].role} &middot; <span className="text-neutral-700 font-medium">{TESTIMONIALS[testimonialIndex].agency}</span>
                    </p>
                  </div>
                </div>

                {/* Minimalist circular left/right navigation arrow buttons */}
                <div className="flex items-center gap-3 mt-10 pt-6 border-t border-neutral-200/60">
                  <button
                    onClick={() => setTestimonialIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))}
                    aria-label="Previous testimonial"
                    className="w-11 h-11 rounded-full border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-200 flex items-center justify-center text-neutral-700 active:scale-95 shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setTestimonialIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1))}
                    aria-label="Next testimonial"
                    className="w-11 h-11 rounded-full border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-200 flex items-center justify-center text-neutral-700 active:scale-95 shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-sans text-neutral-400 ml-2">
                    0{testimonialIndex + 1} / 0{TESTIMONIALS.length}
                  </span>
                </div>
              </div>

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
            <p className="text-neutral-900 mb-12 text-lg">Questions about Enterprise or Agency implementation? Send us a message.</p>
            
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
                  <label className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest pl-1">Name</label>
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
                  <label className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest pl-1">Email</label>
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
                <label className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest pl-1">Message</label>
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