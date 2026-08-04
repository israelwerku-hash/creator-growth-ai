"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getLoginRedirectAction } from "@/app/actions/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleAuth = async () => {
    console.log("[Auth] Google OAuth button clicked");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      console.log("[Auth] Google OAuth redirect initiated");
    } catch (err: any) {
      console.error("[Auth] Google OAuth error:", err);
      setError(err.message || "Failed to authenticate with Google.");
    }
  };

  const handleEmailAuth = async (data: LoginFormValues) => {
    console.log("[Auth] Form submitted", { email: data.email, isSignUp });

    setError(null);
    setSuccess(null);

    if (isSignUp) {
      // ── SIGN UP PATH (via server route for auto-confirm) ──
      console.log("[Auth] Attempting signUp via API route...");
      try {
        const signupRes = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });

        const signupResult = await signupRes.json();
        console.log("[Auth] signUp API response:", { status: signupRes.status, ok: signupResult.ok, error: signupResult.error });

        if (!signupRes.ok || signupResult.error) {
          const errMsg = typeof signupResult.error === 'string'
            ? signupResult.error
            : "Sign up failed. Please try again.";

          if (errMsg.toLowerCase().includes("already registered") || signupRes.status === 409) {
            setError("This email is already registered. Please sign in instead.");
            setIsSignUp(false);
          } else {
            setError(errMsg);
          }
          return;
        }

        // Account created and auto-confirmed. Now sign them in immediately.
        console.log("[Auth] Account created. Signing in...");
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          console.error("[Auth] Post-signup signIn error:", signInError.message);
          setError("Account created but auto-login failed. Please sign in manually.");
          setIsSignUp(false);
          return;
        }

        console.log("[Auth] Post-signup session obtained. Routing to onboarding...");
        router.refresh();
        router.push("/onboarding");
        return;
      } catch (fetchErr: any) {
        console.error("[Auth] signUp fetch error:", fetchErr);
        setError(fetchErr.message || "Network error during sign up. Please check your connection.");
        return;
      }

    } else {
      // ── SIGN IN PATH ──
      console.log("[Auth] Attempting signIn via secure API...");
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const result = await res.json();
      
      console.log("[Auth] signIn response:", { success: result.success, error: result.error });

      if (!res.ok || result.error) {
        console.warn("[Auth] signIn notice:", result.error);
        setError(result.error || 'Invalid credentials');
        return;
      }

      if (res.ok && result.success) {
        console.log("[Auth] Session obtained. Routing to dashboard (server layout will handle state)...");
        router.push("/dashboard");
        router.refresh();
        return; // Keep loading state while navigating
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050505] text-white font-sans selection:bg-white/20 px-4 py-12">
      
      {/* 1. The Canvas: Abstract blurred mesh background */}
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 2. The Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md rounded-[2.5rem] bg-black/40 backdrop-blur-xl border border-burgundy-dark/40 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center font-bold text-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)] mb-4">
            Ω
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{isSignUp ? "Join the Elite Tier" : "Welcome Back"}</h1>
          <p className="text-zinc-400 text-sm mt-1">{isSignUp ? "Create your Agency Elite workspace" : "Log in to your Agency Elite workspace"}</p>
        </div>

        {/* 3. Social Authentication */}
        <div className="flex flex-col gap-3 mb-6">
          <button 
            type="button"
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-all hover:scale-[1.01] active:scale-95 text-sm font-semibold"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.549L20.0303 3.125C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25528 2.69 1.28027 6.609L5.27028 9.704C6.21528 6.86 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
              <path d="M5.26498 14.294C5.02498 13.569 4.87998 12.799 4.87998 11.999C4.87998 11.199 5.01998 10.429 5.25998 9.70398L1.27498 6.60898C0.459983 8.22898 0 10.059 0 11.999C0 13.939 0.459983 15.769 1.27998 17.389L5.26498 14.294Z" fill="#FBBC05" />
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21538 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-zinc-800" />
          <span className="shrink-0 px-3 text-xs text-zinc-500 uppercase tracking-widest font-medium">
            or continue with email
          </span>
          <div className="flex-grow border-t border-zinc-800" />
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-900 flex items-start gap-2.5 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-900 flex items-start gap-2.5 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        {/* 4. Native Inputs & Micro-Interactions */}
        <form onSubmit={handleSubmit(handleEmailAuth)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="email"
                {...register("email")}
                placeholder="agency@example.com"
                className="w-full bg-white/5 border border-burgundy-dark/40 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1 mr-1">
              <label className="text-xs font-semibold text-zinc-300">Password</label>
              <Link href="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-burgundy-dark/40 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs ml-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mt-2 rounded-xl bg-white text-black text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Processing..." : (isSignUp ? "Create Premium Account" : "Sign In to Dashboard")}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* 5. Secondary Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-500">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }} className="text-white font-semibold hover:underline underline-offset-4 transition-colors">
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}