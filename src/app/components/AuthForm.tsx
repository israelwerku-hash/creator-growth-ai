"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;

interface AuthFormProps {
  initialIsSignUp?: boolean;
}

export function AuthForm({ initialIsSignUp = false }: AuthFormProps) {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [localError, setLocalError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const emailValue = watch("email");

  const supabase = createClient();

  // 1. Unified Submission Engine hitting our synchronized backend
  const handleValidatedSubmit = async (data: AuthFormValues) => {
    setLocalError("");

    try {
      if (isSignUp) {
        // --- SIGNUP FLOW ---
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
            data: { name: data.name?.trim() || "New Creator" },
          },
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
          throw new Error("An account with this email already exists. Please sign in instead.");
        }

        // Sync with Prisma via Server Action
        const formData = new FormData();
        if (signUpData?.user?.id) {
          formData.set("id", signUpData.user.id);
        }
        formData.set("email", data.email.trim());
        formData.set("password", data.password);
        formData.set("name", data.name?.trim() || "New Creator");
        const { signupAction } = await import("@/app/actions/auth");
        await signupAction(formData);

        setVerificationSent(true);
      } else {
        // --- LOGIN FLOW ---
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email.trim(),
            password: data.password,
          }),
        });

        const resData = await res.json();

        if (!res.ok) {
          throw new Error(resData.error || "An authentication error occurred.");
        }

        if (resData.user) {
          // Sync with Prisma via Server Action in case they don't exist
          const formData = new FormData();
          formData.set("id", resData.user.id);
          formData.set("email", data.email.trim());
          formData.set("password", data.password);
          formData.set("name", resData.user.user_metadata?.name || "Creator");
          const { signupAction } = await import("@/app/actions/auth");
          await signupAction(formData);
        }

        router.push("/onboarding");
        router.refresh();
      }
    } catch (err: any) {
      setLocalError(err.message || "An authentication error occurred.");
    }
  };

  // 2. Passwordless Magic Link Action Handler
  const handleMagicLink = async () => {
    if (!emailValue) {
      setLocalError("Please enter your email address to request a login link.");
      return;
    }
    setIsMagicLinkLoading(true);
    setLocalError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailValue.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });
      if (error) throw error;
      setVerificationSent(true);
    } catch (err: any) {
      setLocalError(err.message || "Magic Link delivery failed.");
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-zinc-950 via-purple-950 to-neutral-950 p-4 font-sans selection:bg-pink-500/30">
      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:border-pink-500/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 mb-4 shadow-glow-burgundy shadow-pink-500/20 text-white font-bold text-xl">
            Ω
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {isSignUp ? "Set up your profile to start tracking metrics" : "Sign in to manage your creator operations"}
          </p>
        </div>

        {localError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-medium tracking-wide">
            ⚠️ {localError}
          </div>
        )}

        {verificationSent ? (
          <div className="text-center py-4 space-y-4">
            <p className="text-sm text-zinc-300">
              A verification signal has been sent to <span className="text-pink-400 font-medium">{emailValue}</span>. Please check your inbox to complete setup.
            </p>
            <button
              type="button"
              onClick={() => { setVerificationSent(false); setLocalError(""); }}
              className="w-full rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold py-3 hover:bg-zinc-700 transition"
            >
              Back to Security Portal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleValidatedSubmit)} className="space-y-5">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  {...register("name")}
                  className="w-full rounded-xl bg-zinc-950/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="creator@domain.com"
                {...register("email")}
                className="w-full rounded-xl bg-zinc-950/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 transition-all"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full rounded-xl bg-zinc-950/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 transition-all"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isMagicLinkLoading}
              className="w-full mt-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm tracking-wide py-4 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-glow-burgundy shadow-pink-500/10"
            >
              {isSubmitting ? "PROCESSING TELEMETRY..." : isSignUp ? "SIGN UP" : "SIGN IN"}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-800/60"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">OR</span>
              <div className="flex-grow border-t border-zinc-800/60"></div>
            </div>

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={isSubmitting || isMagicLinkLoading}
              className="w-full rounded-xl bg-zinc-950/40 border border-zinc-800/80 hover:border-purple-500/30 text-zinc-300 font-medium text-xs py-3.5 transition-all flex items-center justify-center"
            >
              {isMagicLinkLoading ? "Sending Link..." : "✨ Sign in with Magic Link"}
            </button>

            <div className="text-center mt-6 text-xs text-zinc-500">
              {isSignUp ? "Already have an account? " : "New to the matrix? "}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setLocalError(""); }}
                className="text-pink-400 font-semibold hover:underline"
              >
                {isSignUp ? "Sign in" : "Create an account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
