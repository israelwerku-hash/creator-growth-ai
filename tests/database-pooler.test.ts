import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';

describe('Database Connection Pooler Stress Test', () => {
  it('should successfully execute 50 concurrent queries without connection exhaustion', async () => {
    // We run 50 queries in parallel to stress test the connection limits.
    // If Prisma is properly configured with ?pgbouncer=true&connection_limit=1,
    // it will smoothly queue and execute these via the pooler without crashing.
    const concurrentCount = 50;
    const queries = [];

    for (let i = 0; i < concurrentCount; i++) {
      // Use a lightweight query to avoid heavy DB load while testing connections.
      queries.push(
        db.$queryRaw`SELECT 1 as result`
      );
    }

    try {
      const results = await Promise.all(queries);
      
      // Ensure all 50 queries resolved successfully
      expect(results).toHaveLength(concurrentCount);
      
      // Verify the return payload shape of a queryRaw
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    } catch (error) {
      // If we hit connection limits, Prisma will throw an error here.
      console.error('Stress test failed with database error:', error);
      throw error;
    }
  }, 300000); // Allow up to 300 seconds for network latency during the 50 queries through a single pooled connection
});
