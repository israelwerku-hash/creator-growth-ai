import { describe, it, expect, vi, beforeAll } from 'vitest';
import { isDisposableEmail } from '@/lib/security/validate-email';
import { POST as SignupPOST } from '@/app/api/auth/signup/route';
import { POST as DeletePOST } from '@/app/api/user/delete/route';
import { POST as ForgotPasswordPOST } from '@/app/api/auth/forgot-password/route';
import { NextRequest } from 'next/server';
import { authRateLimiter } from '@/lib/ratelimit';

// Mock Upstash rate limiter logic to avoid real network calls during tests
vi.mock('@/lib/ratelimit', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    authRateLimiter: {
      limit: vi.fn().mockImplementation((id: string) => {
        // Return success for first 3 requests, then fail
        const calls = (global as any).rateLimitCalls || 0;
        (global as any).rateLimitCalls = calls + 1;
        return Promise.resolve({ success: calls < 3 });
      })
    }
  };
});

describe('Authentication & Security Boundaries', () => {

  beforeAll(() => {
    (global as any).rateLimitCalls = 0;
  });
  
  describe('1. INVALID INPUT HANDLING (Zod)', () => {
    it('should return 400 Bad Request for missing/malformed body fields', async () => {
      // Mock NextRequest with missing 'password'
      const req = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email: "invalid-email" }) 
      });
      
      const response = await SignupPOST(req);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe('2. UNAUTHENTICATED ACCESS', () => {
    it('should return 401 Unauthorized when no session cookie exists', async () => {
      // Call protected /api/user/delete route without session cookies
      const req = new Request('http://localhost:3000/api/user/delete', { method: 'POST' });
      const response = await DeletePOST(req);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('3. DISPOSABLE EMAIL VALIDATION', () => {
    it('should evaluate burner domains to true (rejected)', () => {
      expect(isDisposableEmail('test@mailinator.com')).toBe(true);
      expect(isDisposableEmail('user@yopmail.com')).toBe(true);
      expect(isDisposableEmail('fake@10minutemail.com')).toBe(true);
    });

    it('should evaluate standard domains to false (accepted)', () => {
      expect(isDisposableEmail('user@gmail.com')).toBe(false);
      expect(isDisposableEmail('admin@company.com')).toBe(false);
      expect(isDisposableEmail('ceo@startup.io')).toBe(false);
    });
  });

  describe('4. RATE LIMITER ASSERTION', () => {
    it('should trigger 429 Too Many Requests on rapid calls', async () => {
      let lastStatus = 200;
      
      // Fire 4 rapid requests against the mocked forgot-password limit of 3
      for (let i = 0; i < 4; i++) {
        const req = new Request('http://localhost:3000/api/auth/forgot-password', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-forwarded-for': '192.168.1.100' // mock IP
          },
          body: JSON.stringify({ email: 'test@example.com' })
        });
        
        const res = await ForgotPasswordPOST(req);
        lastStatus = res.status;
        if (lastStatus === 429) break;
      }
      
      expect(lastStatus).toBe(429);
      expect(authRateLimiter.limit).toHaveBeenCalled();
    });
  });
});
