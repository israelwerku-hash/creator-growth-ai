import { beforeAll, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Next.js headers/cookies which usually fail outside of the app router context
vi.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => [],
    setAll: () => {},
    get: () => undefined,
  }),
  headers: () => new Headers(),
}));

// Mock Next/Navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  redirect: vi.fn(),
}));
