import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { aiRateLimiter, publicRateLimiter, getRequestIdentifier } from "@/lib/ratelimit";

// Routes that pass through immediately with ZERO auth checks.
const PUBLIC_ROUTES = [
  '/', '/pricing', '/auth/callback', '/welcome', '/paywall',
];

// Routes where we check auth to redirect logged-in users away,
// but allow logged-out users to stay.
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)',
  ],
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ──────────────────────────────────────────────────────────
  // 0. WAF: ANTI-SCANNER & BOT PROTECTION
  // ──────────────────────────────────────────────────────────
  const BLOCKED_USER_AGENTS = [
    "zaproxy", "sqlmap", "nikto", "burpsuite", "nmap", "w3af",
    "netsparker", "acunetix", "dirbuster", "gobuster", "haqer", "arachni"
  ];
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";
  
  if (BLOCKED_USER_AGENTS.some(bot => userAgent.includes(bot))) {
    console.warn(`[WAF] Blocked known scanner bot: ${userAgent}`);
    return new NextResponse(
      JSON.stringify({ error: "Forbidden: Scanner Detected" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const BLOCKED_PATHS = [".env", ".git", "wp-admin", "wp-login.php", "config.php"];
  if (BLOCKED_PATHS.some(blockedPath => pathname.includes(blockedPath))) {
    console.warn(`[WAF] Blocked malicious path probe: ${pathname}`);
    return new NextResponse(
      JSON.stringify({ error: "Forbidden: Malicious Probe" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // ──────────────────────────────────────────────────────────
  // 1. FAST PATH & WEBHOOKS
  // ──────────────────────────────────────────────────────────
  // Webhooks skip auth and rate limiting (they rely on HMAC signatures)
  if (pathname.startsWith("/api/webhooks")) {
    return NextResponse.next({ request });
  }

  // Pure public UI routes skip everything.
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next({ request });
  }

  // ──────────────────────────────────────────────────────────
  // 1.5 SECURITY RULES (PAYLOAD SIZE & CORS)
  // ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const MAX_PAYLOAD_SIZE = 50 * 1024; // 50 KB strict limit for JSON payloads
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
      console.warn(`[SECURITY] Blocked oversized payload: ${contentLength} bytes from ${request.headers.get("x-forwarded-for") || 'unknown'}`);
      return new NextResponse(
        JSON.stringify({ error: "Payload Too Large" }),
        { status: 413, headers: { "Content-Type": "application/json" } }
      );
    }

    const ALLOWED_ORIGIN = "http://localhost:3000";
    const origin = request.headers.get("origin");
    if (origin && origin !== ALLOWED_ORIGIN) {
      console.warn(`[SECURITY] Blocked cross-origin request from unauthorized origin: ${origin}`);
      return new NextResponse(
        JSON.stringify({ error: "Forbidden: Invalid Origin" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // ──────────────────────────────────────────────────────────
  // 2. UPSTASH RATE LIMITING (for /api routes)
  // ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/api/ai")) {
    const identifier = getRequestIdentifier(request);
    const { success } = await aiRateLimiter.limit(identifier);
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again shortly." }, { status: 429 });
    }
  } else if (pathname.startsWith("/api/")) {
    const identifier = getRequestIdentifier(request);
    const { success } = await publicRateLimiter.limit(identifier);
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again shortly." }, { status: 429 });
    }
  }

  // ──────────────────────────────────────────────────────────
  // 3. PROTECTED & AUTH ROUTES: Check the Supabase session.
  // ──────────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
              })
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ──────────────────────────────────────────────────────────
    // 4. AUTH ROUTES (/login, /signup): Redirect to /dashboard if logged in
    // ──────────────────────────────────────────────────────────
    if (AUTH_ROUTES.includes(pathname)) {
      if (user) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    // ──────────────────────────────────────────────────────────
    // 5. PROTECTED ROUTES & RBAC: Enforce Auth and Role
    // ──────────────────────────────────────────────────────────
    if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      return NextResponse.redirect(loginUrl);
    }

    // Fetch the user's role from Supabase DB using Service Role Key to bypass RLS
    let role = "CREATOR";
    if (user) {
      try {
        const supabaseAdmin = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            cookies: {
              getAll: () => [],
              setAll: () => {},
            },
          }
        );

        const { data: creator } = await supabaseAdmin
          .from("Creator")
          .select("role")
          .eq("id", user.id)
          .single();

        if (creator?.role) {
          role = creator.role;
        }
      } catch (dbErr) {
        console.warn("[Proxy] RBAC DB lookup failed, defaulting to CREATOR:", (dbErr as Error).message);
      }
    }
    
    const dbRole = role?.toUpperCase();

    // Test log for RBAC rules
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      console.log(`[Auth Guard] User: ${user?.id} | Role: ${dbRole} | Path: ${pathname}`);
    }

    // RBAC Gate: /admin
    // NOTE: Edge runtime DB lookups are unreliable (RLS, cold starts, connection pooling).
    // We only enforce AUTHENTICATION here. The actual ADMIN role check happens in the
    // server component (src/app/admin/page.tsx) using Prisma in Node.js runtime.
    if (pathname.startsWith("/admin")) {
      console.log('[ADMIN GUARD CHECK]', { 
        email: user?.email, 
        userId: user?.id, 
        fetchedRole: dbRole, 
        note: 'Edge role lookup may be unreliable — server component enforces actual RBAC' 
      });
      // Authentication is already enforced above (line 97-101).
      // Let the request through — admin/page.tsx will verify the role via Prisma.
    }

    // RBAC Gate: /dashboard/manager
    if (pathname.startsWith("/dashboard/manager") && dbRole !== "ADMIN" && dbRole !== "MANAGER") {
      const unauthUrl = request.nextUrl.clone();
      unauthUrl.pathname = '/dashboard';
      unauthUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(unauthUrl);
    }

    // ──────────────────────────────────────────────────────────
    // 6. CORS HEADERS INJECTION
    // ──────────────────────────────────────────────────────────
    supabaseResponse.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
    supabaseResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    supabaseResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return supabaseResponse;
  } catch (err) {
    console.warn('[Proxy] Error:', (err as Error).message);
    // If it's already an auth route, let them see it instead of looping
    if (AUTH_ROUTES.includes(pathname) || PUBLIC_ROUTES.includes(pathname)) {
      const res = NextResponse.next({ request });
      res.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
      return res;
    }
    // For any other error, let the request through rather than causing a redirect loop
    const res = NextResponse.next({ request });
    res.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
    return res;
  }
}
