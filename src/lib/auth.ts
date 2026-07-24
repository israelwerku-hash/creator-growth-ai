import { getSession } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const { user } = await getSession();
  if (!user) {
    redirect("/auth");
  }
  
  // Fetch the role from our database
  const creator = await db.creator.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  return { 
    user, 
    role: creator?.role || "CREATOR" 
  };
}

export async function requireAdmin() {
  const { user, role } = await requireAuth();

  const upperRole = role?.toUpperCase();

  if (upperRole !== "ADMIN" && upperRole !== "MANAGER") {
    console.error(`[Auth Guard] Blocked access to Admin route for User: ${user.id} | Role: ${role}`);
    redirect("/dashboard");
  }

  return { user, role };
}
