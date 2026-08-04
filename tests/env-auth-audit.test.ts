import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';



import { requireAuth } from '@/utils/supabase/server';

// Mock Supabase client to simulate failed authentication
vi.mock('@/utils/supabase/server', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    createClient: vi.fn().mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }) // simulate unauthenticated
      }
    })
  };
});

describe('Environment Configuration & Security Audit', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('1. Production Safety (Dev/Test Bypasses)', () => {
    it('should allow TEST_MODE bypass in development', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      process.env.TEST_MODE = 'true';
      process.env.TEST_MODE_USER_ID = 'test-id';

      const user = await requireAuth();
      expect(user.id).toBe('test-id');
    });

    it('should strictly BLOCK TEST_MODE bypass in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      process.env.TEST_MODE = 'true'; // A malicious or accidental flag injection
      process.env.TEST_MODE_USER_ID = 'hacked-id';

      // It should fall through to the real Supabase check, which we mocked to fail
      await expect(requireAuth()).rejects.toThrow('Unauthorized');
    });
  });

  describe('2. Strict Environment Variable Validation', () => {
    it('should throw an explicit error on server boot if required env vars are missing', async () => {
      // Clear a required variable
      delete process.env.DATABASE_URL;
      
      // Dynamic import to simulate server boot evaluating the module
      await expect(import('@/lib/env')).rejects.toThrow('Invalid environment variables');
    });

    it('should succeed if all required vars are present', async () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/db';
      process.env.DIRECT_URL = 'postgresql://localhost:5432/db';
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
      vi.stubEnv('NODE_ENV', 'production');

      const mod = await import('@/lib/env');
      expect(mod.env).toBeDefined();
      expect(mod.env.NODE_ENV).toBe('production');
    });
  });
});
