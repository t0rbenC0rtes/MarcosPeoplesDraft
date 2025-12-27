-- ============================================
-- MARCOSPEOPLES.COM ROW LEVEL SECURITY POLICIES
-- Memorial Website for Marcos Peebles (1972-2025)
-- ============================================
-- Created: December 27, 2025
-- Purpose: Configure RLS policies for all tables
-- Reference: roadmap/phase1.2_rls_policies.md
-- ============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Policy: Anyone can view user profiles (public fields only)
CREATE POLICY "users_select_public"
  ON users FOR SELECT
  USING (true);

-- Policy: Users can insert their own profile (during signup)
CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = auth_id);

-- Policy: Users can update their own profile
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid()::text = auth_id)
  WITH CHECK (auth.uid()::text = auth_id);

-- Policy: Users cannot delete profiles (soft delete via app logic if needed)
-- No DELETE policy = no one can delete

-- ============================================
-- MEMORIES TABLE POLICIES
-- ============================================

-- Policy: Anyone can view visible memories
CREATE POLICY "memories_select_public"
  ON memories FOR SELECT
  USING (is_hidden = false AND is_deleted = false);

-- Policy: Authenticated users can view their own hidden/deleted memories
CREATE POLICY "memories_select_own"
  ON memories FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
  );

-- Policy: Authenticated users can insert memories
CREATE POLICY "memories_insert_authenticated"
  ON memories FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
  );

-- Policy: Users can update their own memories
CREATE POLICY "memories_update_own"
  ON memories FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
  );

-- Policy: Users can soft-delete their own memories (set is_deleted = true)
CREATE POLICY "memories_delete_own"
  ON memories FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
  )
  WITH CHECK (is_deleted = true);

-- Policy: Moderators can update any memory (hide/unhide) - Phase 5
-- Note: For Phase 1-4, moderation happens via Supabase Dashboard
CREATE POLICY "memories_moderator_update"
  ON memories FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM moderators m
      JOIN users u ON m.user_id = u.id
      WHERE u.auth_id = auth.uid()::text
    )
  );

-- ============================================
-- MEDIA TABLE POLICIES
-- ============================================

-- Policy: Anyone can view media (photos are public)
CREATE POLICY "media_select_public"
  ON media FOR SELECT
  USING (
    memory_id IN (
      SELECT id FROM memories WHERE is_hidden = false AND is_deleted = false
    )
  );

-- Policy: Memory owners can view their own media (even if memory is hidden/deleted)
CREATE POLICY "media_select_own"
  ON media FOR SELECT
  USING (
    memory_id IN (
      SELECT m.id FROM memories m
      JOIN users u ON m.user_id = u.id
      WHERE u.auth_id = auth.uid()::text
    )
  );

-- Policy: Memory owners can insert media
CREATE POLICY "media_insert_own"
  ON media FOR INSERT
  WITH CHECK (
    memory_id IN (
      SELECT m.id FROM memories m
      JOIN users u ON m.user_id = u.id
      WHERE u.auth_id = auth.uid()::text
    )
  );

-- Policy: Memory owners can update their own media (change display_order)
CREATE POLICY "media_update_own"
  ON media FOR UPDATE
  USING (
    memory_id IN (
      SELECT m.id FROM memories m
      JOIN users u ON m.user_id = u.id
      WHERE u.auth_id = auth.uid()::text
    )
  );

-- Policy: Memory owners can delete their own media
CREATE POLICY "media_delete_own"
  ON media FOR DELETE
  USING (
    memory_id IN (
      SELECT m.id FROM memories m
      JOIN users u ON m.user_id = u.id
      WHERE u.auth_id = auth.uid()::text
    )
  );

-- ============================================
-- REPORTS TABLE POLICIES
-- ============================================

-- Policy: Only moderators can view reports
CREATE POLICY "reports_select_moderators"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM moderators m
      JOIN users u ON m.user_id = u.id
      WHERE u.auth_id = auth.uid()::text
    )
  );

-- Policy: Authenticated users can report content
CREATE POLICY "reports_insert_authenticated"
  ON reports FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND reporter_user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
  );

-- Policy: Moderators can update report status
CREATE POLICY "reports_update_moderators"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM moderators m
      JOIN users u ON m.user_id = u.id
      WHERE u.auth_id = auth.uid()::text
    )
  );

-- Policy: No one can delete reports (audit trail)
-- No DELETE policy = no one can delete

-- ============================================
-- TRANSLATIONS TABLE POLICIES
-- ============================================

-- Policy: Anyone can view translations (public content)
CREATE POLICY "translations_select_public"
  ON translations FOR SELECT
  USING (true);

-- Policy: System/Edge Functions can insert translations
-- Note: Edge Functions use service role key, not affected by RLS
CREATE POLICY "translations_insert_system"
  ON translations FOR INSERT
  WITH CHECK (true);

-- Policy: System can update translations (refresh cache)
CREATE POLICY "translations_update_system"
  ON translations FOR UPDATE
  USING (true);

-- Policy: No one can delete translations (cache persistence)
-- No DELETE policy = no one can delete

-- ============================================
-- MODERATORS TABLE POLICIES
-- ============================================

-- Policy: Only moderators can view the moderators list
CREATE POLICY "moderators_select_moderators"
  ON moderators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM moderators m
      JOIN users u ON m.user_id = u.id
      WHERE u.auth_id = auth.uid()::text
    )
  );

-- Policy: Only moderators can add new moderators
CREATE POLICY "moderators_insert_moderators"
  ON moderators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM moderators m
      JOIN users u ON m.user_id = u.id
      WHERE u.auth_id = auth.uid()::text
    )
  );

-- Policy: Moderators can update their own notification preferences
CREATE POLICY "moderators_update_own"
  ON moderators FOR UPDATE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()::text)
  );

-- Policy: Only moderators can remove moderators
CREATE POLICY "moderators_delete_moderators"
  ON moderators FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM moderators m
      JOIN users u ON m.user_id = u.id
      WHERE u.auth_id = auth.uid()::text
    )
  );

-- ============================================
-- STORAGE POLICIES (BUCKETS)
-- ============================================
-- Note: These policies are applied via Supabase Dashboard:
-- Storage > Policies, not via SQL Editor
--
-- BUCKET: memories-photos
-- - SELECT: Public (anyone can view)
-- - INSERT: Authenticated users only
-- - UPDATE: Memory owners only
-- - DELETE: Memory owners only
--
-- BUCKET: memories-thumbnails
-- - SELECT: Public (anyone can view)
-- - INSERT: System/Edge Functions only
-- - UPDATE: System only
-- - DELETE: Memory owners only
-- ============================================

-- ============================================
-- HELPER FUNCTION: Check if user is moderator
-- ============================================

CREATE OR REPLACE FUNCTION is_moderator(user_auth_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM moderators m
    JOIN users u ON m.user_id = u.id
    WHERE u.auth_id = user_auth_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify RLS policies are active:
--
-- 1. Check RLS is enabled on all tables:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;
--
-- 2. List all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
--
-- 3. Test public access (should succeed):
-- SELECT COUNT(*) FROM memories WHERE is_hidden = false AND is_deleted = false;
--
-- 4. Test authenticated write (should succeed with valid auth):
-- INSERT INTO memories (user_id, location_name, latitude, longitude, coordinates)
-- VALUES ('your-user-id', 'Test Location', 50.8503, 4.3517, ST_SetSRID(ST_MakePoint(4.3517, 50.8503), 4326));
-- ============================================

-- RLS Configuration complete!
-- Next steps:
-- 1. Set up Storage buckets and policies
-- 2. Configure Google OAuth authentication
-- 3. Test authentication and data access
