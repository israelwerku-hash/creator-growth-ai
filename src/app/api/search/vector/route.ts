import { NextResponse } from "next/server";
import { searchSimilarDocuments } from "@/lib/vector";
import { requireAuth } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    // 1. Authenticate User
    let activeUser;
    try {
      activeUser = await requireAuth();
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Request Body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { queryEmbedding, threshold = 0.5, limit = 5 } = body;

    // We expect the client to have already converted the search text into an embedding vector
    // via OpenAI or another provider before hitting this endpoint.
    if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
      return NextResponse.json(
        { error: "Missing or invalid queryEmbedding array." }, 
        { status: 400 }
      );
    }

    // 3. Execute Vector Search
    const results = await searchSimilarDocuments(
      queryEmbedding, 
      activeUser.id, 
      threshold, 
      limit
    );

    return NextResponse.json({ success: true, data: results }, { status: 200 });

  } catch (error: any) {
    console.error("[Vector Search API Error]:", error.message);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
