import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db as prisma } from "@/lib/db";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { isDisposableEmail } from "@/lib/security/validate-email";
import { TIER_CREDITS } from "@/lib/constants/pricing";

// Use Service Role Key for admin operations (auto-confirm, bypass email verification)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body format." },
        { status: 400 }
      );
    }

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

    // 1. Use admin.createUser to auto-confirm the user (no email verification needed in dev)
    let userId: string;

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: sanitizedEmail,
      password: password,
      email_confirm: true,
      user_metadata: { name: name || null },
    });

    if (createError) {
      // If user already exists, try to look them up
      if (createError.message.includes("already been registered") || createError.message.includes("already exists")) {
        // Look up existing user by email
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = listData?.users?.find(
          (u: any) => u.email?.toLowerCase() === sanitizedEmail
        );
        if (existingUser) {
          userId = existingUser.id;
        } else {
          return NextResponse.json(
            { error: "This email is already registered. Please sign in instead." },
            { status: 409 }
          );
        }
      } else {
        console.error("Supabase admin.createUser error:", createError.message);
        return NextResponse.json(
          { error: createError.message },
          { status: 400 }
        );
      }
    } else {
      userId = createData.user.id;
    }

    // 2. Persist to Prisma Creator table with credit seeding
    try {
      await prisma.creator.upsert({
        where: { email: sanitizedEmail },
        update: {
          id: userId,
          name: name ?? null,
        },
        create: {
          id: userId,
          email: sanitizedEmail,
          name: name ?? null,
          aiCredits: TIER_CREDITS.FREE,
        },
      });
    } catch (dbError: any) {
      console.error("DB seeding failure during signup:", dbError);
      return NextResponse.json(
        { error: "Account was created but profile setup failed. Please try signing in." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, userId }, { status: 200 });
  } catch (e: any) {
    console.error("Unexpected signup failure:", e);
    return NextResponse.json(
      { error: e.message || "Something went wrong during account creation." },
      { status: 500 }
    );
  }
}