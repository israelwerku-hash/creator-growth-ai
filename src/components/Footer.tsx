import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#09090b] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight">Creator Growth AI</h3>
            <p className="text-zinc-400 text-sm max-w-sm leading-relaxed">
              The elite AI-powered CRM and outreach platform for top 1% creators. Understand your fans, automate DMs, and scale revenue instantly.
            </p>
            <p className="text-zinc-500 text-xs mt-4">
              Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and returns.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
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
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <a href="mailto:support@creatorgrowthai.com" className="hover:text-white transition-colors">Contact Us</a>
              </li>
              <li>
                <a href="mailto:support@creatorgrowthai.com" className="hover:text-white transition-colors">support@creatorgrowthai.com</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Creator Growth AI. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Not affiliated with OnlyFans or Fenix International Limited.</p>
        </div>
      </div>
    </footer>
  );
}
