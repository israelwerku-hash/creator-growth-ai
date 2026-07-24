-- Enable RLS on all tables
ALTER TABLE "Creator" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Metric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Goal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Fan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FanMemory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RevenueEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FeatureFlag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebhookEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- By default, when RLS is enabled, all access is denied unless a policy exists.
-- Since the application uses Prisma with a direct database connection,
-- Prisma bypasses RLS automatically (since the connection uses the admin/superuser role).
-- However, if anyone uses the Supabase anon/authenticated keys via PostgREST on the frontend, 
-- they will hit RLS. Because there are no policies defined, they will be denied all access.
-- This effectively blocks all direct client-side PostgREST requests, enforcing all logic through our secure Next.js API.
