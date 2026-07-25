"use client";

import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface AuthViewProps {
  authMode: "login" | "signup";
  setAuthMode: (mode: "login" | "signup") => void;
  authName: string;
  setAuthName: (v: string) => void;
  authEmail: string;
  setAuthEmail: (v: string) => void;
  authPassword: string;
  setAuthPassword: (v: string) => void;
  authError: string;
  handleAuthSubmit: (e: React.FormEvent) => void;
  setCurrentView: (view: "landing" | "auth" | "dashboard") => void;
}

// ── Password strength calculator ──
function getPasswordStrength(pw: string): { label: string; color: string; percent: number } {
  if (pw.length === 0) return { label: "", color: "transparent", percent: 0 };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { label: "Weak", color: "#f43f5e", percent: 20 };
  if (score === 2) return { label: "Fair", color: "#fb7185", percent: 40 };
  if (score === 3) return { label: "Good", color: "#a855f7", percent: 60 };
  if (score === 4) return { label: "Strong", color: "#22c55e", percent: 80 };
  return { label: "Excellent", color: "#10b981", percent: 100 };
}

export default function AuthView({
  authMode,
  setAuthMode,
  authName,
  setAuthName,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authError,
  handleAuthSubmit,
  setCurrentView,
}: AuthViewProps) {
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const supabase = createClient();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const leftPanelRef = useRef<HTMLDivElement | null>(null);

  // 3D Right Card Tilt State
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease",
    boxShadow: "0 25px 70px rgba(10, 3, 20, 0.5), 0 0 40px rgba(244, 63, 94, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
  });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 25; // max tilt 8 degrees
    const rotateY = (x - centerX) / 25;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.025, 1.025, 1.025)`,
      transition: "transform 0.1s ease, box-shadow 0.1s ease",
      boxShadow: `${-rotateY * 3}px ${rotateX * 3}px 60px rgba(244, 63, 94, 0.18), 0 35px 85px rgba(10, 3, 20, 0.65), inset 0 1px 0 rgba(255,255,255,0.08)`,
    });
  };

  const handleCardMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.6s ease",
      boxShadow: "0 25px 70px rgba(10, 3, 20, 0.5), 0 0 40px rgba(244, 63, 94, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
    });
  };

  // 3D Left Cube Rotation State
  const [cubeRotation, setCubeRotation] = useState({ x: -20, y: 35 });

  const handleLeftMouseMove = (e: React.MouseEvent) => {
    const panel = leftPanelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Smooth responsive rotation: max +/- 35 degrees relative to base offsets
    const rotX = -(y / (rect.height / 2)) * 30 - 20; 
    const rotY = (x / (rect.width / 2)) * 30 + 35;   
    setCubeRotation({ x: rotX, y: rotY });
  };

  const handleLeftMouseLeave = () => {
    setCubeRotation({ x: -20, y: 35 });
  };

  const passwordStrength = getPasswordStrength(authPassword);
  const displayError = localError || authError;

  // Background Interactive Morphing Orbs Particle System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    interface Orb {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      hue: number;
      alpha: number;
      pulse: number;
      pulseSpeed: number;
    }

    const orbs: Orb[] = [];

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      targetMouseX = canvas.width / 2;
      targetMouseY = canvas.height / 2;
      mouseX = targetMouseX;
      mouseY = targetMouseY;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Generate ambient glowing orbs
    const orbColors = [320, 340, 270, 290, 310]; // Warm rose-plum-coral neon palette
    for (let i = 0; i < 5; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 200 + 130,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        hue: orbColors[i % orbColors.length],
        alpha: Math.random() * 0.04 + 0.02,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.005 + 0.002,
      });
    }

    // Small floating star particles
    const stars: Array<{
      x: number; y: number; r: number;
      vx: number; vy: number; a: number;
      pulse: number; ps: number;
    }> = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.4,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        a: Math.random() * 0.45 + 0.15,
        pulse: Math.random() * Math.PI * 2,
        ps: Math.random() * 0.01 + 0.004,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      orbs.forEach((o, index) => {
        o.x += o.vx;
        o.y += o.vy;
        o.pulse += o.pulseSpeed;

        if (o.x - o.radius < -250 || o.x + o.radius > canvas.width + 250) o.vx *= -1;
        if (o.y - o.radius < -250 || o.y + o.radius > canvas.height + 250) o.vy *= -1;

        const shiftX = (mouseX - canvas.width / 2) * (0.012 + index * 0.006);
        const shiftY = (mouseY - canvas.height / 2) * (0.012 + index * 0.006);

        const currentAlpha = o.alpha * (0.6 + 0.4 * Math.sin(o.pulse));
        const gradient = ctx.createRadialGradient(
          o.x + shiftX, 
          o.y + shiftY, 
          0, 
          o.x + shiftX, 
          o.y + shiftY, 
          o.radius
        );
        gradient.addColorStop(0, `hsla(${o.hue}, 80%, 55%, ${currentAlpha})`);
        gradient.addColorStop(0.5, `hsla(${o.hue}, 70%, 35%, ${currentAlpha * 0.3})`);
        gradient.addColorStop(1, `hsla(${o.hue}, 50%, 20%, 0)`);

        ctx.beginPath();
        ctx.arc(o.x + shiftX, o.y + shiftY, o.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      stars.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.pulse += s.ps;

        if (s.x < -5) s.x = canvas.width + 5;
        if (s.x > canvas.width + 5) s.x = -5;
        if (s.y < -5) s.y = canvas.height + 5;
        if (s.y > canvas.height + 5) s.y = -5;

        const dx = mouseX - s.x;
        const dy = mouseY - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let pullX = 0;
        let pullY = 0;
        if (dist < 180) {
          const force = (180 - dist) / 180;
          pullX = (dx / dist) * force * 3;
          pullY = (dy / dist) * force * 3;
        }

        const ca = s.a * (0.5 + 0.5 * Math.sin(s.pulse));
        
        const hue = s.pulse % 2 === 0 ? 320 : 270;
        ctx.beginPath();
        ctx.arc(s.x + pullX, s.y + pullY, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 85%, 70%, ${ca * 0.6})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Clear local errors when switching modes
  useEffect(() => {
    setLocalError("");
    setVerificationSent(false);
  }, [authMode]);

  const handleMagicLinkLogin = async () => {
    if (!authEmail) {
      setLocalError("Please enter your email address first.");
      return;
    }
    setLocalError("");
    setIsSubmitting(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: authEmail.trim(),
        options: {
          emailRedirectTo: window.location.origin + '/onboarding',
        },
      });

      if (otpError) {
        setLocalError(otpError.message);
        setIsSubmitting(false);
        return;
      }

      setVerificationSent(true);
      setIsSubmitting(false);
    } catch (err) {
      setLocalError("Unable to trigger passwordless magic link email.");
      setIsSubmitting(false);
    }
  };

  const handleValidatedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setIsSubmitting(true);

    if (authMode === "signup") {
      // ═══════════════════════════════════════════════
      // SIGN UP FLOW — Supabase Auth + Prisma Creator
      // ═══════════════════════════════════════════════
      try {
        const displayName = authName || "New Creator";

        // Step 1: Register in Supabase Auth (sends confirmation email)
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
            data: {
              name: displayName,
            },
          },
        });

        if (signUpError) {
          setLocalError(signUpError.message);
          setIsSubmitting(false);
          return;
        }

        // Guard: Supabase returns a fake user with no identities if email already exists
        if (data?.user && data.user.identities && data.user.identities.length === 0) {
          setLocalError("An account with this email already exists. Please sign in instead.");
          setIsSubmitting(false);
          return;
        }

        // Step 2: Create matching Prisma Creator record in the database
        // Build a FormData that matches what signupAction expects
        const formData = new FormData();
        if (data?.user?.id) {
          formData.set("id", data.user.id);
        }
        formData.set("email", authEmail.trim());
        formData.set("password", authPassword);
        formData.set("name", displayName);

        const { signupAction } = await import("@/app/actions/auth");
        const dbResult = await signupAction(formData);

        if (dbResult?.error) {
          // If it's a duplicate error, that's okay — the record already exists
          if (!dbResult.error.toLowerCase().includes("already exists")) {
            setLocalError(dbResult.error);
            setIsSubmitting(false);
            return;
          }
        }

        // Step 3: Show verification-sent screen (Supabase requires email confirmation)
        setVerificationSent(true);
        setAuthPassword("");
        setIsSubmitting(false);
      } catch (err: any) {
        console.error("Signup error:", err?.message || err);
        setLocalError("Unable to create account. Please check your connection and try again.");
        setIsSubmitting(false);
      }
    } else {
      // ═══════════════════════════════════════════════
      // LOGIN FLOW — Supabase Auth Session
      // ═══════════════════════════════════════════════
      try {
        let isAuthorized = false;
        let verificationRequired = false;
        let errorMessage = "Invalid credentials. Access Denied.";
        let userName: string | undefined;

        // Step 1: Authenticate against Supabase Auth
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });

        if (!signInError && data?.user) {
          if (data.user.email_confirmed_at) {
            isAuthorized = true;
            userName = data.user.user_metadata?.name;
          } else {
            verificationRequired = true;
            errorMessage = "Your email is unverified. Please check your inbox or use the Magic Link option below.";
          }
        } else if (signInError) {
          const errMsg = signInError.message.toLowerCase();
          if (errMsg.includes("confirm") || errMsg.includes("verify") || errMsg.includes("check") || errMsg.includes("unverified")) {
            verificationRequired = true;
            errorMessage = "Your email is unverified. Please check your inbox or use the Magic Link option below.";
          } else if (errMsg.includes("invalid") || errMsg.includes("credentials") || errMsg.includes("password")) {
            errorMessage = "Invalid email or password. Please try again.";
          }
        }

        // Admin override fallback
        if (!isAuthorized && !verificationRequired) {
          const { checkAdminOverrideAction } = await import("@/app/actions/auth");
          const adminCheck = await checkAdminOverrideAction(authEmail, authPassword);
          if (adminCheck.success) {
            isAuthorized = true;
          }
        }

        if (!isAuthorized) {
          setLocalError(errorMessage);
          setIsSubmitting(false);
          return;
        }

        // Step 2: Ensure Creator record exists in Prisma (auto-create if missing)
        const formData = new FormData();
        if (data?.user?.id) {
          formData.set("id", data.user.id);
        }
        formData.set("email", authEmail.trim());
        formData.set("password", authPassword);
        formData.set("name", userName || "Creator");

        const { signupAction } = await import("@/app/actions/auth");
        await signupAction(formData);
        // Ignore "already exists" errors — that's the expected happy path

        // Step 3: Supabase Auth already sets cookies in SSR via the client

        document.cookie = "userId=creator-verified-session-token; path=/; max-age=604800";
        setIsSubmitting(false);
        window.location.href = "/onboarding";
      } catch (err: any) {
        console.error("Login error:", err?.message || err);
        setLocalError("Authentication service error. Please try again.");
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col lg:flex-row items-center justify-center overflow-hidden px-4 py-8 lg:p-0 selection:bg-[#f43f5e]/30 selection:text-white" 
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        background: "radial-gradient(circle at 10% 20%, rgba(30, 9, 52, 0.95), transparent 45%), radial-gradient(circle at 90% 10%, rgba(93, 16, 73, 0.9), transparent 50%), radial-gradient(circle at 50% 90%, rgba(244, 63, 94, 0.4), transparent 60%), #0d0616",
      }}
    >
      {/* Drifting ambient glowing circles */}
      <div className="absolute top-[-10%] left-[-15%] w-[550px] h-[550px] rounded-full filter blur-[120px] pointer-events-none z-0 ambient-orb-1" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[600px] h-[600px] rounded-full filter blur-[130px] pointer-events-none z-0 ambient-orb-2" />

      {/* Dynamic Animated Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* 50/50 Split Screen Content Container */}
      <div className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 z-10 px-4 md:px-8">
        
        {/* LEFT COLUMN: 3D floating cube gadget */}
        <div 
          ref={leftPanelRef}
          onMouseMove={handleLeftMouseMove}
          onMouseLeave={handleLeftMouseLeave}
          className="hidden lg:flex w-full lg:w-1/2 flex-col items-center justify-center relative select-none"
        >
          {/* Floating animated base wrapper */}
          <div className="floating-wrapper relative flex items-center justify-center w-[340px] h-[340px] perspective-[1200px]">
            {/* The 3D Cube Gadget */}
            <div 
              className="cube-gadget"
              style={{
                transform: `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)`,
              }}
            >
              {/* CUBE FACES */}
              {/* Front Face: Has three neon-pink glowing dots */}
              <div className="cube-face cube-front">
                <div className="absolute inset-0 flex flex-col justify-between p-7 select-none pointer-events-none">
                  <div className="flex justify-between items-center w-full">
                    <div className="w-5 h-5 rounded-full bg-[#f43f5e] shadow-[0_0_18px_#f43f5e,0_0_6px_rgba(244,63,94,0.9)]" />
                    <div className="w-5 h-5 rounded-full bg-[#f43f5e] shadow-[0_0_18px_#f43f5e,0_0_6px_rgba(244,63,94,0.9)]" />
                  </div>
                  <div className="flex justify-center items-center w-full">
                    <div className="w-5 h-5 rounded-full bg-[#f43f5e] shadow-[0_0_18px_#f43f5e,0_0_6px_rgba(244,63,94,0.9)]" />
                  </div>
                </div>
              </div>

              {/* Back Face */}
              <div className="cube-face cube-back" />

              {/* Left Face: Has a circular dial/button */}
              <div className="cube-face cube-left">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-16 h-16 rounded-full border border-pink-500/20 shadow-[0_6px_15px_rgba(0,0,0,0.35),inset_0_2px_4px_rgba(255,255,255,0.05)] flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #1f0f2b 0%, #0d0615 100%)",
                      transform: "translateZ(8px)",
                      transformStyle: "preserve-3d"
                    }}
                  >
                    <div className="w-6 h-6 rounded-full bg-pink-500/20 border border-pink-500/35 shadow-inner" style={{ transform: "translateZ(4px)" }} />
                  </div>
                </div>
              </div>

              {/* Right Face */}
              <div className="cube-face cube-right" />

              {/* Top Face: Has slot and emerging yellow key */}
              <div className="cube-face cube-top">
                {/* Dark capsule slot */}
                <div className="absolute top-[40%] left-[15%] right-[15%] h-[20%] rounded-full bg-zinc-950 shadow-inner flex items-center justify-center overflow-visible">
                  {/* Yellow 3D Key Block emerging */}
                  <div className="yellow-key-block">
                    {/* Key Faces */}
                    <div className="key-face key-front" />
                    <div className="key-face key-back" />
                    <div className="key-face key-left" />
                    <div className="key-face key-right" />
                    <div className="key-face key-top" />
                  </div>
                </div>
              </div>

              {/* Bottom Face */}
              <div className="cube-face cube-bottom" />
            </div>
          </div>

          {/* Floater dynamic shadow */}
          <div className="absolute bottom-[-5%] w-[180px] h-[20px] rounded-full bg-black/45 filter blur-[12px] shadow-element" />
        </div>

        {/* RIGHT COLUMN: Dark premium glassmorphism card form */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <div
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="relative w-full max-w-[430px] rounded-[24px] border z-10 p-8 sm:p-10 transition-all duration-300"
            style={{
              background: "rgba(22, 11, 38, 0.45)",
              backdropFilter: "blur(40px) saturate(2)",
              WebkitBackdropFilter: "blur(40px) saturate(2)",
              borderColor: "rgba(244, 63, 94, 0.3)",
              transformStyle: "preserve-3d",
              ...tiltStyle,
            }}
          >
            {/* Header Branding (Original Ω Logo) */}
            <div className="space-y-2 text-center text-3d" style={{ transformStyle: "preserve-3d" }}>
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-500/30 text-white font-bold text-xl mb-4 relative overflow-hidden shadow-[0_0_20px_rgba(244, 63, 94, 0.15)] logo-3d"
                style={{ background: "linear-gradient(145deg, rgba(30,15,45,0.9), rgba(15,10,25,0.9))" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-indigo-500/15" />
                <span className="relative z-10 text-[20px]">Ω</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white antialiased text-title-3d">
                {authMode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-xs text-zinc-400 font-normal text-subtitle-3d">
                {authMode === "login"
                  ? "Enter your credentials to access the growth engine"
                  : "Set up your profile to start tracking metrics"}
              </p>
            </div>

            {/* Error / Warning Alert */}
            {displayError && (
              displayError.includes("unverified") ? (
                <div className="rounded-xl border border-pink-500/35 bg-pink-950/20 px-4 py-3.5 mt-6 text-xs text-pink-300 font-medium tracking-wide transition-all animate-[fadeIn_0.25s_ease] leading-relaxed shadow-[0_0_15px_rgba(244,63,94,0.15)] flex items-start gap-3 text-label-3d">
                  <span className="text-pink-400 font-bold mt-0.5">✉</span>
                  <span>{displayError}</span>
                </div>
              ) : (
                <div
                  className="rounded-xl border border-red-500/20 px-4 py-3.5 mt-6 flex items-start gap-3 animate-[fadeIn_0.25s_ease] text-label-3d"
                  style={{ background: "rgba(127,29,29,0.15)" }}
                >
                  <div className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}>
                    <span className="text-red-400 text-[11px] font-bold">!</span>
                  </div>
                  <span className="text-[12.5px] text-red-400/90 font-medium leading-relaxed">
                    Security Alert: {displayError}
                  </span>
                </div>
              )
            )}

            {/* Dynamic Card Transition Success Screen */}
            {verificationSent ? (
              <div className="space-y-6 text-center py-4 mt-6 animate-[fadeIn_0.35s_ease]" style={{ transformStyle: "preserve-3d" }}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-pink-500/30 bg-pink-950/20 text-pink-400 text-2xl animate-pulse shadow-[0_0_20px_rgba(244, 63, 94, 0.15)] logo-3d">
                  ✓
                </div>
                <div className="space-y-2 text-3d">
                  <h2 className="text-base font-bold text-white tracking-tight uppercase font-mono text-title-3d">Initialization Successful</h2>
                  <p className="text-xs text-zinc-300 font-normal leading-relaxed text-subtitle-3d">
                    Account initialized! A secure validation link has been dispatched to your email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setVerificationSent(false);
                    setLocalError("");
                  }}
                  className="w-full rounded-xl bg-zinc-950/60 hover:bg-zinc-900 border border-pink-500/20 text-pink-300 hover:text-white font-bold text-xs uppercase tracking-wider py-4 transition-all duration-300 ease-out shadow-[0_4px_15px_rgba(0,0,0,0.4)] cursor-pointer btn-magic-3d focus:outline-none"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                {/* Auth Form */}
                <form onSubmit={handleValidatedSubmit} className="space-y-5 mt-6" style={{ transformStyle: "preserve-3d" }}>
                  {authMode === "signup" && (
                    <div className="space-y-2" style={{ transformStyle: "preserve-3d" }}>
                      <label className="text-[11px] font-semibold tracking-[0.08em] text-zinc-400 uppercase block text-label-3d">
                        Display Name
                      </label>
                      <input
                        type="text"
                        disabled={verificationSent}
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-zinc-800/80 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none disabled:opacity-50 input-3d focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 focus:bg-black/60 transition-all duration-200"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2" style={{ transformStyle: "preserve-3d" }}>
                    <label className="text-[11px] font-semibold tracking-[0.08em] text-zinc-400 uppercase block text-label-3d">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      disabled={verificationSent}
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full rounded-xl border border-zinc-800/80 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none disabled:opacity-50 input-3d focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 focus:bg-black/60 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2" style={{ transformStyle: "preserve-3d" }}>
                    <label className="text-[11px] font-semibold tracking-[0.08em] text-zinc-400 uppercase block text-label-3d">
                      Password
                    </label>
                    <div className="relative" style={{ transform: "translateZ(25px)" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!verificationSent}
                        disabled={verificationSent}
                        value={authPassword}
                        onChange={(e) => { setAuthPassword(e.target.value); setLocalError(""); }}
                        placeholder="Min. 6 characters"
                        minLength={6}
                        className="w-full rounded-xl border border-zinc-800/80 bg-black/40 pl-4 pr-10 py-3 text-sm text-white placeholder-zinc-600 outline-none disabled:opacity-50 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/10 focus:bg-black/60 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer p-0 bg-transparent border-0"
                      >
                        {showPassword ? (
                          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Password Strength Bar — only in signup */}
                    {authMode === "signup" && authPassword.length > 0 && (
                      <div className="pt-1.5 space-y-1.5" style={{ transform: "translateZ(15px)" }}>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(39,39,42,0.6)" }}>
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${passwordStrength.percent}%`, background: passwordStrength.color }}
                            />
                          </div>
                          <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color: passwordStrength.color }}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        {authPassword.length > 0 && authPassword.length < 6 && (
                          <p className="text-[11px] text-[#f43f5e]/80 font-medium">
                            ⚠ Minimum 6 characters required
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider py-4 active:scale-[0.985] disabled:opacity-50 disabled:pointer-events-none mt-4 btn-submit-3d border-0 cursor-pointer focus:outline-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </span>
                    ) : authMode === "login" ? (
                      "SIGN IN"
                    ) : (
                      "SIGN UP"
                    )}
                  </button>

                  {authMode === "login" && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleMagicLinkLogin}
                      className="w-full rounded-xl border border-pink-500/20 bg-pink-950/10 hover:bg-pink-950/20 hover:border-pink-500/40 text-pink-300 font-bold text-xs uppercase tracking-wider py-4 disabled:opacity-40 disabled:pointer-events-none mt-3 btn-magic-3d cursor-pointer focus:outline-none"
                    >
                      Sign in with Magic Link
                    </button>
                  )}
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 mt-8 mb-4" style={{ transform: "translateZ(15px)" }}>
                  <div className="flex-1 h-px bg-zinc-800/40" />
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">or</span>
                  <div className="flex-1 h-px bg-zinc-800/40" />
                </div>

                {/* Toggle + Back */}
                <div className="text-center space-y-3 footer-3d" style={{ transformStyle: "preserve-3d" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === "login" ? "signup" : "login");
                      setLocalError("");
                      setVerificationSent(false);
                    }}
                    className="text-[13px] text-zinc-500 hover:text-pink-400 transition duration-200 bg-transparent border-0 cursor-pointer p-0 focus:outline-none"
                  >
                    {authMode === "login" ? (
                      <>Don&apos;t have an account? <span className="text-pink-400 font-semibold">Sign up</span></>
                    ) : (
                      <>Already have an account? <span className="text-pink-400 font-semibold">Sign in</span></>
                    )}
                  </button>
                  <button
                    onClick={() => setCurrentView("landing")}
                    className="block mx-auto text-[11px] text-zinc-600 hover:text-zinc-400 bg-transparent border-0 cursor-pointer transition-colors duration-200 p-0 focus:outline-none"
                  >
                    ← Back to landing
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* HIGH-FIDELITY CSS 3D STYLES */}
      <style>{`
        @keyframes floatOrb1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.92); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes floatOrb2 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-50px, 50px) scale(0.9); }
          66% { transform: translate(40px, -30px) scale(1.08); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .ambient-orb-1 {
          background: radial-gradient(circle, rgba(93, 16, 73, 0.55) 0%, rgba(30, 9, 52, 0) 70%);
          animation: floatOrb1 20s infinite ease-in-out;
        }
        .ambient-orb-2 {
          background: radial-gradient(circle, rgba(244, 63, 94, 0.3) 0%, rgba(13, 6, 22, 0) 70%);
          animation: floatOrb2 25s infinite ease-in-out;
        }

        /* 3D Cube Gadget base setup */
        .cube-gadget {
          position: relative;
          width: 170px;
          height: 170px;
          transform-style: preserve-3d;
          transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* Float Keyframes */
        @keyframes float {
          0% { transform: translateY(0px) rotateZ(0deg); }
          50% { transform: translateY(-18px) rotateZ(1deg); }
          100% { transform: translateY(0px) rotateZ(0deg); }
        }
        .floating-wrapper {
          animation: float 4.5s infinite ease-in-out;
        }

        /* Floater shadow keyframes */
        @keyframes shadowScale {
          0% { transform: scale(1); opacity: 0.35; filter: blur(8px); }
          50% { transform: scale(0.8); opacity: 0.18; filter: blur(12px); }
          100% { transform: scale(1); opacity: 0.35; filter: blur(8px); }
        }
        .shadow-element {
          animation: shadowScale 4.5s infinite ease-in-out;
        }

        /* Cube Face Styles - Dark premium glassmorphism theme */
        .cube-face {
          position: absolute;
          width: 170px;
          height: 170px;
          background: linear-gradient(135deg, rgba(30,15,45,0.96) 0%, rgba(15,10,25,0.96) 100%);
          border: 1.5px solid rgba(244, 63, 94, 0.3);
          border-radius: 38px;
          box-shadow: inset 0 2px 5px rgba(255,255,255,0.05), inset -2px -2px 6px rgba(0,0,0,0.4), 0 15px 35px rgba(0,0,0,0.5);
          transform-style: preserve-3d;
        }

        /* 3D transforms for individual faces */
        .cube-front  { transform: rotateY(0deg) translateZ(85px); }
        .cube-back   { transform: rotateY(180deg) translateZ(85px); }
        .cube-left   { transform: rotateY(-90deg) translateZ(85px); }
        .cube-right  { transform: rotateY(90deg) translateZ(85px); }
        .cube-top    { transform: rotateX(90deg) translateZ(85px); }
        .cube-bottom { transform: rotateX(-90deg) translateZ(85px); }

        /* Yellow 3D Key block rising from top slot */
        .yellow-key-block {
          position: absolute;
          width: 44px;
          height: 22px;
          transform: translate3d(0, 0, 16px);
          transform-style: preserve-3d;
          animation: keyBob 4.5s infinite ease-in-out;
        }

        @keyframes keyBob {
          0% { transform: translate3d(0, 0, 14px); }
          50% { transform: translate3d(0, 0, 22px); }
          100% { transform: translate3d(0, 0, 14px); }
        }

        /* Key Faces */
        .key-face {
          position: absolute;
          background: linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.04);
        }

        .key-front { width: 44px; height: 30px; transform: rotateX(0deg) translateZ(11px); }
        .key-back  { width: 44px; height: 30px; transform: rotateY(180deg) translateZ(11px); }
        .key-left  { width: 22px; height: 30px; transform: rotateY(-90deg) translateZ(22px); }
        .key-right { width: 22px; height: 30px; transform: rotateY(90deg) translateZ(22px); }
        .key-top   { width: 44px; height: 22px; transform: rotateX(90deg) translateZ(15px); background: #fbbf24; border-radius: 5px; }

        /* Card depth utility styles */
        .text-3d {
          transform: translateZ(30px);
        }
        .logo-3d {
          transform: translateZ(45px);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .logo-3d:hover {
          transform: translateZ(55px) scale(1.05);
          box-shadow: 0 15px 35px rgba(244, 63, 94, 0.35);
        }
        .text-title-3d {
          transform: translateZ(35px);
        }
        .text-subtitle-3d {
          transform: translateZ(25px);
        }
        .text-label-3d {
          transform: translateZ(20px);
          display: block;
        }
        .input-3d {
          transform: translateZ(25px);
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
        }
        .input-3d:focus {
          transform: translateZ(35px) translateY(-2px);
          box-shadow: 0 15px 30px rgba(244, 63, 94, 0.25), 0 5px 15px rgba(0, 0, 0, 0.5);
          border-color: rgba(244, 63, 94, 0.6) !important;
        }
        .input-3d:hover {
          transform: translateZ(30px) translateY(-1px);
          box-shadow: 0 10px 20px rgba(244, 63, 94, 0.15), 0 4px 10px rgba(0, 0, 0, 0.45);
          border-color: rgba(244, 63, 94, 0.4) !important;
        }
        .btn-submit-3d {
          transform: translateZ(40px);
          transition: transform 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 15px rgba(244, 63, 94, 0.25);
        }
        .btn-submit-3d:hover {
          transform: translateZ(48px) translateY(-2px);
          box-shadow: 0 15px 35px rgba(244, 63, 94, 0.55), 0 5px 15px rgba(0, 0, 0, 0.4);
          filter: brightness(1.1);
        }
        .btn-submit-3d:active {
          transform: translateZ(38px) scale(0.98);
        }
        .btn-magic-3d {
          transform: translateZ(35px);
          transition: transform 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.05);
        }
        .btn-magic-3d:hover {
          transform: translateZ(42px) translateY(-1.5px);
          box-shadow: 0 12px 28px rgba(244, 63, 94, 0.25);
          border-color: rgba(244, 63, 94, 0.4) !important;
        }
        .btn-magic-3d:active {
          transform: translateZ(33px) scale(0.98);
        }
        .footer-3d {
          transform: translateZ(20px);
          transition: transform 0.3s ease;
        }
        .footer-3d:hover {
          transform: translateZ(25px);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
