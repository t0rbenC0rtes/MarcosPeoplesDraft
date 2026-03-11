-- ============================================
-- REMOVE ANONYMOUS EDITING CAPABILITIES
-- ============================================
-- Created: March 11, 2026
-- Purpose: Remove update/delete permissions for anonymous users
-- Reason: Cannot verify localStorage sessions server-side, creating security vulnerability
-- Impact: Anonymous users can still CREATE memories but cannot UPDATE or DELETE them
-- ============================================

-- ============================================
-- MEMORIES TABLE: Remove anonymous update permissions
-- ============================================

DROP POLICY IF EXISTS "memories_update_own" ON memories;

-- Recreate policy for authenticated users ONLY
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

-- ============================================
-- MEMORIES TABLE: Remove anonymous delete permissions
-- ============================================

-- Note: There was no explicit DELETE policy for memories in previous migrations
-- The soft-delete happens via UPDATE (setting is_deleted = true)
-- So the UPDATE policy restriction above handles this

-- ============================================
-- MEDIA TABLE: Remove anonymous update/delete permissions
-- ============================================

DROP POLICY IF EXISTS "media_update_own" ON media;
DROP POLICY IF EXISTS "media_delete_own" ON media;

-- Recreate update policy for authenticated users ONLY
CREATE POLICY "media_update_own"
  ON media FOR UPDATE
  USING (
    memory_id IN (
      SELECT m.id FROM memories m
      JOIN users u ON m.user_id = u.id
      WHERE auth.uid() IS NOT NULL AND u.auth_id = auth.uid()::text
    )
  );

-- Recreate delete policy for authenticated users ONLY
CREATE POLICY "media_delete_own"
  ON media FOR DELETE
  USING (
    memory_id IN (
      SELECT m.id FROM memories m
      JOIN users u ON m.user_id = u.id
      WHERE auth.uid() IS NOT NULL AND u.auth_id = auth.uid()::text
    )
  );

-- ============================================
-- SUMMARY OF CHANGES
-- ============================================
-- ✅ Anonymous users can: Sign in, create profiles, create memories, upload media
-- ❌ Anonymous users cannot: Update memories, delete memories, update media, delete media
-- ✅ Authenticated users retain all permissions
-- ============================================
