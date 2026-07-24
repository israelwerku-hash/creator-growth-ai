-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Create a table to store your documents
CREATE TABLE document_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  -- 1536 is the standard dimension for OpenAI embeddings (e.g., text-embedding-ada-002 or text-embedding-3-small)
  embedding vector(1536),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index to speed up similarity search
-- Adjust the lists and probes according to your dataset size for optimal performance
CREATE INDEX ON document_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable Row Level Security (RLS)
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

-- Allow users to select only their own embeddings
CREATE POLICY "Users can view their own embeddings"
ON document_embeddings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to insert their own embeddings
CREATE POLICY "Users can insert their own embeddings"
ON document_embeddings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to update their own embeddings
CREATE POLICY "Users can update their own embeddings"
ON document_embeddings FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Allow users to delete their own embeddings
CREATE POLICY "Users can delete their own embeddings"
ON document_embeddings FOR DELETE
TO authenticated
USING (user_id = auth.uid());


-- Create a function to search for documents
-- Using cosine distance (<=>) for similarity
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
    AND document_embeddings.user_id = p_user_id
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;
