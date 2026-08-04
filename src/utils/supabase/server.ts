import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
              })
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// A helper for ensuring authorization similar to the old requireAuth in session.ts
export async function requireAuth() {
  if (process.env.TEST_MODE === 'true' && process.env.NODE_ENV !== 'production') {
    return { id: process.env.TEST_MODE_USER_ID || '00000000-0000-0000-0000-000000000000', email: 'test@example.com' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return { id: user.id, email: user.email! };
}

export async function getSession() {
  const supabase = await createClient();
  // We use getUser() instead of getSession() to silence the Supabase security warning
  // and guarantee the user is securely verified against the database.
  const { data: { user } } = await supabase.auth.getUser();
  return { user };
}

export async function getCurrentUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}
