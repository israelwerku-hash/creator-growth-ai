import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv'

// Load .env files for tests
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/server': path.resolve(__dirname, './tests/__mocks__/next-server.ts'),
      'next/headers': path.resolve(__dirname, './tests/__mocks__/next-headers.ts')
    },
    setupFiles: ['./vitest.setup.ts']
  }
})
