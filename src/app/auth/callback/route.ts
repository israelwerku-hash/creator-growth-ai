import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    console.warn("Auth callback hit without a code parameter, redirecting to /login.");
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    let next = requestUrl.searchParams.get("next") ?? "/dashboard";
    if (!next.startsWith("/") || next.startsWith("//")) {
      next = "/dashboard";
    }

    if (!error) {
      if (data.user) {
        let redirectPath = next;
        
        // If the intended destination is the dashboard, let's verify their profile state
        // to prevent routing them through onboarding if they're already set up.
        if (redirectPath === "/dashboard" && data.user.email) {
          try {
            const creator = await db.creator.findUnique({
              where: { email: data.user.email.toLowerCase().trim() },
              select: { id: true, has_completed_onboarding: true, has_completed_pricing: true, tier: true }
            });
            
            if (creator) {
              // Existing user — auto-heal the onboarding flag if needed
              if (!creator.has_completed_onboarding) {
                try {
                  await db.creator.update({
                    where: { id: creator.id },
                    data: { has_completed_onboarding: true },
                  });
                } catch (healErr) {
                  console.warn("OAuth callback: auto-heal onboarding failed:", healErr);
                }
              }
              // Existing users always go to dashboard
              redirectPath = "/dashboard";
            } else {
               // Genuinely new user (e.g. first Google sign-in) — send to onboarding
               redirectPath = "/onboarding";
            }
          } catch (dbErr) {
            console.error("Callback DB verification failed:", dbErr);
          }
        }

        return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
      }
    }

    // Fallback if no user in session
    console.warn("Code exchange failed:", error.message);
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  } catch (err) {
    console.warn("Unexpected error during code exchange:", err);
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }
}
