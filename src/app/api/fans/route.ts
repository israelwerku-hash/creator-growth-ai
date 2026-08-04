import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/utils/supabase/server";
import { getAuthenticatedUser } from "@/lib/extension-auth";
import * as Sentry from "@sentry/nextjs";

async function getAuthUser(req: Request) {
  let activeUser = null;
  
  // 1. Try Web Session
  const session = await getSession().catch(() => null);
  if (session?.user?.id) {
    activeUser = await db.creator.findUnique({ where: { id: session.user.id } });
  }

  // 2. Try Extension API Key Header
  if (!activeUser) {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey) {
      if (process.env.NODE_ENV === "development" && apiKey === "dev_key_123") {
        activeUser = await db.creator.upsert({
          where: { id: "mock_developer_id" },
          update: { apiKey: "dev_key_123" },
          create: {
            id: "mock_developer_id",
            email: "mock_developer_id@dev.local",
            name: "Dev Creator",
            role: "CREATOR",
            tier: "PRO",
            apiKey: "dev_key_123"
          }
        });
      } else {
        activeUser = await db.creator.findUnique({ where: { apiKey } });
      }
    }
  }

  // 3. Fallback to Bearer token logic
  if (!activeUser) {
    activeUser = await getAuthenticatedUser(req as any);
  }
  
  return activeUser;
}

export async function GET(req: Request) {
  try {
    const activeUser = await getAuthUser(req);

    if (!activeUser) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid Session / API Key" }, { status: 401 });
    }

    const fans = await db.fan.findMany({
      where: { creatorId: activeUser.id },
      include: { memories: { orderBy: { createdAt: 'desc' } } },
      orderBy: { lastActivityDate: 'desc' }
    });

    return NextResponse.json({ success: true, fans });
  } catch (error: any) {
    console.error("[API_FANS_GET]", error);
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const activeUser = await getAuthUser(req);

    if (!activeUser) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid Session / API Key" }, { status: 401 });
    }

    // --- Parse Request Body ---
    const body = await req.json();
    const { username, displayName, totalSpent, latestContext } = body;

    if (!username) {
      return NextResponse.json({ error: "Username is required." }, { status: 400 });
    }

    // --- IDOR Protected Upsert ---
    let fan = await db.fan.findFirst({
      where: {
        creatorId: activeUser.id,
        username: username,
      }
    });

    if (fan) {
      // Update existing fan
      fan = await db.fan.update({
        where: { id: fan.id },
        data: {
          displayName: displayName || fan.displayName,
          totalSpend: totalSpent !== undefined ? totalSpent : fan.totalSpend,
          lastActivityDate: new Date(),
        }
      });
    } else {
      // Create new fan
      fan = await db.fan.create({
        data: {
          creatorId: activeUser.id,
          username: username,
          displayName: displayName,
          totalSpend: totalSpent || 0,
          lastActivityDate: new Date(),
        }
      });
    }

    // --- Create Fan Memory if Context Provided ---
    if (latestContext) {
      await db.fanMemory.create({
        data: {
          fanId: fan.id,
          keyFact: latestContext,
          category: "General Context",
          isPriority: false,
        }
      });
    }

    return NextResponse.json({ success: true, fanId: fan.id });
  } catch (error: any) {
    console.error("[API_FANS_POST]", error);
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
