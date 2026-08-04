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
  const lockKey = `${cacheKey}:lock`;

  try {
    let acquired = false;
    let attempts = 0;

    // Concurrency / Race Condition Protection Loop
    while (!acquired && attempts < 15) { // Try for up to 1.5 seconds (100ms * 15)
      // 1. Check if a completed response is already cached
      const cachedResponseStr = await redis.get<string>(cacheKey);
      
      if (cachedResponseStr) {
        let cachedData;
        try {
          cachedData = typeof cachedResponseStr === "string" ? JSON.parse(cachedResponseStr) : cachedResponseStr;
          return NextResponse.json(cachedData, { status: 200, headers: { "X-Idempotency-Cache": "HIT" } });
        } catch (e) {
          console.warn("[Idempotency] Failed to parse cached response.");
        }
      }

      // 2. Try to acquire an atomic lock to become the primary executor
      // Set value to "locked" ONLY if it does not exist (nx), expire in 30s (ex)
      const lockResult = await redis.set(lockKey, "locked", { nx: true, ex: 30 });
      
      if (lockResult === "OK") {
        acquired = true;
        break;
      }

      // 3. If we didn't get the lock and no response is cached yet, another thread is working on it.
      // Wait 100ms and check the cache again.
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!acquired) {
      // If we timed out waiting for the lock, return a 409 Conflict instructing client to retry
      return NextResponse.json({ error: "Concurrent request processing. Please try again." }, { status: 409 });
    }

    // --- We have the lock, execute the actual handler logic ---
    let response: NextResponse;
    try {
      response = await handler(req);
    } catch (handlerError) {
      // If the handler crashes, release the lock so it can be retried
      await redis.del(lockKey);
      throw handlerError;
    }

    // 4. Cache successful 2xx responses and release the lock
    if (response.status >= 200 && response.status < 300) {
      const responseClone = response.clone();
      try {
        const responseData = await responseClone.json();
        // Set the cache (expires in 24h)
        await redis.set(cacheKey, JSON.stringify(responseData), { ex: 86400 });
      } catch (parseError) {
        console.warn("[Idempotency] Handler did not return JSON, cannot cache.");
      }
    }

    // Release the lock regardless of success or failure
    await redis.del(lockKey);

    response.headers.set("X-Idempotency-Cache", "MISS");
    return response;

  } catch (error) {
    console.error("[Idempotency Engine Error]:", error);
    // If Redis goes down, gracefully degrade by executing the handler normally
    return handler(req);
  }
}
