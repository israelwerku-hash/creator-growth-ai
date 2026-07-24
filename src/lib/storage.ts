import { createClient } from '@supabase/supabase-js';

// We initialize a single client for storage operations.
// Note: If this is used on the client-side, NEXT_PUBLIC variables will be securely injected.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * 
 * @param bucketName - The name of the storage bucket (e.g., 'avatars').
 * @param path - The path inside the bucket, usually prefixed with the user's ID for RLS.
 * @param file - The File object to upload.
 * @returns The public URL of the uploaded file.
 * @throws Error if the upload fails.
 */
export async function uploadUserFile(bucketName: string, path: string, file: File): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true, // Overwrite if it already exists
    });

  if (error) {
    console.error(`[Storage Upload Error]: Failed to upload to ${bucketName}/${path}`, error.message);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Retrieve the public URL for the newly uploaded file
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
