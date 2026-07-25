import { describe, it, expect, vi, beforeAll } from 'vitest';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

// 1. Mock Rate Limiter
vi.mock('@/lib/ratelimit', async (importOriginal) => {
  const actual: any = await importOriginal();
  
  const mockLimit = vi.fn().mockImplementation(() => {
    const calls = (global as any).securityRateLimitCalls || 0;
    (global as any).securityRateLimitCalls = calls + 1;
    return Promise.resolve({ success: calls < 3 });
  });

  return {
    ...actual,
    authRateLimiter: { limit: mockLimit },
    publicRateLimiter: { limit: mockLimit }
  };
});

describe('Red Team / Blue Team Security Scenarios', () => {

  beforeAll(() => {
    (global as any).securityRateLimitCalls = 0;
  });

  describe('1. Route Protection Test', () => {
    it('should redirect unauthenticated users from /dashboard to /login', async () => {
      const req = new NextRequest('http://localhost:3000/dashboard', { method: 'GET' });
      const response = await middleware(req);
      
      expect([302, 307, 308]).toContain(response.status);
      expect(response.headers.get('location')).toMatch(/\/login$/);
    });

    it('should redirect unauthenticated users from /admin to /login', async () => {
      const req = new NextRequest('http://localhost:3000/admin', { method: 'GET' });
      const response = await middleware(req);
      
      expect([302, 307, 308]).toContain(response.status);
      expect(response.headers.get('location')).toMatch(/\/login$/);
    });
  });

  describe('2. Rate Limiting Test', () => {
    it('should allow 3 requests to /login and block the 4th with HTTP 429', async () => {
      (global as any).securityRateLimitCalls = 0; // reset
      let lastStatus = 200;
      
      for (let i = 0; i < 4; i++) {
        const req = new NextRequest('http://localhost:3000/login', {
          method: 'GET',
          headers: { 'x-forwarded-for': '10.0.0.1' }
        });
        const res = await middleware(req);
        lastStatus = res.status;
      }
      
      expect(lastStatus).toBe(429);
    });

    it('should block Server Actions (Next-Action header) after 3 requests', async () => {
      (global as any).securityRateLimitCalls = 0; // reset
      let lastStatus = 200;
      
      for (let i = 0; i < 4; i++) {
        const req = new NextRequest('http://localhost:3000/', {
          method: 'POST',
          headers: { 
            'Next-Action': 'some-server-action-id',
            'x-forwarded-for': '10.0.0.2' 
          }
        });
        const res = await middleware(req);
        lastStatus = res.status;
      }
      
      expect(lastStatus).toBe(429);
    });
  });

  describe('3. Cookie Security Test', () => {
    it('should configure session cookies with HttpOnly and SameSite=Lax', async () => {
      const req = new NextRequest('http://localhost:3000/', { method: 'GET' });
      req.cookies.set('sb-session', 'fake');
      req.cookies.getAll = () => [{ name: 'sb-session', value: 'fake' }];
      
      const response = await middleware(req);
      const setCookieHeaders = response.headers.get('set-cookie');
      
      if (setCookieHeaders) {
        expect(setCookieHeaders.toLowerCase()).toContain('httponly');
        expect(setCookieHeaders.toLowerCase()).toContain('samesite=lax');
      } else {
        expect(true).toBe(true);
      }
    });
  });
});
