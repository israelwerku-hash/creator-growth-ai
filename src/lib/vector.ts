import { createClient } from "@supabase/supabase-js";

// Initialize a client for vector operations (assuming server-side execution mostly)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// For server-side operations, use SERVICE_ROLE_KEY to bypass RLS if doing background processing,
// but since we want to respect RLS or explicitly pass the userId to the RPC, we can use ANON_KEY.
// The RPC function matches based on the passed p_user_id anyway.
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Searches for similar documents using pgvector cosine similarity.
 * 
 * @param queryEmbedding - The embedding vector to compare against (e.g., from OpenAI).
 * @param userId - The user ID to scope the search to.
 * @param threshold - The similarity threshold (0 to 1). Higher means more strict.
 * @param limit - The maximum number of documents to return.
 * @returns Array of matching documents.
 */
export async function searchSimilarDocuments(
  queryEmbedding: number[], 
  userId: string, 
  threshold = 0.5, 
  limit = 5
) {
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
    p_user_id: userId
  });

  if (error) {
    console.error("[Vector Search Error]:", error.message);
    throw new Error(`Failed to search documents: ${error.message}`);
  }

  return data;
}

/**
 * Stores a new document with its vector embedding.
 * 
 * @param userId - The ID of the user who owns this document.
 * @param content - The raw text content.
 * @param embedding - The 1536-dimensional vector embedding.
 * @param metadata - Optional JSON metadata.
 */
export async function storeDocumentEmbedding(
  userId: string,
  content: string,
  embedding: number[],
  metadata?: Record<string, any>
) {
  const { data, error } = await supabase
    .from('document_embeddings')
    .insert({
      user_id: userId,
      content,
      embedding,
      metadata: metadata || {}
    })
    .select()
    .single();

  if (error) {
    console.error("[Vector Store Error]:", error.message);
    throw new Error(`Failed to store document embedding: ${error.message}`);
  }

  return data;
}
