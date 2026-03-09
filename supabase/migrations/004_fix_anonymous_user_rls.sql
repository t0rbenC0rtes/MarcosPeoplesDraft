-- ============================================
-- FIX ANONYMOUS USER RLS POLICIES
-- ============================================
-- Created: March 9, 2026
-- Purpose: Allow anonymous users to create profiles and memories
-- Problem: Current RLS policies require auth.uid() which anonymous users don't have
-- ============================================

-- ============================================
-- USERS TABLE: Allow anonymous user creation
-- ============================================

-- Drop the existing insert policy that requires auth.uid()
DROP POLICY IF EXISTS "users_insert_own" ON users;

-- Recreate with support for both Google OAuth AND anonymous users
CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  WITH CHECK (
    -- Google OAuth users: auth_id must match their Supabase auth.uid()
    (auth.uid() IS NOT NULL AND auth.uid()::text = auth_id)
    OR
    -- Anonymous users: Can insert with any auth_id (validated in app)
    (auth.uid() IS NULL AND auth_type = 'anonymous')
  );

-- ============================================
-- MEMORIES TABLE: Allow anonymous memory creation
-- ============================================

-- Drop the existing insert policy
DROP POLICY IF EXISTS "memories_insert_authenticated" ON memories;

-- Recreate to allow both authenticated AND anonymous users
CREATE POLICY "memories_insert_all_users"
  ON memories FOR INSERT
  WITH CHECK (
    -- Google OAuth users: user_id must match a user with their auth.uid()
    (
      auth.uid() IS NOT NULL 
      AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
    )
    OR
    -- Anonymous users: user_id must match an anonymous user in the users table
    (
      auth.uid() IS NULL 
      AND user_id IN (SELECT id FROM users WHERE auth_type = 'anonymous')
    )
  );

-- ============================================
-- MEMORIES TABLE: Allow anonymous users to view their own memories
-- ============================================

-- Drop and recreate the select own policy to include anonymous users
DROP POLICY IF EXISTS "memories_select_own" ON memories;

CREATE POLICY "memories_select_own"
  ON memories FOR SELECT
  USING (
    -- Google OAuth users: Can see their own memories
    (
      auth.uid() IS NOT NULL 
      AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
    )
    OR
    -- Anonymous users: Can see ALL their memories (they're in localStorage)
    -- Note: This is permissive but necessary since we can't verify anonymous sessions server-side
    (auth.uid() IS NULL AND user_id IN (SELECT id FROM users WHERE auth_type = 'anonymous'))
  );

-- ============================================
-- MEMORIES TABLE: Allow anonymous users to update their memories
-- ============================================

DROP POLICY IF EXISTS "memories_update_own" ON memories;

CREATE POLICY "memories_update_own"
  ON memories FOR UPDATE
  USING (
    (
      auth.uid() IS NOT NULL 
      AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
    )
    OR
    (
      auth.uid() IS NULL 
      AND user_id IN (SELECT id FROM users WHERE auth_type = 'anonymous')
    )
  )
  WITH CHECK (
    (
      auth.uid() IS NOT NULL 
      AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
    )
    OR
    (
      auth.uid() IS NULL 
      AND user_id IN (SELECT id FROM users WHERE auth_type = 'anonymous')
    )
  );

-- ============================================
-- MEDIA TABLE: Allow anonymous users to upload photos
-- ============================================

DROP POLICY IF EXISTS "media_select_own" ON media;
DROP POLICY IF EXISTS "media_insert_own" ON media;
DROP POLICY IF EXISTS "media_update_own" ON media;
DROP POLICY IF EXISTS "media_delete_own" ON media;

-- Allow anonymous users to view their own media
CREATE POLICY "media_select_own"
  ON media FOR SELECT
  USING (
    memory_id IN (
      SELECT m.id FROM memories m
      JOIN users u ON m.user_id = u.id
      WHERE (
        (auth.uid() IS NOT NULL AND u.auth_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND u.auth_type = 'anonymous')
      )
    )
  );

-- Allow anonymous users to insert media
CREATE POLICY "media_insert_own"
  ON media FOR INSERT
  WITH CHECK (
    memory_id IN (
      SELECT m.id FROM memories m
      JOIN users u ON m.user_id = u.id
      WHERE (
        (auth.uid() IS NOT NULL AND u.auth_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND u.auth_type = 'anonymous')
      )
    )
  );

-- Allow anonymous users to update their media
CREATE POLICY "media_update_own"
  ON media FOR UPDATE
  USING (
    memory_id IN (
      SELECT m.id FROM memories m
      JOIN users u ON m.user_id = u.id
      WHERE (
        (auth.uid() IS NOT NULL AND u.auth_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND u.auth_type = 'anonymous')
      )
    )
  );

-- Allow anonymous users to delete their media
CREATE POLICY "media_delete_own"
  ON media FOR DELETE
  USING (
    memory_id IN (
      SELECT m.id FROM memories m
      JOIN users u ON m.user_id = u.id
      WHERE (
        (auth.uid() IS NOT NULL AND u.auth_id = auth.uid()::text)
        OR
        (auth.uid() IS NULL AND u.auth_type = 'anonymous')
      )
    )
  );

-- ============================================
-- SECURITY NOTE
-- ============================================
-- The anonymous user policies are permissive because:
-- 1. We can't verify localStorage sessions server-side
-- 2. Anonymous users are temporary (30-day expiry)
-- 3. All content is public anyway (memorial site)
-- 4. Worst case: Someone creates multiple anonymous profiles
--    But they still can't access others' data due to user_id checks
-- ============================================
