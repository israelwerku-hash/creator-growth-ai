import React from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare, Brain, Languages, Chrome, Users, Building2, Headphones } from "lucide-react";

export const metadata = {
  title: "About Agency Elite - AI Growth Companion for Creators",
  description: "Discover how Agency Elite helps creators and management agencies scale fan engagement with AI-powered DM generation, Memory Vault, and real-time analytics.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex justify-center p-6">
        <div className="w-full max-w-5xl rounded-2xl bg-white/5 border border-burgundy-dark/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between shadow-2xl">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(255,255,255,0.5)]">Ω</div>
            <span className="font-bold tracking-tight text-lg">Agency Elite</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 text-center mb-24">
          <div className="inline-flex items-center gap-2 bg-[#800020]/10 border border-[#800020]/20 text-sm font-semibold text-white/80 px-4 py-1.5 rounded-full mb-8">
            <Chrome className="w-4 h-4" /> AI-Powered Growth Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-[1.1]">
            The AI Growth Companion<br />
            <span className="text-zinc-500">for Elite Creators.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Agency Elite is the all-in-one AI engine that automates fan engagement, personalizes outreach at scale, and maximizes revenue for creators and management agencies.
          </p>
        </section>

        {/* What It Is - Feature Cards */}
        <section className="max-w-6xl mx-auto px-6 mb-28">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8 text-center">Core Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[2rem] p-8 hover:border-[#800020]/30 transition-colors group">
              <div className="w-12 h-12 bg-[#800020]/10 border border-[#800020]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-[#800020]" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI DM Generation Engine</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Generate hyper-personalized, tone-matched direct messages in seconds. Our dual-tier AI model system ensures every message sounds authentic, never robotic.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[2rem] p-8 hover:border-[#800020]/30 transition-colors group">
              <div className="w-12 h-12 bg-[#800020]/10 border border-[#800020]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-[#800020]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fan Memory Vault</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Store rich context about every fan -- preferences, interaction history, spending patterns. The AI retrieves this context automatically to craft deeply personal messages.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[2rem] p-8 hover:border-[#800020]/30 transition-colors group">
              <div className="w-12 h-12 bg-[#800020]/10 border border-[#800020]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Languages className="w-6 h-6 text-[#800020]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-Language Translator</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Break language barriers instantly. Translate your messages into any language while preserving tone, nuance, and your personal voice.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[2rem] p-8 hover:border-[#800020]/30 transition-colors group">
              <div className="w-12 h-12 bg-[#800020]/10 border border-[#800020]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Chrome className="w-6 h-6 text-[#800020]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Chrome Extension Companion</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Work directly inside your platform with our Chrome Side Panel. Scrape fan data, save memories, and generate AI messages without ever leaving the chat window.
              </p>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="max-w-5xl mx-auto px-6">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8 text-center">Built For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[2rem] p-8 text-center hover:border-[#800020]/30 transition-colors">
              <div className="w-14 h-14 bg-[#800020]/10 border border-[#800020]/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Users className="w-7 h-7 text-[#800020]" />
              </div>
              <h3 className="text-lg font-bold mb-3">Fan-Platform Creators</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                OnlyFans creators, Fansly models, and independent content entrepreneurs who want to scale DM revenue without burning out.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[2rem] p-8 text-center hover:border-[#800020]/30 transition-colors">
              <div className="w-14 h-14 bg-[#800020]/10 border border-[#800020]/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Building2 className="w-7 h-7 text-[#800020]" />
              </div>
              <h3 className="text-lg font-bold mb-3">Creator Management Agencies</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Agencies and chatter teams managing multiple creator accounts who need centralized AI tools and multi-account workflows.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[2rem] p-8 text-center hover:border-[#800020]/30 transition-colors">
              <div className="w-14 h-14 bg-[#800020]/10 border border-[#800020]/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Headphones className="w-7 h-7 text-[#800020]" />
              </div>
              <h3 className="text-lg font-bold mb-3">High-Volume DM Managers</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Fan relationship managers handling hundreds of daily conversations who need AI assistance to maintain authentic, personal engagement at scale.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-2xl mx-auto px-6 text-center mt-24">
          <Link href="/login" className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-2xl text-sm hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Start Growing Now <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/5 py-10 text-center text-sm text-zinc-600">
        &copy; {new Date().getFullYear()} Agency Elite. All rights reserved.
      </footer>
    </div>
  );
}
