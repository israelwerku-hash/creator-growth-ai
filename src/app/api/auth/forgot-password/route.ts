import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { authRateLimiter, getRequestIdentifier } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    const identifier = getRequestIdentifier(req);
    const { success } = await authRateLimiter.limit(identifier);
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again in 15 minutes." }, { status: 429 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?next=/reset-password`,
    });

    if (error) {
      // Supabase returns an error if the user doesn't exist or rate limit hit.
      // We return 400 so the client can show it, though for security it's sometimes better to return 200 to prevent email enumeration.
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
