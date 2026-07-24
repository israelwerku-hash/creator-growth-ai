// @ts-nocheck
import 'dotenv/config';
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // This is for CLI commands (like db push)
    url: env('DIRECT_URL'), 
  },
});