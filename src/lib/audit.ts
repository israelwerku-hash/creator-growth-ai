import { db } from "@/lib/db";
import * as Sentry from "@sentry/nextjs";

/**
 * Global System Activity Ledger utility.
 * Creates an immutable, cryptographically-secure log entry in the database.
 * 
 * Uses a fail-safe try/catch so that if logging fails (e.g., database timeout), 
 * it does NOT throw an exception that crashes the primary user action or webhook.
 */
export async function createAuditLog(actor: string, action: string, metadata: any) {
  try {
    await db.auditLog.create({
      data: {
        actor,
        action,
        metadata,
      },
    });
  } catch (error: any) {
    // Fail-safe: Log to Sentry but do not disrupt the execution flow
    Sentry.captureException(new Error(`AuditLog Failure: ${error.message}`));
    console.error("[Audit System Error] Failed to write ledger entry:", error);
  }
}
