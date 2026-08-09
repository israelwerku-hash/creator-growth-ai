import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// In-memory rate limiter: max 20 checks per email per 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(email);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

// Periodically prune stale entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60_000);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email || typeof email !== "string") {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  // Basic sanitization: lowercase, trim, check format
  const sanitizedEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  // Rate limit per email
  if (isRateLimited(sanitizedEmail)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait." },
      { status: 429 }
    );
  }

  try {
    // Use admin API to list users and find the one matching the email
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (error) {
      console.error("[check-verification] Admin API error:", error.message);
      return NextResponse.json({ verified: false });
    }

    // listUsers doesn't filter by email, so we need to use a different approach
    // Use the getUserByEmail-equivalent via listUsers with a filter workaround
    // Actually, supabase-js admin has no getUserByEmail — iterate or use RPC.
    // For efficiency, query the auth.users table directly via the admin client.
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from("auth.users")
      .select("email_confirmed_at")
      .eq("email", sanitizedEmail)
      .single();

    // If direct table query fails (common with auth schema), fall back to listUsers scan
    if (usersError) {
      const { data: allUsersData } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      const matchingUser = allUsersData?.users?.find(
        (u: { email?: string }) => u.email?.toLowerCase() === sanitizedEmail
      );

      if (!matchingUser) {
        // Don't reveal whether the email exists — just return false
        return NextResponse.json({ verified: false });
      }

      const isVerified = !!matchingUser.email_confirmed_at;
      return NextResponse.json({ verified: isVerified });
    }

    const isVerified = !!usersData?.email_confirmed_at;
    return NextResponse.json({ verified: isVerified });
  } catch (err) {
    console.error("[check-verification] Unexpected error:", err);
    return NextResponse.json({ verified: false });
  }
}
