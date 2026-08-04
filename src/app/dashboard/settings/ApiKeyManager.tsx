"use client";

import React, { useEffect, useState } from "react";
import { Key, Copy, RefreshCw, Check, Eye, EyeOff } from "lucide-react";

export default function ApiKeyManager() {
  const [apiKey, setApiKey] = useState<string>("Loading...");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/api-key", {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey || "");
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("API Key Fetch Error:", res.status, errData);
        setApiKey("");
        setToastMessage("Failed to load API key.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (error) {
      console.error("API Key Network Error:", error);
      setApiKey("");
      setToastMessage("Network error while loading key.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!apiKey || apiKey === "Loading..." || apiKey.startsWith("Error")) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback manual execCommand copy
      const el = document.createElement('textarea');
      el.value = apiKey;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("Are you sure you want to regenerate your API Key? The old key will immediately stop working in the Chrome Extension.")) {
      return;
    }
    
    setRegenerating(true);
    try {
      const res = await fetch("/api/user/api-key", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.apiKey) {
          setApiKey(data.apiKey);
          setToastMessage("Key successfully regenerated!");
          setTimeout(() => setToastMessage(null), 3000);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("API Key Regenerate Error:", res.status, errData);
        setToastMessage("Failed to regenerate API key.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (error) {
      console.error("API Key Network Error:", error);
      setToastMessage("Network error while regenerating key.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <section className="bg-surface-dark border border-neutral-800/60 transition-all duration-200 ease-out hover:border-burgundy-primary/50 hover:shadow-glow-subtle rounded-2xl p-8 shadow-xl flex flex-col items-start w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-burgundy-primary/10 rounded-xl text-burgundy-primary">
          <Key className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Extension API Key</h2>
          <p className="text-zinc-400 text-sm">Use this key in the Chrome Extension settings to link it to your account.</p>
        </div>
      </div>

      <div className="w-full flex items-center gap-3 bg-black/40 border border-neutral-800 p-4 rounded-xl">
        <input 
          type={showKey ? "text" : "password"} 
          value={apiKey} 
          readOnly 
          className="bg-transparent border-none outline-none flex-1 text-zinc-200 font-mono text-sm tracking-widest select-text"
        />
        <button
          onClick={() => setShowKey(!showKey)}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-zinc-400 hover:text-white flex items-center gap-2 text-sm font-medium"
          title={showKey ? "Hide API Key" : "Show API Key"}
        >
          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button 
          onClick={handleCopy}
          disabled={loading || regenerating}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-zinc-400 hover:text-white disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="mt-6 flex justify-end w-full items-center gap-4">
        {toastMessage && (
          <span className="text-emerald-500 text-sm font-medium animate-in fade-in slide-in-from-right-4">
            {toastMessage}
          </span>
        )}
        <button 
          onClick={handleRegenerate}
          disabled={loading || regenerating}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          {regenerating ? "Regenerating..." : "Regenerate Key"}
        </button>
      </div>
    </section>
  );
}
