import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

/**
 * The core handler for processing the background job.
 * This runs ONLY if the Upstash QStash signature is successfully verified.
 */
async function handler(req: Request) {
  try {
    const body = await req.json();
    
    // Example: Process the AI payload here
    console.log("[QStash Worker] Processing job payload:", body);

    // ... AI Processing Logic ...

    return NextResponse.json({ success: true, message: "Job processed successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("[QStash Worker Error]:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Wrap the handler with Upstash's signature verification middleware
export const POST = verifySignatureAppRouter(handler);
