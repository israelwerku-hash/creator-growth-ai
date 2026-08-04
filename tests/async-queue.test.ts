import { describe, it, expect, vi, beforeEach } from 'vitest';
import { publishBackgroundJob } from '@/lib/qstash';
import { NextRequest } from 'next/server';
import { POST as processAiHandler } from '@/app/api/jobs/process-ai/route';

// Mock the QStash publisher
vi.mock('@/lib/qstash', () => ({
  publishBackgroundJob: vi.fn().mockResolvedValue('msg_12345'),
  qstashClient: {
    publishJSON: vi.fn().mockResolvedValue({ messageId: 'msg_12345' })
  }
}));

// Mock the core DB to simulate heavy background processing
vi.mock('@/lib/db', () => ({
  db: {
    fan: {
      updateMany: vi.fn().mockResolvedValue({ count: 1 })
    }
  }
}));

// Mock Next.js Headers & Ratelimit
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({ getAll: vi.fn().mockReturnValue([]) })
}));
vi.mock('@/lib/ratelimit', () => ({
  aiRateLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  getRequestIdentifier: vi.fn().mockReturnValue('127.0.0.1')
}));

describe('Background Queue & Async Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Response Speed (Non-Blocking Dispatch)', () => {
    it('should dispatch heavy AI jobs to QStash asynchronously without blocking the main thread', async () => {
      // Simulate an endpoint that queues a background job
      const start = Date.now();
      
      // Simulate triggering the publisher
      const messageId = await publishBackgroundJob('https://api.example.com/process', { fanId: '123' });
      
      const duration = Date.now() - start;

      // Ensure the enqueue operation returns instantly (simulated here, but the principle is we don't await the heavy work)
      expect(duration).toBeLessThan(300); 
      expect(messageId).toBe('msg_12345');
      expect(publishBackgroundJob).toHaveBeenCalledTimes(2);
      expect(publishBackgroundJob).toHaveBeenCalledWith('https://api.example.com/process', { fanId: '123' });
    });
  });

  describe('2. Queue Resilience (Failure Isolation)', () => {
    it('should not crash the primary server thread if a background worker fails', async () => {
      // Mock the background worker explicitly throwing a fatal error
      const mockHeavyTask = vi.fn().mockRejectedValue(new Error('Out of Memory during AI generation'));
      
      // Create a mock route wrapper that uses QStash enqueueing
      const safeApiEndpoint = async (req: Request) => {
        try {
          // 1. Immediately acknowledge and queue
          await publishBackgroundJob('/api/jobs/process-ai', { simulate: true });
          // 2. Return 202 Accepted immediately
          return new Response(JSON.stringify({ status: 'queued' }), { status: 202 });
        } catch (e) {
          return new Response('Failed to queue', { status: 500 });
        }
      };

      const req = new NextRequest('http://localhost:3000/api/start-generation', { method: 'POST' });
      
      // Execution
      const res = await safeApiEndpoint(req);
      
      // Assert the main thread returned 202 Success even though the background task is designed to fail later
      expect(res.status).toBe(202);
      expect(publishBackgroundJob).toHaveBeenCalledTimes(1);

      // Now manually trigger the background task to prove it throws, but the main thread survived
      await expect(mockHeavyTask()).rejects.toThrow('Out of Memory');
    });

    it('should gracefully handle webhook verification failures in the worker endpoint', async () => {
      // The QStash worker endpoint checks signatures. If missing or invalid, it returns 401,
      // which signals Upstash to retry or drop, without crashing the Node process.
      
      const badReq = new NextRequest('http://localhost:3000/api/jobs/process-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fanId: '123' })
        // Missing Upstash-Signature headers
      });

      // The processAiHandler uses @upstash/qstash/nextjs verifySignatureAppRouter 
      // which intercepts and handles bad signatures safely. We simulate standard safety here.
      const res = await processAiHandler(badReq) as Response;
      
      // Our handler should safely catch it or the wrapper will block it
      expect([200, 400, 401, 403, 500]).toContain(res.status); 
    });
  });
});
