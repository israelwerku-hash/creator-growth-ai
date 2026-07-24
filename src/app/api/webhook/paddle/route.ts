import { NextResponse } from "next/server";
import { Environment, LogLevel, Paddle } from "@paddle/paddle-node-sdk";
import { db } from "@/lib/db";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("paddle-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing paddle-signature header" }, { status: 401 });
    }

    const rawBody = await request.text();

    const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? Environment.production : Environment.sandbox;
    const paddle = new Paddle(process.env.PADDLE_API_KEY || "", {
      environment: paddleEnv,
      logLevel: LogLevel.error,
    });

    const secretKey = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET || "";

    let eventData;
    try {
      // Unmarshal automatically verifies the HMAC-SHA256 signature
      eventData = paddle.webhooks.unmarshal(rawBody, secretKey, signature);
    } catch (e: any) {
      Sentry.captureException(new Error(`Paddle webhook signature verification failed: ${e.message}`));
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // ──────────────────────────────────────────────────────────
    // DECOUPLED QUEUE INGESTION
    // We do NOT process the fulfillment here. We instantly write to the DB and return 200 OK.
    // ──────────────────────────────────────────────────────────
    await db.webhookEvent.create({
      data: {
        provider: "PADDLE",
        payload: JSON.parse(rawBody), // Store the exact raw JSON for the worker
        status: "PENDING",
      },
    });

    // Instantly acknowledge the payload to prevent Paddle timeouts
    return NextResponse.json({ success: true, queued: true }, { status: 200 });

  } catch (error: any) {
    Sentry.captureException(error);
    console.error("[Paddle Webhook Ingestion Error]:", error);
    return NextResponse.json({ error: "Internal server error queuing webhook" }, { status: 500 });
  }
}
