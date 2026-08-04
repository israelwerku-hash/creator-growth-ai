import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createServerClient } from "@supabase/ssr";

export async function getAuthenticatedUser(req: NextRequest | Request) {
  // Support both "Authorization: Bearer <key>" and "x-api-key: <key>" headers
  const authHeader = req.headers.get("Authorization");
  const xApiKey = req.headers.get("x-api-key");

  let apiKey: string | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    apiKey = authHeader.split(" ")[1];
  } else if (xApiKey) {
    apiKey = xApiKey;
  }

  if (!apiKey) {
    return null;
  }

  try {
    // Seed dev user if running in development mode and the key is dev_key_123
    if (process.env.NODE_ENV === "development" && apiKey === "dev_key_123") {
      await db.creator.upsert({
        where: { id: "mock_developer_id" },
        update: { apiKey: "dev_key_123" },
        create: {
          id: "mock_developer_id",
          email: "mock_developer_id@dev.local",
          name: "Dev Creator",
          role: "CREATOR",
          status: "ACTIVE",
          tier: "FREE",
          apiKey: "dev_key_123"
        }
      });
    }

    // Validate against the Creator table's apiKey field
    const creator = await db.creator.findUnique({
      where: { apiKey }
    });

    if (creator) {
      return creator;
    }
  } catch (error) {
    console.error("[AUTH_ERROR] Error looking up API Key:", error);
  }

  return null;
}
