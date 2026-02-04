-- Create a Test Connected Match for a User
-- USAGE:
-- 1. Sign in to the app (localhost:3000)
-- 2. Open Supabase SQL Editor
-- 3. Replace 'YOUR_CLERK_USER_ID_HERE' with your actual User ID (from Supabase Auth or Clerk Dashboard)
-- 4. Run this script

DO $$
DECLARE
    -- REPLACE THIS WITH YOUR USER ID
    v_clerk_id TEXT := 'YOUR_CLERK_USER_ID_HERE';
    
    v_profile_id UUID;
    v_entity_id UUID;
    v_investor_id UUID;
BEGIN
    -- 1. Get Profile ID
    SELECT id INTO v_profile_id FROM profiles WHERE clerk_user_id = v_clerk_id;
    
    IF v_profile_id IS NULL THEN
        RAISE NOTICE 'Profile not found for Clerk ID %. Attempting to use the most recent profile...', v_clerk_id;
        SELECT id INTO v_profile_id FROM profiles ORDER BY created_at DESC LIMIT 1;
        
        IF v_profile_id IS NULL THEN
            RAISE EXCEPTION 'No profiles found in database. Please sign in first.';
        END IF;
    END IF;

    -- 2. Get or Create Indian Entity
    SELECT id INTO v_entity_id FROM indian_entities WHERE profile_id = v_profile_id;
    
    IF v_entity_id IS NULL THEN
        INSERT INTO indian_entities (company_name, profile_id)
        VALUES ('Test Startup', v_profile_id)
        RETURNING id INTO v_entity_id;
    END IF;

    -- 3. Get an Investor ID (pick random one)
    SELECT id INTO v_investor_id FROM european_investors LIMIT 1;
    
    IF v_investor_id IS NULL THEN
        RAISE EXCEPTION 'No investors found. Please run the seed_investors migration first.';
    END IF;

    -- 4. Create Match
    INSERT INTO matches (indian_entity_id, investor_id, status, initiated_by)
    VALUES (v_entity_id, v_investor_id, 'Connected', 'investor')
    ON CONFLICT (indian_entity_id, investor_id) 
    DO UPDATE SET status = 'Connected';
    
    RAISE NOTICE 'Success! Connected match created for Profile ID: % and Investor ID: %', v_profile_id, v_investor_id;

END $$;
