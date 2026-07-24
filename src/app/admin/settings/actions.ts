"use server";

import { db } from "@/lib/db";
import { getSession } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";

async function verifyAdmin() {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const creator = await db.creator.findUnique({
    where: { id: session.user.id },
    select: { email: true, role: true },
  });

  if (creator?.role !== "ADMIN") throw new Error("Forbidden");
  
  return creator.email || session.user.email || "UNKNOWN_ADMIN";
}

export async function toggleFeatureFlag(id: string, name: string, currentState: boolean) {
  try {
    const adminEmail = await verifyAdmin();
    
    await db.featureFlag.upsert({
      where: { id },
      update: { isEnabled: !currentState },
      create: { id, name, isEnabled: !currentState },
    });
    
    await createAuditLog(
      adminEmail,
      "FEATURE_TOGGLE",
      { flagId: id, flagName: name, oldState: currentState, newState: !currentState }
    );
    
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
