import { NextResponse } from "next/server";
import { redis } from "./redis";

/**
 * Wraps an API route handler with an Upstash Redis Idempotency Engine.
 * 
 * If an 'Idempotency-Key' header is present:
 * 1. Checks Redis for a cached response.
 * 2. If found, short-circuits the execution and returns the cached JSON.
 * 3. If not found, executes the handler and caches successful responses for 24 hours.
 */
export async function withIdempotency(
  req: Request,
  handler: (req: Request) => Promise<NextResponse>
): Promise<NextResponse> {
  const idempotencyKey = req.headers.get("Idempotency-Key");

  // If no key is provided, bypass the engine entirely
  if (!idempotencyKey) {
    return handler(req);
  }

  const cacheKey = `idempotency:${idempotencyKey}`;

  try {
    // 1. Check Redis for an existing response
    const cachedResponseStr = await redis.get<string>(cacheKey);

    if (cachedResponseStr) {
      // Return the exact same cached JSON response
      let cachedData;
      try {
        // Handle cases where redis.get automatically parses JSON or returns a string
        cachedData = typeof cachedResponseStr === "string" ? JSON.parse(cachedResponseStr) : cachedResponseStr;
        return NextResponse.json(cachedData, { status: 200, headers: { "X-Idempotency-Cache": "HIT" } });
      } catch (e) {
        console.warn("[Idempotency] Failed to parse cached response, proceeding with handler execution.");
      }
    }

    // 2. Execute the actual handler logic
    const response = await handler(req);

    // 3. Only cache successful 2xx responses
    if (response.status >= 200 && response.status < 300) {
      // We must clone the response to read its JSON body without locking it for the client
      const responseClone = response.clone();
      try {
        const responseData = await responseClone.json();
        
        // Cache the successful response data for 24 hours (86400 seconds)
        await redis.set(cacheKey, JSON.stringify(responseData), { ex: 86400 });
        
        // Return original response with a MISS header
        response.headers.set("X-Idempotency-Cache", "MISS");
      } catch (parseError) {
        console.warn("[Idempotency] Handler did not return JSON, cannot cache.");
      }
    }

    return response;

  } catch (error) {
    console.error("[Idempotency Engine Error]:", error);
    // If Redis goes down, gracefully degrade by executing the handler normally
    return handler(req);
  }
}
