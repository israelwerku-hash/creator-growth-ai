"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 p-8 md:p-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
          Refund <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Policy</span>
        </h1>

        <div className="prose prose-invert prose-amber max-w-none">
          <p className="text-zinc-400 leading-relaxed text-lg mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">1. 14-Day Money-Back Guarantee</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              We stand behind the quality of Creator Growth AI. If you are not completely satisfied with our service, we offer a full refund within the first 14 days of your initial subscription purchase. No questions asked.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility for Refunds</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              To be eligible for a refund under our 14-day guarantee, you must request the refund within exactly 14 calendar days from the date of your first payment. This policy applies only to new customers and initial subscription purchases. Renewal payments and subsequent charges are generally non-refundable unless required by law.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">3. How to Request a Refund</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              To request a refund, please contact our support team at <a href="mailto:support@creatorgrowth.ai" className="text-amber-500 hover:text-amber-400">support@creatorgrowth.ai</a> using the email address associated with your account. Please include "Refund Request" in the subject line to ensure prompt processing.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">4. Processing Time</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Once approved, refunds are processed immediately on our end. However, it may take 5-10 business days for the funds to appear on your bank or credit card statement, depending on your financial institution.
            </p>
          </section>
          
          <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 mt-12">
            <p className="text-amber-400/80 text-sm text-center">
              This is a standard SaaS refund policy. Please consult with legal counsel to ensure it meets the requirements of your jurisdiction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
