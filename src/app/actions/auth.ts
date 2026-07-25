"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

// ==========================================
// 1. SIGNUP ACTION (Strips out password before Prisma)
// ==========================================
export async function signupAction(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;

    if (!email) {
      return { error: "Email is required." };
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Upsert by email so existing records get merged instead of
    // throwing a P2002 unique constraint error on the email field.
    const targetCreator = await db.creator.upsert({
      where: { email: sanitizedEmail },
      update: {
        // Overwrite the stale id with the new Supabase user id
        ...(id ? { id } : {}),
        ...(name ? { name: name.trim() } : {}),
      },
      create: {
        id: id || crypto.randomUUID(),
        email: sanitizedEmail,
        name: name ? name.trim() : null,
      },
    });

    revalidatePath("/");
    return { success: true, creatorId: targetCreator.id };
  } catch (error: any) {
    console.error("Database write failure inside signupAction:", error);
    return { error: error.message || "Failed to persist account metadata." };
  }
}

// ==========================================
// 2. LOGIN ACTION (For Form Handling)
// ==========================================
export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    if (!email) {
      return { error: "Email is required." };
    }

    // Simply verify that they exist in our record structure
    const creator = await db.creator.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });

    if (!creator) {
      return { error: "No profile record associated with this email identity." };
    }

    return { success: true, creatorId: creator.id };
  } catch (error: any) {
    console.error("Login lookup failure inside loginAction:", error);
    return { error: error.message || "Authentication tracking failure." };
  }
}

// ==========================================
// 3. LOGIN REDIRECT ACTION (State-Aware)
// ==========================================
export async function getLoginRedirectAction(email: string) {
  try {
    const creator = await db.creator.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { has_completed_onboarding: true, has_completed_pricing: true, tier: true }
    });

    if (!creator) {
      return { redirectPath: "/onboarding" };
    }

    if (!creator.has_completed_onboarding) {
      return { redirectPath: "/onboarding" };
    }

    // If they haven't finished pricing and are still on the FREE tier, send to paywall/billing
    if (!creator.has_completed_pricing && creator.tier === "FREE") {
      return { redirectPath: "/paywall" };
    }

    // Existing, paid (or fully onboarded free) user
    return { redirectPath: "/dashboard" };
  } catch (error) {
    console.error("Failed to determine redirect path:", error);
    return { redirectPath: "/dashboard" }; // Let layout middleware handle it as a fallback
  }
}

// ==========================================
// 4. ADMIN OVERRIDE ACTION
// ==========================================
export async function checkAdminOverrideAction(email?: string, password?: string) {
  if (!email || !password) return { success: false };
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword && email.trim() === adminEmail && password === adminPassword) {
    return { success: true };
  }
  return { success: false };
}