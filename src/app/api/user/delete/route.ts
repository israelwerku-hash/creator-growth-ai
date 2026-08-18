import { NextResponse } from "next/server";
import { getSession } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";

// Force Node.js runtime for Supabase auth admin / db execution
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Database Lookup for membership/subscription ID
    const creator = await db.creator.findUnique({
      where: { id: userId },
      select: { paddleSubscriptionId: true }
    });

    const membershipId = creator?.paddleSubscriptionId;

    // 2. Whop Membership Cancellation (if membership exists)
    if (membershipId) {
      console.log(`[Account Deletion] Attempting to cancel Whop membership: ${membershipId}`);
      
      const whopApiKey = process.env.WHOP_API_KEY;
      
      if (whopApiKey) {
        try {
          const whopRes = await fetch(`https://api.whop.com/api/v2/memberships/${membershipId}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${whopApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "cancel" }),
          });

          if (!whopRes.ok) {
            const errorText = await whopRes.text();
            console.warn(`[Account Deletion] Whop cancellation returned non-OK status: ${whopRes.status}`, errorText);
          } else {
            console.log(`✅ [Account Deletion] Whop membership ${membershipId} successfully cancelled.`);
          }
        } catch (whopError) {
          console.error(`[Account Deletion] Whop cancellation exception:`, whopError);
        }
      } else {
        console.warn(`[Account Deletion] WHOP_API_KEY missing! Could not cancel membership ${membershipId}.`);
      }
    }

    // 3. Database Purge (Cascading)
    console.log(`[Account Deletion] Purging Prisma database records for user: ${userId}`);
    await db.creator.delete({
      where: { id: userId },
    });
    console.log(`✅ [Account Deletion] Prisma records purged successfully.`);

    // 4. Supabase Auth Purge
    console.log(`[Account Deletion] Purging Supabase Auth user: ${userId}`);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(`[Account Deletion] Supabase Service Role Key missing! Cannot delete Auth user.`);
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error(`[Account Deletion] Supabase Auth deletion failed:`, authError);
      return NextResponse.json({ error: "Failed to delete Auth user" }, { status: 500 });
    }

    console.log(`✅ [Account Deletion] Supabase Auth user deleted successfully. End-to-end flow complete.`);

    return NextResponse.json({ success: true, deletedUserId: userId });
  } catch (error: any) {
    console.error("[Account Deletion] Unexpected endpoint error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
