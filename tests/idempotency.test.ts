import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withIdempotency } from '@/lib/idempotency';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// Mock Redis to simulate memory-based locking and caching
const mockStore = new Map<string, string>();

vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn().mockImplementation(async (key: string) => mockStore.get(key) || null),
    set: vi.fn().mockImplementation(async (key: string, value: string, opts?: any) => {
      // Implement NX logic
      if (opts?.nx) {
        if (mockStore.has(key)) return null;
        mockStore.set(key, value);
        return 'OK';
      }
      mockStore.set(key, value);
      return 'OK';
    }),
    del: vi.fn().mockImplementation(async (key: string) => {
      mockStore.delete(key);
    })
  }
}));

describe('Idempotency Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.clear();
  });

  it('should prevent race conditions by executing the mutation exactly ONCE for concurrent requests', async () => {
    // 1. Create a mock handler that simulates a 200ms expensive mutation (e.g. database write + credit deduction)
    const mockBackendMutation = vi.fn().mockImplementation(async (req) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return NextResponse.json({ success: true, processedData: 'heavy-result' });
    });

    // 2. Create two identical requests with the SAME Idempotency-Key
    const req1 = new Request('http://localhost:3000/api/heavy-action', {
      method: 'POST',
      headers: { 'Idempotency-Key': 'key-12345' }
    });
    const req2 = new Request('http://localhost:3000/api/heavy-action', {
      method: 'POST',
      headers: { 'Idempotency-Key': 'key-12345' }
    });

    // 3. Fire them simultaneously (concurrent race condition attack)
    const [res1, res2] = await Promise.all([
      withIdempotency(req1 as any, mockBackendMutation),
      withIdempotency(req2 as any, mockBackendMutation)
    ]);

    // 4. Assert both requests received identical successful payloads
    const data1 = await res1.json();
    const data2 = await res2.json();
    
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(data1).toEqual({ success: true, processedData: 'heavy-result' });
    expect(data2).toEqual({ success: true, processedData: 'heavy-result' });

    // 5. CRITICAL ASSERTION: The backend mutation ONLY executed ONE time!
    expect(mockBackendMutation).toHaveBeenCalledTimes(1);

    // 6. Assert Headers
    // The first request that acquired the lock should be a MISS, the second should be a HIT from cache
    const headers = [res1.headers.get('X-Idempotency-Cache'), res2.headers.get('X-Idempotency-Cache')];
    expect(headers).toContain('MISS');
    expect(headers).toContain('HIT');
  });

  it('should execute twice if different idempotency keys are used', async () => {
    const mockBackendMutation = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

    const req1 = new Request('http://localhost:3000', { headers: { 'Idempotency-Key': 'key-A' } });
    const req2 = new Request('http://localhost:3000', { headers: { 'Idempotency-Key': 'key-B' } });

    await Promise.all([
      withIdempotency(req1 as any, mockBackendMutation),
      withIdempotency(req2 as any, mockBackendMutation)
    ]);

    expect(mockBackendMutation).toHaveBeenCalledTimes(2);
  });
});
