import { describe, it, expect, vi, beforeAll } from 'vitest';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

// Mock rate limiters so they don't block the security tests
vi.mock('@/lib/ratelimit', async (importOriginal) => {
  const actual: any = await importOriginal();
  const mockLimit = vi.fn().mockResolvedValue({ success: true });
  return {
    ...actual,
    authRateLimiter: { limit: mockLimit },
    publicRateLimiter: { limit: mockLimit },
    aiRateLimiter: { limit: mockLimit },
  };
});

describe('Security: CORS & CSRF Hardening', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://creator.growth.ai';
  });

  describe('1. CSRF/Origin Anti-Forgery Protection', () => {
    it('should REJECT mutating POST requests from an untrusted Origin (CSRF attack)', async () => {
      const req = new NextRequest('https://creator.growth.ai/api/users/update', {
        method: 'POST',
        headers: {
          'Origin': 'https://evil-hacker-site.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ malicious: true })
      });

      const response = await middleware(req);
      
      // Should strictly block with 403
      expect(response.status).toBe(403);
      const responseData = await response.json();
      expect(responseData.error).toContain('Invalid Origin');
    });

    it('should REJECT mutating requests if both Origin and Referer are missing (strict CSRF mode)', async () => {
      const req = new NextRequest('https://creator.growth.ai/api/users/delete', {
        method: 'DELETE',
        headers: {
          // No Origin, No Referer
        }
      });

      const response = await middleware(req);
      expect(response.status).toBe(403);
      const responseData = await response.json();
      expect(responseData.error).toContain('CSRF token missing or invalid source');
    });
  });

  describe('2. Valid Origin Safelisting', () => {
    it('should ALLOW mutating requests from the exact NEXT_PUBLIC_APP_URL origin', async () => {
      const req = new NextRequest('https://creator.growth.ai/api/data', {
        method: 'POST',
        headers: {
          'Origin': 'https://creator.growth.ai',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ safe: true })
      });

      const response = await middleware(req);
      
      // Should pass the middleware without returning a 403 Forbidden
      expect(response.status).not.toBe(403);
      
      // Should inject strict CORS headers dynamically instead of hardcoded localhost
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://creator.growth.ai');
    });

    it('should ALLOW mutating requests utilizing a valid Referer if Origin is omitted (e.g. standard HTML forms)', async () => {
      const req = new NextRequest('https://creator.growth.ai/api/submit', {
        method: 'POST',
        headers: {
          'Referer': 'https://creator.growth.ai/dashboard'
        }
      });

      const response = await middleware(req);
      expect(response.status).not.toBe(403);
    });
  });
});
