import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-sm text-zinc-500">Last Updated: August 2026</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
          <p>
            Welcome to Creator Growth AI ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy will inform you about how we look after your personal data when you visit our website and use our Chrome Extension, and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. Data Collection and Chrome Extension Disclosures</h2>
          <p>
            Our Chrome Extension operates by extracting necessary context from your active browser session solely for the purpose of generating personalized AI outreach and analytics. 
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We DO NOT collect or store your personal browsing history.</li>
            <li>Data extraction is strictly limited to the specific fan profiles and chat windows you actively choose to analyze.</li>
            <li>Your API Key is hashed and stored securely.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. Third-Party Processing (Supabase, Groq, Upstash)</h2>
          <p>
            To provide our services, we utilize industry-leading third-party processors:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Supabase:</strong> Used for secure user authentication and encrypted database storage of your Memory Vault items.</li>
            <li><strong>Groq:</strong> Used as our AI inference engine. We do not use your chat histories to train our own models, and data sent to Groq is processed strictly in accordance with their enterprise data policies.</li>
            <li><strong>Upstash (Redis & QStash):</strong> Used for secure, ephemeral rate-limiting and asynchronous background job queuing. Job data is automatically purged.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Your GDPR Rights & Right to Erasure</h2>
          <p>
            Under the GDPR, you have the right to access, rectify, or erase your personal data. We have implemented a strict cascading deletion mechanism. By deleting your account in our dashboard, all associated Fan records, Memory Vault items, generated metrics, and API keys are permanently and irreversibly purged from our databases.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Contact Us</h2>
          <p>
            For any privacy-related questions or data deletion requests, please contact us at support@creatorgrowthai.com.
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
