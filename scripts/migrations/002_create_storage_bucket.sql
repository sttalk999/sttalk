-- STARTUP TALKING Storage Setup
-- Run this in Supabase SQL Editor to create the pitch-decks storage bucket

-- =====================================================
-- 1. CREATE STORAGE BUCKET
-- =====================================================

-- Insert the bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pitch-decks',
    'pitch-decks',
    false,  -- Private bucket (requires auth to access)
    26214400,  -- 25MB limit
    ARRAY['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- 2. STORAGE POLICIES
-- =====================================================

-- Policy: Allow authenticated users to upload their own files
-- Files are stored as: {user_id}/{filename}
CREATE POLICY "Users can upload their own pitch decks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'pitch-decks' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to read their own files
CREATE POLICY "Users can read their own pitch decks"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'pitch-decks' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update their own files
CREATE POLICY "Users can update their own pitch decks"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'pitch-decks' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own files
CREATE POLICY "Users can delete their own pitch decks"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'pitch-decks' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow investors to read pitch decks of matched entities
-- (This requires a match with status 'TeaserRevealed', 'FullReveal', or 'Connected')
CREATE POLICY "Investors can read matched entity pitch decks"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'pitch-decks' AND
    EXISTS (
        SELECT 1 FROM matches m
        JOIN indian_entities ie ON ie.id = m.indian_entity_id
        JOIN profiles p ON p.id = ie.id
        WHERE
            p.clerk_user_id = (storage.foldername(name))[1] AND
            m.status IN ('TeaserRevealed', 'FullReveal', 'Connected') AND
            EXISTS (
                SELECT 1 FROM profiles investor_profile
                WHERE investor_profile.clerk_user_id = auth.uid()::text
                AND investor_profile.role = 'EuropeanInvestor'
            )
    )
);

-- =====================================================
-- Done! Storage bucket created successfully.
-- =====================================================
