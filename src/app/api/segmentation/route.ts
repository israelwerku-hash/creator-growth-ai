import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { publicRateLimiter, getRequestIdentifier } from "@/lib/ratelimit";
import { getAuthenticatedUser } from "@/lib/extension-auth";



export async function GET(req: Request) {
  try {
    // 1. Rate Limiting
    const identifier = getRequestIdentifier(req);
    const { success } = await publicRateLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // 2. Auth Check
    const activeUser = await getAuthenticatedUser(req as any);
    if (!activeUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Request Parsing
    const { searchParams } = new URL(req.url);
    const fanId = searchParams.get("fanId");

    if (!fanId) {
      return NextResponse.json({ error: "Missing fanId parameter" }, { status: 400 });
    }

    // 4. Fetch Segmentation Stats
    // Assuming `Fan` model has `segment` and `lifetimeValue` fields based on the Prisma schema context
    const fanRecord = await db.fan.findUnique({
      where: { id: fanId },
      select: { segment: true, totalSpend: true }
    });

    if (!fanRecord) {
      // In dev mode, or if fan not found, return some basic stats instead of 404 for the UI
      return NextResponse.json({ segment: "New", ltv: 0 }, { status: 200 });
    }

    return NextResponse.json({ 
      segment: fanRecord.segment || "New", 
      ltv: fanRecord.totalSpend || 0 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[SEGMENTATION_GET_ERROR]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
