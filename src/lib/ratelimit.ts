import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// --- AI Endpoint Rate Limiter ---
// 10 requests per minute sliding window per identifier (userId or IP)
export const aiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:ai",
});

// --- Public API Rate Limiter ---
// 20 requests per minute sliding window per IP
export const publicRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "ratelimit:public",
});

// --- Auth Rate Limiter ---
// 3 requests per 15 minutes per IP for password resets
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "15 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

// Helper to extract an identifier from a request
// Prefers userId from request body, falls back to IP headers
export function getRequestIdentifier(req: Request, userId?: string): string {
  // If user is authenticated, rate limit by their ID
  if (userId) return `user:${userId}`;

  // Priority 1: Vercel specific forwarded IP
  const vercelForwarded = req.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    return `ip:${vercelForwarded.split(",")[0].trim()}`;
  }

  // Priority 2: Standard proxy headers (Cloudflare, AWS, Nginx)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return `ip:${forwarded.split(",")[0].trim()}`;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return `ip:${realIp.trim()}`;
  }

  // Fallback to anonymous bucket if headers are entirely stripped
  return `ip:anonymous`;
}
