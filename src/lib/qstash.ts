import { Client } from "@upstash/qstash";

// Instantiate the QStash Client
// It automatically picks up QSTASH_TOKEN from process.env if available,
// but we explicitly pass it for clarity.
export const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || "",
});

/**
 * Publishes a background job to Upstash QStash.
 * 
 * @param destinationUrl The fully qualified URL of your worker endpoint (e.g., https://yourapp.com/api/jobs/process-ai)
 * @param payload The JSON payload to send to the worker
 * @returns The message ID returned by QStash
 */
export async function publishBackgroundJob(destinationUrl: string, payload: Record<string, any>) {
  try {
    const response = await qstashClient.publishJSON({
      url: destinationUrl,
      body: payload,
      // You can also add retries, delays, etc. here if needed
      // retries: 3, 
    });
    return response.messageId;
  } catch (error: any) {
    console.error("[QStash Publish Error]:", error.message);
    throw error;
  }
}
