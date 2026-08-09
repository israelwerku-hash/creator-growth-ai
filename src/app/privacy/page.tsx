"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 p-8 md:p-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
          Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Policy</span>
        </h1>

        <div className="prose prose-invert prose-amber max-w-none">
          <p className="text-zinc-400 leading-relaxed text-lg mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              We collect information you provide directly to us when you create an account, subscribe to our service, or communicate with us. This includes your email address, billing information, and usage data.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              We use the information we collect to provide, maintain, and improve our services, process transactions, and send you technical notices and support messages.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect the security of your personal information against unauthorized access or disclosure.
            </p>
          </section>
          
          {/* Placeholder for more terms */}
          <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 mt-12">
            <p className="text-amber-400/80 text-sm text-center">
              This is a placeholder Privacy Policy page. Please consult with legal counsel to draft an appropriate policy for your business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
