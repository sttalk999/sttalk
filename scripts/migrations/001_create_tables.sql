-- STARTUP TALKING Database Schema
-- Run this in Supabase SQL Editor to create the required tables

-- =====================================================
-- 1. PROFILES TABLE
-- Links Clerk user IDs to platform profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'IndianEntity' CHECK (role IN ('IndianEntity', 'EuropeanInvestor', 'Admin')),
    display_name TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast Clerk user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);

-- =====================================================
-- 2. INDIAN ENTITIES TABLE
-- Stores startup/company information for Indian users
-- =====================================================
CREATE TABLE IF NOT EXISTS indian_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT,
    stage TEXT,
    description TEXT,
    website TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    gst_number TEXT,
    compliance_package TEXT DEFAULT 'None' CHECK (compliance_package IN ('PackageA', 'PackageB', 'None')),
    pitch_deck_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_profile UNIQUE (profile_id)
);

-- Index for profile lookups
CREATE INDEX IF NOT EXISTS idx_indian_entities_profile_id ON indian_entities(profile_id);

-- =====================================================
-- 3. MATCHES TABLE
-- Tracks connections between Indian entities and investors
-- =====================================================
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indian_entity_id UUID REFERENCES indian_entities(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL, -- References european_investors.id
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'TeaserRevealed', 'FullReveal', 'Connected', 'Declined')),
    initiated_by TEXT CHECK (initiated_by IN ('entity', 'investor')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_match UNIQUE (indian_entity_id, investor_id)
);

-- Indexes for match lookups
CREATE INDEX IF NOT EXISTS idx_matches_indian_entity_id ON matches(indian_entity_id);
CREATE INDEX IF NOT EXISTS idx_matches_investor_id ON matches(investor_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- =====================================================
-- 4. MESSAGES TABLE
-- Stores chat messages between matched entities
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL, -- References profiles.id
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for message queries
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- =====================================================
-- 5. UPDATE EUROPEAN_INVESTORS TABLE
-- Add ID column if it doesn't exist (for proper referencing)
-- =====================================================
DO $$
BEGIN
    -- Add id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'european_investors' AND column_name = 'id') THEN
        ALTER TABLE european_investors ADD COLUMN id UUID DEFAULT gen_random_uuid();
        ALTER TABLE european_investors ADD PRIMARY KEY (id);
    END IF;
END $$;

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE indian_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Indian Entities: Similar policies
CREATE POLICY "Indian entities are viewable by everyone"
    ON indian_entities FOR SELECT
    USING (true);

CREATE POLICY "Users can update own entity"
    ON indian_entities FOR UPDATE
    USING (profile_id IN (
        SELECT id FROM profiles
        WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ));

CREATE POLICY "Users can insert own entity"
    ON indian_entities FOR INSERT
    WITH CHECK (profile_id IN (
        SELECT id FROM profiles
        WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ));

-- Matches: Users can view their own matches
CREATE POLICY "Users can view own matches"
    ON matches FOR SELECT
    USING (
        indian_entity_id IN (
            SELECT ie.id FROM indian_entities ie
            JOIN profiles p ON p.id = ie.profile_id
            WHERE p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Messages: Users can view messages from their matches
CREATE POLICY "Users can view messages from their matches"
    ON messages FOR SELECT
    USING (
        match_id IN (
            SELECT m.id FROM matches m
            JOIN indian_entities ie ON ie.id = m.indian_entity_id
            JOIN profiles p ON p.id = ie.profile_id
            WHERE p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_indian_entities_updated_at ON indian_entities;
CREATE TRIGGER update_indian_entities_updated_at
    BEFORE UPDATE ON indian_entities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Done! Tables created successfully.
-- =====================================================
