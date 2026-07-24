-- ==============================================================================
-- 1. ENABLE ROW LEVEL SECURITY (RLS) ON ALL USER-FACING TABLES
-- ==============================================================================
ALTER TABLE "Creator" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Metric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Goal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Fan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FanMemory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RevenueEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebhookEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. STRICT SECURITY POLICIES
--    Uses auth.uid()::text to match the Prisma String ID
-- ==============================================================================

-- 🧑 Creator (Users) Table: Only read/update own row. No public inserts/deletes.
CREATE POLICY "Creators can view their own profile"
ON "Creator" FOR SELECT
USING (auth.uid()::text = id);

CREATE POLICY "Creators can update their own profile"
ON "Creator" FOR UPDATE
USING (auth.uid()::text = id);

-- 📊 Metric Table
CREATE POLICY "Creators can view their own metrics"
ON "Metric" FOR SELECT
USING (auth.uid()::text = "creatorId");

CREATE POLICY "Creators can manage their own metrics"
ON "Metric" FOR ALL
USING (auth.uid()::text = "creatorId");

-- 🎯 Goal Table
CREATE POLICY "Creators can view their own goals"
ON "Goal" FOR SELECT
USING (auth.uid()::text = "creatorId");

CREATE POLICY "Creators can manage their own goals"
ON "Goal" FOR ALL
USING (auth.uid()::text = "creatorId");

-- 👥 Fan Table
CREATE POLICY "Creators can view their own fans"
ON "Fan" FOR SELECT
USING (auth.uid()::text = "creatorId");

CREATE POLICY "Creators can manage their own fans"
ON "Fan" FOR ALL
USING (auth.uid()::text = "creatorId");

-- 💬 Message Table (Must join through Fan)
CREATE POLICY "Creators can view their fans' messages"
ON "Message" FOR SELECT
USING (EXISTS (SELECT 1 FROM "Fan" WHERE "Fan".id = "Message"."fanId" AND "Fan"."creatorId" = auth.uid()::text));

CREATE POLICY "Creators can manage their fans' messages"
ON "Message" FOR ALL
USING (EXISTS (SELECT 1 FROM "Fan" WHERE "Fan".id = "Message"."fanId" AND "Fan"."creatorId" = auth.uid()::text));

-- 🧠 FanMemory Table (Must join through Fan)
CREATE POLICY "Creators can view their fans' memories"
ON "FanMemory" FOR SELECT
USING (EXISTS (SELECT 1 FROM "Fan" WHERE "Fan".id = "FanMemory"."fanId" AND "Fan"."creatorId" = auth.uid()::text));

CREATE POLICY "Creators can manage their fans' memories"
ON "FanMemory" FOR ALL
USING (EXISTS (SELECT 1 FROM "Fan" WHERE "Fan".id = "FanMemory"."fanId" AND "Fan"."creatorId" = auth.uid()::text));

-- 💳 RevenueEvent (Billing & Sensitive)
-- ONLY SELECT access is granted to the public client. 
-- ALL INSERT/UPDATE/DELETE access is blocked. (Must be done via backend Service Role).
CREATE POLICY "Creators can view their own revenue events"
ON "RevenueEvent" FOR SELECT
USING (auth.uid()::text = "creatorId");

-- ==============================================================================
-- 3. HIGH-PERFORMANCE INDEXES
--    Accelerates exact-match foreign keys and chronological sorting
-- ==============================================================================

-- Creator lookups
CREATE INDEX IF NOT EXISTS "idx_creator_id" ON "Creator"(id);
CREATE INDEX IF NOT EXISTS "idx_creator_email" ON "Creator"(email);
CREATE INDEX IF NOT EXISTS "idx_creator_created_at" ON "Creator"("createdAt");

-- Relational lookups (Foreign Keys)
CREATE INDEX IF NOT EXISTS "idx_metric_creator_id" ON "Metric"("creatorId");
CREATE INDEX IF NOT EXISTS "idx_goal_creator_id" ON "Goal"("creatorId");
CREATE INDEX IF NOT EXISTS "idx_fan_creator_id" ON "Fan"("creatorId");
CREATE INDEX IF NOT EXISTS "idx_revenue_event_creator_id" ON "RevenueEvent"("creatorId");

-- Fan sub-relations
CREATE INDEX IF NOT EXISTS "idx_message_fan_id" ON "Message"("fanId");
CREATE INDEX IF NOT EXISTS "idx_memory_fan_id" ON "FanMemory"("fanId");

-- Chronological sorting
CREATE INDEX IF NOT EXISTS "idx_revenue_event_created_at" ON "RevenueEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_fan_created_at" ON "Fan"("createdAt");

-- Webhook status queueing
CREATE INDEX IF NOT EXISTS "idx_webhook_status" ON "WebhookEvent"("status");

-- Note: The requested `price_id` column does not exist in the current Prisma schema,
-- so an index for it was omitted. If it is added later to RevenueEvent, you can run:
-- CREATE INDEX IF NOT EXISTS "idx_revenue_event_price_id" ON "RevenueEvent"("priceId");
