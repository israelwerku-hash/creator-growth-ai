import React from "react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-sm text-zinc-500">Last Updated: August 2026</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Creator Growth AI, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our platform or Chrome extension.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. Subscription Terms & AI Credits</h2>
          <p>
            Creator Growth AI operates on a subscription and credit-based model.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>AI credits are consumed for actions such as DM Generation, Memory Vault Extraction, and Segmentation.</li>
            <li>Credits refresh based on your active billing cycle (monthly or yearly). Unused credits do not roll over unless explicitly stated in your tier.</li>
            <li>We reserve the right to modify the credit cost of specific AI features with 30 days prior notice.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. AI Output Disclaimer</h2>
          <p>
            The generated direct messages, segmentations, and translations are produced by artificial intelligence. While we strive for high quality, Creator Growth AI does not guarantee the accuracy, appropriateness, or conversion rate of the generated text. You are solely responsible for reviewing and approving all AI-generated content before sending it to your audience.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Platform Non-Affiliation</h2>
          <p>
            Creator Growth AI is an independent analytics and CRM tool. We are <strong>not affiliated, associated, authorized, endorsed by, or in any way officially connected</strong> with OnlyFans, Fenix International Limited, or any of its subsidiaries or its affiliates. The official OnlyFans website can be found at onlyfans.com.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms of Service.
          </p>
        </section>

        <div className="pt-8 border-t border-zinc-800">
          <Link href="/" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
