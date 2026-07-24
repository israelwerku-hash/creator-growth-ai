import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db as prisma } from "@/lib/db";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { isDisposableEmail } from "@/lib/security/validate-email";

// Initialize Supabase admin safely using your environment keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { email, password, name } = parsed.data;
    const sanitizedEmail = email.toLowerCase().trim();

    if (isDisposableEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Disposable or temporary email addresses are not permitted. Please use a permanent email address." },
        { status: 400 }
      );
    }

    // 1. Securely register the user inside the primary Supabase Auth backend
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: password,
    });

    if (authError) {
      // If user already exists in Supabase Auth, they might just be re-authenticating
      // or trying to sign up again. We handle the local DB sync below anyway.
      if (authError.message !== "User already registered") {
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        );
      }
    }

    // 2. Persist ONLY valid columns to your Prisma Creator table (No password field!)
    // Using upsert instead of create to prevent duplicate row insertion on re-login
    const userId = authData?.user?.id || crypto.randomUUID();
    await prisma.creator.upsert({
      where: { email: sanitizedEmail },
      update: {
        id: userId, // Ensure ID stays synced if it changed
        name: name ?? null,
      },
      create: {
        id: userId,
        email: sanitizedEmail,
        name: name ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Synchronized signup failure:", e);
    return NextResponse.json(
      { error: "Something went wrong during account creation." },
      { status: 500 }
    );
  }
}