import { Redis } from "@upstash/redis";

// --- Upstash Redis Client ---
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your .env
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// --- Reusable Caching Wrapper ---
// Checks Redis for a cached value first. If empty, runs fetcher, caches result, returns data.
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (err) {
    // If Redis is down, silently fall through to the fetcher
    console.warn("[REDIS_CACHE] Cache read failed, falling through:", err);
  }

  // Cache miss — run the fetcher
  const freshData = await fetcher();

  try {
    await redis.set(key, JSON.stringify(freshData), { ex: ttlSeconds });
  } catch (err) {
    console.warn("[REDIS_CACHE] Cache write failed:", err);
  }

  return freshData;
}
