import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(req: Request, { params }: { params: { jobId: string } }) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const jobState = await redis.get(`job:${jobId}`);

    if (!jobState) {
      return NextResponse.json({ status: "NOT_FOUND", error: "Job not found or expired" }, { status: 404 });
    }

    // Redis returns objects if using @upstash/redis and the value is JSON.
    // If it's a string, we parse it.
    let parsedState = jobState;
    if (typeof jobState === "string") {
      try {
        parsedState = JSON.parse(jobState);
      } catch (e) {
        // Ignore parse errors if it's somehow just a string
      }
    }

    return NextResponse.json(parsedState, { status: 200 });
  } catch (error: any) {
    console.error("[JOB_POLL_ERROR]", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
