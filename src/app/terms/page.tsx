"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 p-8 md:p-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
          Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Service</span>
        </h1>

        <div className="prose prose-invert prose-amber max-w-none">
          <p className="text-zinc-400 leading-relaxed text-lg mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              By accessing or using Creator Growth AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Creator Growth AI provides artificial intelligence tools designed to assist creators with content generation, segmentation, and audience management.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">3. User Conduct</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              You are responsible for all activity that occurs under your account. You agree not to use the service for any illegal or unauthorized purpose.
            </p>
          </section>
          
          {/* Placeholder for more terms */}
          <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 mt-12">
            <p className="text-amber-400/80 text-sm text-center">
              This is a placeholder Terms of Service page. Please consult with legal counsel to draft appropriate terms for your business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
