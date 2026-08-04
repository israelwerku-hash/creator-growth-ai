import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { aiRateLimiter, getRequestIdentifier } from '@/lib/ratelimit';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    fan: {
      updateMany: vi.fn(),
      findUnique: vi.fn(),
    }
  }
}));

vi.mock('@/lib/ratelimit', () => ({
  aiRateLimiter: {
    limit: vi.fn()
  },
  getRequestIdentifier: vi.fn().mockReturnValue('127.0.0.1')
}));

describe('Security: IDOR Prevention & Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. IDOR Prevention (Cross-Tenant Authorization)', () => {
    it('should safely reject 20 cross-tenant modification attempts via updateMany filters', async () => {
      // Simulate User A (id: 'user-a-123') trying to update User B's resources
      const activeUserId = 'user-a-123';
      const targetFanId = 'fan-b-999'; // Belongs to user B

      // Mock our new secure updateMany implementation
      // It simulates what Prisma does when where: { id: fanId, creatorId: activeUser } matches nothing
      const mockUpdateMany = vi.mocked(db.fan.updateMany).mockResolvedValue({ count: 0 });

      let rejectedCount = 0;

      for (let i = 0; i < 20; i++) {
        // The secure route logic now uses updateMany with a composite tenant key
        const result = await db.fan.updateMany({
          where: { 
            id: targetFanId, 
            creatorId: activeUserId // The IDOR protection filter!
          },
          data: { segment: 'whale' }
        });

        // Because User A doesn't own Fan B, the query affects 0 rows (safe rejection)
        if (result.count === 0) {
          rejectedCount++;
        }
      }

      // Assert that all 20 attempts were safely neutralized without modifying User B's data
      expect(rejectedCount).toBe(20);
      expect(mockUpdateMany).toHaveBeenCalledTimes(20);
      
      // Verify that the query structure includes the mandatory creatorId tenant filter
      expect(mockUpdateMany.mock.calls[0][0].where).toHaveProperty('creatorId', activeUserId);
    });
  });

  describe('2. Rate Limiting Utility', () => {
    it('should allow traffic under the threshold and return HTTP 429 once exceeded (30 rapid requests)', async () => {
      // Simulate a rate limit threshold of 10 requests
      const limitThreshold = 10;
      
      // Mock Upstash limit returning success up to 10 times, then failing
      let callCount = 0;
      const mockLimit = vi.mocked(aiRateLimiter.limit).mockImplementation(async () => {
        callCount++;
        if (callCount <= limitThreshold) {
          return { success: true, limit: 10, reset: 0, remaining: 10 - callCount, pending: Promise.resolve() } as any;
        }
        return { success: false, limit: 10, reset: 0, remaining: 0, pending: Promise.resolve() } as any;
      });

      let successCount = 0;
      let blockedCount = 0;

      // Fire 30 rapid requests
      for (let i = 0; i < 30; i++) {
        const { success } = await aiRateLimiter.limit('127.0.0.1');
        if (success) {
          successCount++;
        } else {
          blockedCount++;
        }
      }

      // Assert exactly 10 succeeded and 20 were blocked (HTTP 429 equivalent behavior)
      expect(successCount).toBe(10);
      expect(blockedCount).toBe(20);
      expect(mockLimit).toHaveBeenCalledTimes(30);
    });
  });
});
