-- ============================================
-- MARCOSPEOPLES.COM DATABASE SCHEMA
-- Memorial Website for Marcos Peebles (1972-2025)
-- ============================================
-- Created: December 27, 2025
-- Purpose: Complete database setup for Supabase
-- ============================================

-- Enable PostGIS extension for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: USERS
-- ============================================
-- Stores user profiles for both Google OAuth and Anonymous users
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Authentication fields
  auth_id TEXT UNIQUE NOT NULL,  -- Supabase auth.uid() for Google, generated UUID for anonymous
  auth_type TEXT NOT NULL CHECK (auth_type IN ('google', 'anonymous')),
  
  -- Profile fields
  name TEXT NOT NULL,
  email TEXT,  -- Only for Google OAuth users
  profile_pic_url TEXT,  -- Only for Google OAuth users
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for users table
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_auth_type ON users(auth_type);

-- ============================================
-- TABLE 2: MEMORIES
-- ============================================
-- Core table storing all memory submissions
-- ============================================

CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Ownership
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT,  -- Optional, max 500 characters (enforced in app)
  story TEXT,  -- Optional, max 10000 characters (enforced in app)
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'fr', 'es', 'nl', 'pt')),
  
  -- Time classification
  time_period TEXT,  -- "1970s", "1980s", etc.
  year INTEGER CHECK (year >= 1972 AND year <= 2025),
  
  -- Location (structured)
  location_name TEXT NOT NULL,  -- "Brussels, Belgium"
  city TEXT,
  country TEXT,
  
  -- Geographic coordinates (PostGIS)
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Categorization
  tags TEXT[] DEFAULT '{}',  -- Array of tags
  
  -- Media stats
  photo_count INTEGER DEFAULT 0 NOT NULL CHECK (photo_count >= 0),
  
  -- Moderation flags
  is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for memories table
CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_memories_year ON memories(year);
CREATE INDEX idx_memories_time_period ON memories(time_period);
CREATE INDEX idx_memories_language ON memories(language);
CREATE INDEX idx_memories_coordinates ON memories USING GIST(coordinates);
CREATE INDEX idx_memories_tags ON memories USING GIN(tags);
CREATE INDEX idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX idx_memories_is_hidden ON memories(is_hidden);
CREATE INDEX idx_memories_is_deleted ON memories(is_deleted);

-- Composite index for public queries (most common filter)
CREATE INDEX idx_memories_visible ON memories(is_hidden, is_deleted) WHERE is_hidden = FALSE AND is_deleted = FALSE;

-- Full-text search indexes (for search functionality)
CREATE INDEX idx_memories_title_search ON memories USING GIN(to_tsvector('english', COALESCE(title, '')));
CREATE INDEX idx_memories_story_search ON memories USING GIN(to_tsvector('english', COALESCE(story, '')));

-- ============================================
-- TABLE 3: MEDIA
-- ============================================
-- Stores photo attachments for memories
-- ============================================

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationship
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  
  -- File information
  file_url TEXT NOT NULL,  -- URL to original photo in Supabase Storage
  thumbnail_url TEXT NOT NULL,  -- URL to thumbnail (auto-generated)
  file_type TEXT DEFAULT 'image' NOT NULL,  -- 'image' (extensible for video later)
  
  -- Gallery order
  display_order INTEGER DEFAULT 0 NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for media table
CREATE INDEX idx_media_memory_id ON media(memory_id);
CREATE INDEX idx_media_display_order ON media(memory_id, display_order);

-- ============================================
-- TABLE 4: REPORTS
-- ============================================
-- Tracks content moderation reports
-- ============================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Report details
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Report content
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'incorrect', 'other')),
  details TEXT,  -- Optional explanation
  
  -- Status tracking
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  
  -- Moderator review
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  moderator_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for reports table
CREATE INDEX idx_reports_memory_id ON reports(memory_id);
CREATE INDEX idx_reports_reporter_user_id ON reports(reporter_user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Unique constraint: One report per user per memory
CREATE UNIQUE INDEX idx_reports_unique_user_memory ON reports(reporter_user_id, memory_id);

-- ============================================
-- TABLE 5: TRANSLATIONS
-- ============================================
-- Caches translated memory content
-- ============================================

CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationship
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  
  -- Language info
  source_language TEXT NOT NULL CHECK (source_language IN ('en', 'fr', 'es', 'nl', 'pt')),
  target_language TEXT NOT NULL CHECK (target_language IN ('en', 'fr', 'es', 'nl', 'pt')),
  
  -- Translated content
  translated_title TEXT,
  translated_story TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for translations table
CREATE INDEX idx_translations_memory_id ON translations(memory_id);
CREATE INDEX idx_translations_target_language ON translations(target_language);

-- Unique constraint: One translation per memory per target language
CREATE UNIQUE INDEX idx_translations_unique_memory_lang ON translations(memory_id, target_language);

-- ============================================
-- TABLE 6: MODERATORS
-- ============================================
-- Manages list of users with moderation privileges
-- ============================================

CREATE TABLE IF NOT EXISTS moderators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Moderator identity
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  
  -- Notification preferences
  notification_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for moderators table
CREATE INDEX idx_moderators_user_id ON moderators(user_id);
CREATE INDEX idx_moderators_email ON moderators(email);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Auto-update updated_at timestamp on memories
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update photo_count when media is added/removed
CREATE OR REPLACE FUNCTION update_memory_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE memories
    SET photo_count = photo_count + 1
    WHERE id = NEW.memory_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE memories
    SET photo_count = photo_count - 1
    WHERE id = OLD.memory_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_media_insert_update_count
  AFTER INSERT ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_memory_photo_count();

CREATE TRIGGER trigger_media_delete_update_count
  AFTER DELETE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_memory_photo_count();

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Function: Get memories within geographic bounds (for map viewport)
CREATE OR REPLACE FUNCTION get_memories_in_bounds(
  min_lat DECIMAL,
  max_lat DECIMAL,
  min_lng DECIMAL,
  max_lng DECIMAL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  location_name TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  year INTEGER,
  photo_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.location_name,
    m.latitude,
    m.longitude,
    m.year,
    m.photo_count
  FROM memories m
  WHERE 
    m.latitude BETWEEN min_lat AND max_lat
    AND m.longitude BETWEEN min_lng AND max_lng
    AND m.is_hidden = FALSE
    AND m.is_deleted = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function: Get memories near a specific location (radius search)
CREATE OR REPLACE FUNCTION get_memories_nearby(
  search_lat DECIMAL,
  search_lng DECIMAL,
  radius_km DECIMAL,
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  location_name TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.location_name,
    m.latitude,
    m.longitude,
    ST_Distance(
      m.coordinates::geography,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
    ) / 1000 AS distance_km
  FROM memories m
  WHERE 
    ST_DWithin(
      m.coordinates::geography,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography,
      radius_km * 1000
    )
    AND m.is_hidden = FALSE
    AND m.is_deleted = FALSE
  ORDER BY distance_km ASC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE users IS 'User profiles for both Google OAuth and anonymous contributors';
COMMENT ON TABLE memories IS 'Core table storing all memory submissions with location, time, and content';
COMMENT ON TABLE media IS 'Photo attachments for memories (stored in Supabase Storage)';
COMMENT ON TABLE reports IS 'Content moderation reports from users';
COMMENT ON TABLE translations IS 'Cached translations of memory content (Google Translate API)';
COMMENT ON TABLE moderators IS 'List of users with moderation privileges';

COMMENT ON COLUMN users.auth_id IS 'Supabase auth.uid() for Google users, generated UUID for anonymous';
COMMENT ON COLUMN users.auth_type IS 'Authentication method: google or anonymous';
COMMENT ON COLUMN memories.coordinates IS 'PostGIS geography point for map queries';
COMMENT ON COLUMN memories.tags IS 'Array of freeform tags for categorization';
COMMENT ON COLUMN memories.photo_count IS 'Auto-maintained count of attached photos';
COMMENT ON COLUMN memories.is_hidden IS 'Moderator flag to hide inappropriate content';
COMMENT ON COLUMN memories.is_deleted IS 'Soft delete flag (user-initiated deletion)';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify successful migration:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT COUNT(*) FROM memories;
-- SELECT PostGIS_Version();
-- ============================================

-- Migration complete!
-- Next steps:
-- 1. Configure Row Level Security (RLS) policies
-- 2. Set up Storage buckets (memories-photos, memories-thumbnails)
-- 3. Configure authentication providers (Google OAuth)
