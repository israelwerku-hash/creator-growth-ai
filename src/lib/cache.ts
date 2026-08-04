// Lightweight request coalescing and in-memory cache utility for client-side data fetching

const cache = new Map<string, { data: any; expiry: number }>();
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Fetch with automatic request coalescing (duplicate concurrent requests share a single promise)
 * and in-memory caching.
 * 
 * @param key Unique key for the request (e.g., URL path)
 * @param fetcher Async function to execute if cache miss
 * @param ttlMs Time-to-live in milliseconds (default: 60s)
 */
export async function fetchWithCache<T>(key: string, fetcher: () => Promise<T>, ttlMs = 60000): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);
  
  // 1. Check cache freshness
  if (cached && cached.expiry > now) {
    return cached.data;
  }
  
  // 2. Check for identical concurrent requests (Request Coalescing)
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }
  
  // 3. Execute backend fetcher
  const requestPromise = fetcher()
    .then((data) => {
      cache.set(key, { data, expiry: Date.now() + ttlMs });
      pendingRequests.delete(key);
      return data;
    })
    .catch((err) => {
      pendingRequests.delete(key);
      throw err;
    });
  
  pendingRequests.set(key, requestPromise);
  return requestPromise;
}

export function clearCache() {
  cache.clear();
  pendingRequests.clear();
}
