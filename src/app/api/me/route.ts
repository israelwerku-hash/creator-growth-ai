import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/utils/supabase/server";

export async function GET() {
  try {
    const activeUser = await requireAuth();

    // Scope query strictly to the authenticated user's ID
    const revenueData = await db.metric.findMany({
      where: { creatorId: activeUser.id },
      select: {
        id: true,
        name: true,
        value: true,
        platform: true,
        views: true,
        earnings: true,
        date: true,
      },
    }); 

    return NextResponse.json(revenueData);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch or Unauthorized" }, { status: 401 });
  }
}