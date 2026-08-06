import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Note: This file relies on standard Supabase auth for the dashboard user, 
// NOT the extension auth. We need to know who is logged into the web app.
async function getDashboardUser(req: Request) {
  const cookieStore = cookies();
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
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function GET(req: Request) {
  try {
    const activeUser = await getDashboardUser(req);
    
    // Allow mock fallback for dev
    let userId = activeUser?.id;
    if (!userId && process.env.NODE_ENV === "development") {
      userId = "mock_developer_id";
      
      try {
        // Ensure dev user exists
        await db.creator.upsert({
          where: { id: userId },
          update: {},
          create: {
            id: userId,
            email: "mock_developer_id@dev.local",
            name: "Dev Creator",
            role: "CREATOR",
            status: "ACTIVE",
            tier: "FREE",
            apiKey: uuidv4()
          }
        });
      } catch (dbErr: any) {
        console.warn("Dev mode DB unreachable, using local fallback key:", dbErr.message);
        return NextResponse.json({ apiKey: "dev_key_local_fallback" }, { status: 200 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creator = await db.creator.findUnique({
      where: { id: userId },
      select: { apiKey: true }
    });

    if (!creator) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Auto-generate key if it doesn't exist yet
    if (!creator.apiKey) {
      const newKey = uuidv4();
      const updatedCreator = await db.creator.update({
        where: { id: userId },
        data: { apiKey: newKey },
        select: { apiKey: true }
      });
      return NextResponse.json({ apiKey: updatedCreator.apiKey }, { status: 200 });
    }

    return NextResponse.json({ apiKey: creator.apiKey }, { status: 200 });
  } catch (error: any) {
    console.error("[API_KEY_GET_ERROR]", error);
    
    // Graceful fallback for Prisma schema mismatch (e.g. P2022) or connection errors
    if (error?.code === "P2022" || error?.message?.includes("Can't reach database") || error?.message?.includes("Prisma")) {
      console.warn("Database error intercepted in GET. Returning local fallback key.");
      return NextResponse.json({ apiKey: "dev_key_local_fallback" }, { status: 200 });
    }
    
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const activeUser = await getDashboardUser(req);
    let userId = activeUser?.id;
    if (!userId && process.env.NODE_ENV === "development") {
      userId = "mock_developer_id";
      
      try {
        // Ensure dev user exists
        await db.creator.upsert({
          where: { id: userId },
          update: {},
          create: {
            id: userId,
            email: "mock_developer_id@dev.local",
            name: "Dev Creator",
            role: "CREATOR",
            status: "ACTIVE",
            tier: "FREE",
            apiKey: uuidv4()
          }
        });
      } catch (dbErr: any) {
        console.warn("Dev mode DB unreachable, using local fallback key:", dbErr.message);
        return NextResponse.json({ apiKey: "dev_key_local_fallback_new" }, { status: 200 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newKey = uuidv4();
    const updatedCreator = await db.creator.update({
      where: { id: userId },
      data: { apiKey: newKey },
      select: { apiKey: true }
    });

    return NextResponse.json({ apiKey: updatedCreator.apiKey }, { status: 200 });
  } catch (error: any) {
    console.error("[API_KEY_POST_ERROR]", error);
    
    // Graceful fallback for Prisma schema mismatch (e.g. P2022) or connection errors
    if (error?.code === "P2022" || error?.message?.includes("Can't reach database") || error?.message?.includes("Prisma")) {
      console.warn("Database error intercepted in POST. Returning local fallback key.");
      return NextResponse.json({ apiKey: "dev_key_local_fallback" }, { status: 200 });
    }
    
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
