-- 1. Create the 'avatars' bucket (Public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS (Row Level Security) - Just in case
-- storage.objects is usually enabled by default, but policies are needed.

-- POLICY 1: Public Read Access
-- Allow anyone to view avatars (needed for generated public profile links etc)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- POLICY 2: Authenticated Uploads
-- Allow any logged-in user to upload a file to the avatars bucket
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK ( 
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated' 
);

-- POLICY 3: Owner Update/Delete
-- Users can only modify their own uploaded files
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.uid() = owner );

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' AND auth.uid() = owner );
