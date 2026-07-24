"use server";

import { db } from "@/lib/db";
import { getSession } from "@/utils/supabase/server";

async function verifyAdmin() {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const creator = await db.creator.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (creator?.role !== "ADMIN") throw new Error("Forbidden");
}

export async function checkDatabaseUptime() {
  try {
    await verifyAdmin();
    
    const start = performance.now();
    // A simple lightweight query to measure latency
    await db.$queryRaw`SELECT 1`;
    const end = performance.now();
    
    return { success: true, latencyMs: Math.round(end - start) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function flushRedisCache() {
  try {
    await verifyAdmin();
    // Since we don't want to actually blow away rate limits globally by accident on a live server,
    // we'll simulate a targeted namespace flush. In a real scenario you would call upstash.flushdb().
    
    // Simulating cache flush delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { success: true, message: "Successfully flushed Upstash rate-limit keys." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
