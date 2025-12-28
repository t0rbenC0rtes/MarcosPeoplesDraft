-- ============================================
-- FIX INFINITE RECURSION IN POLICIES
-- ============================================
-- Created: December 28, 2025
-- Purpose: Fix infinite recursion error caused by circular policy dependencies
-- Issue: media → memories → moderators creates recursion chain
-- Solution: Simplify all policies to avoid cross-table checks during INSERT
-- ============================================

-- ============================================
-- FIX MEMORIES POLICIES (remove moderator checks that cause recursion)
-- ============================================

-- Drop the problematic moderator update policy
DROP POLICY IF EXISTS "memories_moderator_update" ON memories;

-- ============================================
-- FIX MEDIA POLICIES (remove all subqueries)
-- ============================================

-- Drop ALL existing media policies (both old and new names)
DROP POLICY IF EXISTS "media_select_public" ON media;
DROP POLICY IF EXISTS "media_select_own" ON media;
DROP POLICY IF EXISTS "media_select_all" ON media;
DROP POLICY IF EXISTS "media_insert_own" ON media;
DROP POLICY IF EXISTS "media_insert_authenticated" ON media;
DROP POLICY IF EXISTS "media_update_own" ON media;
DROP POLICY IF EXISTS "media_update_authenticated" ON media;
DROP POLICY IF EXISTS "media_delete_own" ON media;
DROP POLICY IF EXISTS "media_delete_authenticated" ON media;

-- Create simplified SELECT policy - anyone can view all media
CREATE POLICY "media_select_all"
  ON media FOR SELECT
  USING (true);

-- Create simplified INSERT policy - authenticated users can insert
CREATE POLICY "media_insert_authenticated"
  ON media FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create simplified UPDATE policy - authenticated users can update
CREATE POLICY "media_update_authenticated"
  ON media FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create simplified DELETE policy - authenticated users can delete
CREATE POLICY "media_delete_authenticated"
  ON media FOR DELETE
  USING (auth.uid() IS NOT NULL);
