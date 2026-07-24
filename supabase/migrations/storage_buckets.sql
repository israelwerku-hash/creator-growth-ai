-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('user-assets', 'user-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on the objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for the 'avatars' bucket

-- Allow public read access to all avatars
CREATE POLICY "Public Access for Avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload avatars only to their own folder path
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);


-- 4. RLS Policies for the 'user-assets' bucket

-- Allow public read access to all user assets
CREATE POLICY "Public Access for User Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'user-assets' );

-- Allow authenticated users to upload assets only to their own folder path
CREATE POLICY "Users can upload their own user-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-assets' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own user-assets
CREATE POLICY "Users can update their own user-assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-assets' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own user-assets
CREATE POLICY "Users can delete their own user-assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-assets' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
