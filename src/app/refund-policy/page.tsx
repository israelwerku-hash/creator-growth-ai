import React from "react";
import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white mb-4">Refund & Cancellation Policy</h1>
        <p className="text-sm text-zinc-500">Last Updated: August 2026</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Subscription Cancellation</h2>
          <p>
            You may cancel your subscription at any time through your billing dashboard. Upon cancellation, you will retain access to your PRO or AGENCY tier features and your remaining AI credits until the end of your current billing cycle. 
          </p>
          <p>
            After the billing cycle concludes, your account will be downgraded to the FREE tier, and your premium API access will be revoked.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. Refund Eligibility</h2>
          <p>
            Due to the direct computational costs associated with generating AI outputs (Groq inference) and provisioning secure vector databases, we generally <strong>do not offer refunds</strong> for utilized credits or partial subscription months.
          </p>
          <p>
            However, we may offer a full or partial refund within 14 days of your initial purchase if:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You have not consumed more than 10% of your allocated AI credits.</li>
            <li>You experienced severe technical issues preventing the Chrome Extension from functioning, and our support team was unable to resolve it.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. Paddle Merchant of Record</h2>
          <p>
            Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles processed returns. For billing-specific inquiries, you may contact Paddle directly, though we recommend reaching out to our team first for software-related issues.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Requesting a Refund</h2>
          <p>
            To request a refund under the eligible conditions, please email support@creatorgrowthai.com with your account email and a brief explanation of the issue.
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
