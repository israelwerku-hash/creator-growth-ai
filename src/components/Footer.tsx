import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0B1A2B] border-t border-[#1a2d44] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold text-xl">
                Ω
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Ataraxia</h3>
            </div>
            <p className="text-[#8a9bb5] text-sm max-w-sm leading-relaxed">
              The structured CRM for agency operators. Eliminate chatter handoff chaos, protect VIP revenue, and scale operations with AI-powered context retention.
            </p>
            <p className="text-[#5a6a80] text-xs mt-4">
              Our order process is conducted by our online reseller Whop.com. Whop.com is the Merchant of Record for all our orders. Whop provides all customer service inquiries and returns.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-[#8a9bb5]">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-[#8a9bb5]">
              <li>
                <a href="mailto:israelwerku@gmail.com" className="hover:text-white transition-colors">Contact Us</a>
              </li>
              <li>
                <a href="mailto:israelwerku@gmail.com" className="hover:text-white transition-colors">israelwerku@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-[#1a2d44] pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#5a6a80]">
          <p>© {new Date().getFullYear()} Ataraxia. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Not affiliated with OnlyFans or Fenix International Limited.</p>
        </div>
      </div>
    </footer>
  );
}
