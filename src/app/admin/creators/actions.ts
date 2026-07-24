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

export async function updateCreatorCredits(creatorId: string, amount: number) {
  try {
    const adminEmail = await verifyAdmin();
    
    // Fetch previous state for the audit log metadata
    const prevCreator = await db.creator.findUnique({
      where: { id: creatorId },
      select: { aiCredits: true }
    });
    
    await db.creator.update({
      where: { id: creatorId },
      data: { aiCredits: amount },
    });
    
    await createAuditLog(
      adminEmail, 
      "CREDIT_OVERRIDE", 
      { creatorId, oldBalance: prevCreator?.aiCredits, newBalance: amount }
    );
    
    revalidatePath("/admin/creators");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleCreatorStatus(creatorId: string, currentStatus: "ACTIVE" | "SUSPENDED") {
  try {
    const adminEmail = await verifyAdmin();
    
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    
    await db.creator.update({
      where: { id: creatorId },
      data: { status: newStatus },
    });
    
    await createAuditLog(
      adminEmail, 
      "ACCOUNT_STATUS_TOGGLE", 
      { creatorId, oldStatus: currentStatus, newStatus }
    );
    
    revalidatePath("/admin/creators");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
