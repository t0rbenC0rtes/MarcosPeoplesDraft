-- ============================================
-- CLEAR ALL MOCK MEMORIES
-- ============================================
-- Created: December 28, 2025
-- Purpose: Remove all test data to start fresh
-- ============================================

-- Delete all media records first (foreign key dependency)
DELETE FROM media;

-- Delete all memories
DELETE FROM memories;

-- Optional: Reset sequences if you want IDs to start from 1 again
-- ALTER SEQUENCE media_id_seq RESTART WITH 1;
-- ALTER SEQUENCE memories_id_seq RESTART WITH 1;

-- Verify cleanup
SELECT COUNT(*) as memory_count FROM memories;
SELECT COUNT(*) as media_count FROM media;
