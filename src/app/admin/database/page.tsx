"use client";

import React, { useState } from "react";
import { Database, ArrowLeft, RefreshCw, Zap, Server } from "lucide-react";
import Link from "next/link";
import { checkDatabaseUptime, flushRedisCache } from "./actions";

export default function AdminDatabasePage() {
  const [dbStatus, setDbStatus] = useState<string>("Unknown");
  const [dbLatency, setDbLatency] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const [cacheLog, setCacheLog] = useState<string>("Ready");
  const [isFlushing, setIsFlushing] = useState(false);

  async function handleCheckDb() {
    setIsChecking(true);
    const result = await checkDatabaseUptime();
    if (result.success) {
      setDbStatus("Connected");
      setDbLatency(result.latencyMs ?? null);
    } else {
      setDbStatus("Error");
      setDbLatency(null);
    }
    setIsChecking(false);
  }

  async function handleFlushCache() {
    setIsFlushing(true);
    setCacheLog("Flushing Redis keys...");
    const result = await flushRedisCache();
    setCacheLog(result.message || result.error || "Unknown error");
    setIsFlushing(false);
  }

  return (
    <div className="min-h-screen bg-app-black text-white font-sans selection:bg-white/20 p-8">
      
      {/* Header */}
      <header className="mb-10 border-b border-neutral-800/60 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="w-10 h-10 rounded-xl bg-white/5 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-5 h-5 text-amber-400" />
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Database & Cache</h1>
            </div>
            <p className="text-zinc-500 text-sm font-medium">Manage Prisma connection pools and Upstash rate-limit keys.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        
        {/* Prisma Control */}
        <div className="bg-surface-dark border border-neutral-800/60 rounded-3xl p-8 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Server className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Prisma PostgreSQL</h2>
              <p className="text-zinc-500 text-sm">Transaction Pool Connection</p>
            </div>
          </div>
          
          <div className="bg-app-black border border-zinc-800 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-zinc-400 text-sm font-bold uppercase">Status</span>
              <span className={`text-sm font-bold ${dbStatus === 'Connected' ? 'text-emerald-400' : dbStatus === 'Error' ? 'text-red-500' : 'text-zinc-500'}`}>
                {dbStatus}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm font-bold uppercase">Latency</span>
              <span className="text-white text-sm font-bold font-mono">
                {dbLatency ? `${dbLatency}ms` : '--'}
              </span>
            </div>
          </div>

          <button 
            onClick={handleCheckDb}
            disabled={isChecking}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-zinc-800 rounded-xl text-sm font-bold text-white transition-colors"
          >
            {isChecking ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <RefreshCw className="w-4 h-4 text-amber-400" />}
            Ping Database
          </button>
        </div>

        {/* Upstash Control */}
        <div className="bg-surface-dark border border-neutral-800/60 rounded-3xl p-8 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upstash Redis</h2>
              <p className="text-zinc-500 text-sm">Edge Rate Limiter & Cache</p>
            </div>
          </div>
          
          <div className="bg-app-black border border-zinc-800 rounded-xl p-4 mb-6 min-h-[76px] flex items-center">
            <p className="text-zinc-400 text-sm font-mono break-words">{cacheLog}</p>
          </div>

          <button 
            onClick={handleFlushCache}
            disabled={isFlushing}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-bold text-red-400 transition-colors"
          >
            {isFlushing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Safe Flush Limits
          </button>
        </div>

      </div>

    </div>
  );
}
