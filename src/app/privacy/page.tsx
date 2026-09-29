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

        <div className="prose prose-invert prose-amber max-w-none space-y-8">
          <p className="text-zinc-400 leading-relaxed text-base">
            Last updated: September 29, 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
            <p className="text-zinc-300 leading-relaxed">
              We collect information necessary to provide and operate our services effectively. This includes:
            </p>
            <ul className="list-disc pl-6 text-zinc-300 space-y-2">
              <li>
                <strong className="text-white">Google OAuth Data:</strong> When you choose to authenticate using Google Sign-In, we collect your name, email address, and profile picture provided directly via Google OAuth authentication.
              </li>
              <li>
                <strong className="text-white">Account & Billing Data:</strong> Contact details, subscription tier records, transaction reference IDs, and communication history.
              </li>
              <li>
                <strong className="text-white">Usage & Telemetry:</strong> Log files, browser type, interaction timestamps, and system diagnostics to ensure optimal uptime and security.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">2. How We Use Data</h2>
            <p className="text-zinc-300 leading-relaxed">
              We process collected data exclusively for legitimate business purposes:
            </p>
            <ul className="list-disc pl-6 text-zinc-300 space-y-2">
              <li>To authenticate user sessions, verify identity, and prevent unauthorized account access.</li>
              <li>To create and manage account profiles and deliver core application functionality and growth features.</li>
              <li>To process subscription billing and credit provisioning through authorized payment processors.</li>
              <li>To communicate critical service announcements, security notices, and technical support responses.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">3. Data Sharing & Third Parties</h2>
            <p className="text-zinc-300 leading-relaxed">
              We maintain strict standards regarding your privacy:
            </p>
            <ul className="list-disc pl-6 text-zinc-300 space-y-2">
              <li>
                <strong className="text-white">No Sale of Personal Data:</strong> User data obtained via Google APIs is never sold, leased, or rented to any third party under any circumstances.
              </li>
              <li>
                <strong className="text-white">No Advertising or Tracking:</strong> Information obtained from Google OAuth is never shared with third-party advertisers, data brokers, or ad networks, and is never used for targeting advertisements or tracking across external websites.
              </li>
              <li>
                <strong className="text-white">Essential Service Providers:</strong> Data is only transmitted to trusted cloud infrastructure providers (such as secure database and authentication hosting) strictly necessary to run the application, all bound by confidentiality agreements.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">4. Google API User Data & Limited Use Policy</h2>
            <p className="text-zinc-300 leading-relaxed">
              Ataraxi AI's use and transfer to any other app of information received from Google APIs adheres strictly to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">5. Data Retention & Deletion</h2>
            <p className="text-zinc-300 leading-relaxed">
              We retain personal data only for as long as your account remains active or as required to fulfill our operational and legal obligations.
            </p>
            <ul className="list-disc pl-6 text-zinc-300 space-y-2">
              <li>
                <strong className="text-white">Requesting Account & Data Deletion:</strong> You can request immediate and permanent deletion of your profile, authentication records, and stored data at any time by contacting us at{" "}
                <a href="mailto:israelwerku@gmail.com" className="text-amber-400 hover:text-amber-300 underline">
                  israelwerku@gmail.com
                </a>{" "}
                or using the in-app account deletion tool. Upon receiving your request, all personal data is purged within 30 days.
              </li>
              <li>
                <strong className="text-white">Revoking Google Permissions:</strong> You can revoke Ataraxi AI's access to your Google account at any time via your{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
                >
                  Google Security Permissions Settings
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">6. Security Measures</h2>
            <p className="text-zinc-300 leading-relaxed">
              We employ industry-standard encryption protocols (TLS/HTTPS in transit and AES-256 at rest), tokenized authentication with httpOnly security cookies, and continuous monitoring to guard against unauthorized access, modification, or exposure.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-zinc-800">
            <h2 className="text-xl font-bold text-white">7. Contact Information</h2>
            <p className="text-zinc-300 leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact our privacy compliance team at{" "}
              <a href="mailto:israelwerku@gmail.com" className="text-amber-400 hover:text-amber-300 underline">
                israelwerku@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
