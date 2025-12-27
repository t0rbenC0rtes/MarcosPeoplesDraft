# Phase 1.2: Database Schema Design

## marcospeoples.com - Supabase PostgreSQL Schema

**Date Created:** December 27, 2025  
**Status:** In Progress  
**Primary Key Strategy:** UUID (managed by Supabase)  
**Database:** PostgreSQL via Supabase

---

## TABLE OF CONTENTS

1. [Schema Overview](#schema-overview)
2. [Users Table](#users-table)
3. [Memories Table](#memories-table)
4. [Media Table](#media-table)
5. [Reports Table](#reports-table)
6. [Translations Table](#translations-table)
7. [Moderators Table](#moderators-table)
8. [Relationships Diagram](#relationships-diagram)
9. [Indexes Strategy](#indexes-strategy)
10. [Storage Buckets](#storage-buckets)

---

## SCHEMA OVERVIEW

### Core Principles

- **UUID Primary Keys**: All tables use UUIDs managed by Supabase
- **Soft Deletes**: Important content uses `is_deleted` flag instead of hard deletes
- **Timestamps**: All tables include `created_at` and `updated_at`
- **Nullable Fields**: Maximum flexibility - minimal required fields
- **Anonymous Support**: System supports both authenticated and anonymous users

### Table Summary

| Table        | Purpose                                     | Estimated Rows |
| ------------ | ------------------------------------------- | -------------- |
| users        | Store both Google OAuth and anonymous users | 50-150         |
| memories     | Core content - stories with locations       | 150-750        |
| media        | Photos attached to memories                 | 450-3000       |
| reports      | Content moderation reports                  | 0-50           |
| translations | Cached memory translations                  | 300-1500       |
| moderators   | Users with moderation privileges            | 2-5            |

---

## USERS TABLE

Stores both Google OAuth authenticated users and anonymous guest users.

### Schema

```sql
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication
  auth_type VARCHAR(20) NOT NULL CHECK (auth_type IN ('google', 'anonymous')),
  google_id VARCHAR(255) UNIQUE,  -- Google OAuth user ID (null for anonymous)
  supabase_auth_id UUID UNIQUE,   -- Links to Supabase Auth (null for anonymous)

  -- User Information
  name VARCHAR(255),               -- Display name (Google name OR user-provided OR 'anonymous')
  email VARCHAR(255),              -- Email (only for Google OAuth users)
  profile_pic_url TEXT,            -- Google profile picture URL (null for anonymous)

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ,

  -- Privacy & Moderation
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_auth_type ON users(auth_type);
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Comments
COMMENT ON TABLE users IS 'Stores both Google OAuth and anonymous users';
COMMENT ON COLUMN users.auth_type IS 'google = authenticated via Google OAuth, anonymous = guest user';
COMMENT ON COLUMN users.name IS 'Display name - defaults to "anonymous" if not provided';
COMMENT ON COLUMN users.google_id IS 'Unique Google OAuth ID (null for anonymous users)';
```

### Field Details

| Field            | Type         | Nullable | Default | Description                         |
| ---------------- | ------------ | -------- | ------- | ----------------------------------- |
| id               | UUID         | No       | auto    | Primary key                         |
| auth_type        | VARCHAR(20)  | No       | -       | 'google' or 'anonymous'             |
| google_id        | VARCHAR(255) | Yes      | null    | Google OAuth user ID                |
| supabase_auth_id | UUID         | Yes      | null    | Supabase Auth user ID               |
| name             | VARCHAR(255) | Yes      | null    | Display name (default: 'anonymous') |
| email            | VARCHAR(255) | Yes      | null    | Email address (Google users only)   |
| profile_pic_url  | TEXT         | Yes      | null    | Profile picture URL                 |
| created_at       | TIMESTAMPTZ  | No       | NOW()   | Account creation timestamp          |
| updated_at       | TIMESTAMPTZ  | No       | NOW()   | Last update timestamp               |
| last_seen_at     | TIMESTAMPTZ  | Yes      | null    | Last activity timestamp             |
| is_deleted       | BOOLEAN      | No       | FALSE   | Soft delete flag                    |
| deleted_at       | TIMESTAMPTZ  | Yes      | null    | Deletion timestamp                  |

### Business Rules

1. **Anonymous Users**:

   - `auth_type = 'anonymous'`
   - `google_id = NULL`
   - `supabase_auth_id = NULL`
   - `email = NULL`
   - `profile_pic_url = NULL`
   - `name` is optional, defaults to "anonymous" in application layer

2. **Google OAuth Users**:

   - `auth_type = 'google'`
   - `google_id` is required and unique
   - `supabase_auth_id` links to Supabase Auth
   - `email` populated from Google
   - `name` populated from Google
   - `profile_pic_url` populated from Google

3. **Display Logic**:
   - Show profile picture if available
   - Show name if provided, else "anonymous"
   - No email addresses displayed publicly

---

## MEMORIES TABLE

Core content table storing user-submitted memories with location data.

### Schema

```sql
CREATE TABLE memories (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  title VARCHAR(500),              -- Optional memory title
  story TEXT,                      -- The memory/testimony text
  language VARCHAR(5),             -- ISO 639-1 code (en, fr, es, nl, pt)

  -- Location Data
  location_name VARCHAR(255),      -- Human-readable location (e.g., "Brussels, Belgium")
  city VARCHAR(100),               -- City name
  country VARCHAR(100),            -- Country name
  coordinates GEOGRAPHY(POINT),    -- PostGIS POINT (latitude, longitude)
  latitude DECIMAL(10, 8),         -- Latitude for easier queries
  longitude DECIMAL(11, 8),        -- Longitude for easier queries

  -- Metadata
  time_period VARCHAR(20),         -- Decade/era (e.g., "1970s", "1980s", "2020s")
  year INTEGER,                    -- Specific year if known
  tags TEXT[],                     -- Array of keywords/tags

  -- Media Stats
  photo_count INTEGER DEFAULT 0,   -- Number of photos attached

  -- Moderation & Visibility
  is_hidden BOOLEAN DEFAULT FALSE, -- Hidden by moderator
  hidden_at TIMESTAMPTZ,
  hidden_by UUID REFERENCES users(id),
  hide_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Soft Delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

-- Indexes for Performance
CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX idx_memories_coordinates ON memories USING GIST(coordinates) WHERE coordinates IS NOT NULL;
CREATE INDEX idx_memories_location ON memories(city, country);
CREATE INDEX idx_memories_language ON memories(language);
CREATE INDEX idx_memories_visible ON memories(is_hidden, is_deleted) WHERE is_hidden = FALSE AND is_deleted = FALSE;
CREATE INDEX idx_memories_time_period ON memories(time_period) WHERE time_period IS NOT NULL;
CREATE INDEX idx_memories_tags ON memories USING GIN(tags) WHERE tags IS NOT NULL;

-- Comments
COMMENT ON TABLE memories IS 'User-submitted memories with location data';
COMMENT ON COLUMN memories.coordinates IS 'PostGIS geography point for spatial queries';
COMMENT ON COLUMN memories.is_hidden IS 'Moderator can hide inappropriate content';
```

### Field Details

| Field         | Type         | Nullable | Default | Description                            |
| ------------- | ------------ | -------- | ------- | -------------------------------------- |
| id            | UUID         | No       | auto    | Primary key                            |
| user_id       | UUID         | No       | -       | Foreign key to users table             |
| title         | VARCHAR(500) | Yes      | null    | Optional memory title                  |
| story         | TEXT         | Yes      | null    | Main memory text                       |
| language      | VARCHAR(5)   | Yes      | null    | ISO language code (en, fr, es, nl, pt) |
| location_name | VARCHAR(255) | Yes      | null    | Human-readable location                |
| city          | VARCHAR(100) | Yes      | null    | City name                              |
| country       | VARCHAR(100) | Yes      | null    | Country name                           |
| coordinates   | GEOGRAPHY    | Yes      | null    | PostGIS point for map                  |
| latitude      | DECIMAL      | Yes      | null    | Latitude (-90 to 90)                   |
| longitude     | DECIMAL      | Yes      | null    | Longitude (-180 to 180)                |
| time_period   | VARCHAR(20)  | Yes      | null    | Decade (1970s, 1980s, etc.)            |
| year          | INTEGER      | Yes      | null    | Specific year                          |
| tags          | TEXT[]       | Yes      | null    | Array of keywords                      |
| photo_count   | INTEGER      | No       | 0       | Number of attached photos              |
| is_hidden     | BOOLEAN      | No       | FALSE   | Moderator visibility flag              |
| hidden_at     | TIMESTAMPTZ  | Yes      | null    | When hidden                            |
| hidden_by     | UUID         | Yes      | null    | Moderator who hid it                   |
| hide_reason   | TEXT         | Yes      | null    | Reason for hiding                      |
| created_at    | TIMESTAMPTZ  | No       | NOW()   | Creation timestamp                     |
| updated_at    | TIMESTAMPTZ  | No       | NOW()   | Last update timestamp                  |
| is_deleted    | BOOLEAN      | No       | FALSE   | Soft delete flag                       |
| deleted_at    | TIMESTAMPTZ  | Yes      | null    | Deletion timestamp                     |

### Business Rules

1. **Required Fields**:

   - `user_id` must exist in users table
   - At least one of: `title`, `story`, or photos must be provided (enforced at app level)

2. **Location Data**:

   - `coordinates` used for map queries (PostGIS spatial index)
   - `latitude` and `longitude` stored separately for simpler queries
   - `location_name` is human-readable display text
   - User selects location by clicking on map

3. **Language Detection**:

   - Auto-detected when story submitted (using library or API)
   - Used for translation feature
   - Supports: en (English), fr (French), es (Spanish), nl (Dutch), pt (Portuguese)

4. **Time Period**:

   - Calculated from `year` if provided
   - Can be manually tagged
   - Used for timeline filtering

5. **Visibility**:
   - Public by default (`is_hidden = FALSE`)
   - Moderators can hide (`is_hidden = TRUE`)
   - Soft deletes preserve data

---

## MEDIA TABLE

Stores photos/images attached to memories.

### Schema

```sql
CREATE TABLE media (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,

  -- File Information
  file_url TEXT NOT NULL,           -- Full-size image URL from Supabase Storage
  thumbnail_url TEXT,               -- Thumbnail URL (generated)
  file_name VARCHAR(255),           -- Original filename
  file_size INTEGER,                -- File size in bytes
  mime_type VARCHAR(50),            -- image/jpeg, image/png, etc.

  -- Image Metadata
  width INTEGER,                    -- Image width in pixels
  height INTEGER,                   -- Image height in pixels

  -- Display Order
  display_order INTEGER DEFAULT 0,  -- Order in gallery (0 = first)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id),

  -- Soft Delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_media_memory_id ON media(memory_id, display_order);
CREATE INDEX idx_media_created_at ON media(created_at DESC);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);

-- Comments
COMMENT ON TABLE media IS 'Photos/images attached to memories';
COMMENT ON COLUMN media.display_order IS 'Order in photo gallery (0 = first photo)';
```

### Field Details

| Field         | Type         | Nullable | Default | Description                   |
| ------------- | ------------ | -------- | ------- | ----------------------------- |
| id            | UUID         | No       | auto    | Primary key                   |
| memory_id     | UUID         | No       | -       | Foreign key to memories table |
| file_url      | TEXT         | No       | -       | Supabase Storage URL          |
| thumbnail_url | TEXT         | Yes      | null    | Thumbnail version URL         |
| file_name     | VARCHAR(255) | Yes      | null    | Original filename             |
| file_size     | INTEGER      | Yes      | null    | Size in bytes                 |
| mime_type     | VARCHAR(50)  | Yes      | null    | File MIME type                |
| width         | INTEGER      | Yes      | null    | Image width (px)              |
| height        | INTEGER      | Yes      | null    | Image height (px)             |
| display_order | INTEGER      | No       | 0       | Gallery order                 |
| created_at    | TIMESTAMPTZ  | No       | NOW()   | Upload timestamp              |
| uploaded_by   | UUID         | Yes      | null    | User who uploaded             |
| is_deleted    | BOOLEAN      | No       | FALSE   | Soft delete flag              |
| deleted_at    | TIMESTAMPTZ  | Yes      | null    | Deletion timestamp            |

### Business Rules

1. **File Constraints** (enforced at app level):

   - Max file size: 10 MB before compression
   - Allowed formats: JPEG, PNG, WebP, HEIC
   - Auto-compress to ~1.5 MB max
   - Convert HEIC to JPEG

2. **Thumbnail Generation**:

   - Created automatically on upload
   - Max dimensions: 300x300px
   - Used for gallery thumbnails and map previews

3. **Display Order**:

   - First photo (`display_order = 0`) shown as memory preview
   - User can reorder photos after upload
   - Gaps in order are allowed

4. **Storage**:
   - Files stored in Supabase Storage bucket
   - URLs are public CDN links
   - Deletion removes from storage and database

---

## REPORTS TABLE

Handles post-moderation reports from users.

### Schema

```sql
CREATE TABLE reports (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- Can be anonymous

  -- Report Details
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'false_information', 'copyright', 'other')),
  details TEXT,                     -- Additional context from reporter
  reporter_email VARCHAR(255),      -- Optional contact info

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),

  -- Review Information
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  moderator_notes TEXT,
  action_taken VARCHAR(50),         -- 'hidden', 'deleted', 'no_action', 'contacted_user'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reports_memory_id ON reports(memory_id);
CREATE INDEX idx_reports_status ON reports(status) WHERE status = 'pending';
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_reviewer ON reports(reviewed_by);

-- Comments
COMMENT ON TABLE reports IS 'User-submitted reports for content moderation';
COMMENT ON COLUMN reports.reporter_id IS 'Null if reporter chooses to remain anonymous';
```

### Field Details

| Field           | Type         | Nullable | Default   | Description            |
| --------------- | ------------ | -------- | --------- | ---------------------- |
| id              | UUID         | No       | auto      | Primary key            |
| memory_id       | UUID         | No       | -         | Reported memory        |
| reporter_id     | UUID         | Yes      | null      | User who reported      |
| reason          | VARCHAR(50)  | No       | -         | Report category        |
| details         | TEXT         | Yes      | null      | Additional context     |
| reporter_email  | VARCHAR(255) | Yes      | null      | Contact email          |
| status          | VARCHAR(20)  | No       | 'pending' | Review status          |
| reviewed_at     | TIMESTAMPTZ  | Yes      | null      | Review timestamp       |
| reviewed_by     | UUID         | Yes      | null      | Moderator who reviewed |
| moderator_notes | TEXT         | Yes      | null      | Internal notes         |
| action_taken    | VARCHAR(50)  | Yes      | null      | Action result          |
| created_at      | TIMESTAMPTZ  | No       | NOW()     | Report timestamp       |
| updated_at      | TIMESTAMPTZ  | No       | NOW()     | Last update            |

### Business Rules

1. **Report Reasons**:

   - `inappropriate` - Offensive or disrespectful content
   - `spam` - Unrelated or promotional content
   - `false_information` - Factually incorrect
   - `copyright` - Unauthorized image use
   - `other` - Other concerns (explain in details)

2. **Status Flow**:

   - `pending` → `reviewing` → `resolved` or `dismissed`
   - Multiple reports for same memory allowed
   - Moderators receive email notifications

3. **Actions**:
   - `hidden` - Memory hidden from public
   - `deleted` - Memory permanently removed
   - `no_action` - No moderation needed
   - `contacted_user` - Reached out to contributor

---

## TRANSLATIONS TABLE

Caches translated memories to reduce API calls.

### Schema

```sql
CREATE TABLE translations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,

  -- Translation Data
  source_language VARCHAR(5) NOT NULL,    -- Original language
  target_language VARCHAR(5) NOT NULL,    -- Translated to language
  translated_title TEXT,
  translated_story TEXT,

  -- Translation Service
  translation_service VARCHAR(50),        -- 'google_translate', 'deepl', etc.

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cache_expires_at TIMESTAMPTZ,           -- Optional expiration
  translation_quality DECIMAL(3,2),       -- 0.00 to 1.00 confidence score

  -- Unique constraint: one translation per memory+language pair
  UNIQUE(memory_id, target_language)
);

-- Indexes
CREATE INDEX idx_translations_memory_id ON translations(memory_id);
CREATE INDEX idx_translations_target_lang ON translations(target_language);
CREATE INDEX idx_translations_created_at ON translations(created_at DESC);

-- Comments
COMMENT ON TABLE translations IS 'Cached translations of memories to reduce API calls';
COMMENT ON COLUMN translations.cache_expires_at IS 'Optional - can refresh translations periodically';
```

### Field Details

| Field               | Type        | Nullable | Default | Description              |
| ------------------- | ----------- | -------- | ------- | ------------------------ |
| id                  | UUID        | No       | auto    | Primary key              |
| memory_id           | UUID        | No       | -       | Original memory          |
| source_language     | VARCHAR(5)  | No       | -       | Original language code   |
| target_language     | VARCHAR(5)  | No       | -       | Translated language code |
| translated_title    | TEXT        | Yes      | null    | Translated title         |
| translated_story    | TEXT        | Yes      | null    | Translated story         |
| translation_service | VARCHAR(50) | Yes      | null    | API used                 |
| created_at          | TIMESTAMPTZ | No       | NOW()   | Translation timestamp    |
| cache_expires_at    | TIMESTAMPTZ | Yes      | null    | Cache expiration         |
| translation_quality | DECIMAL     | Yes      | null    | Confidence score         |

### Business Rules

1. **Cache Strategy**:

   - First translation request triggers API call
   - Result cached in database
   - Subsequent requests use cached version
   - Optional cache expiration (e.g., 90 days)

2. **Supported Translations**:

   - Any combination of: en ↔ fr ↔ es ↔ nl ↔ pt
   - Each direction stored separately

3. **Performance**:
   - Dramatically reduces translation API costs
   - Instant retrieval for cached translations
   - Consider cache hit rate in analytics

---

## MODERATORS TABLE

Defines users with moderation privileges.

### Schema

```sql
CREATE TABLE moderators (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Contact
  email VARCHAR(255) NOT NULL,      -- For notifications

  -- Notification Preferences
  notification_enabled BOOLEAN DEFAULT TRUE,
  notification_frequency VARCHAR(20) DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily_digest', 'weekly_digest', 'disabled')),

  -- Permissions (for future expansion)
  can_hide_memories BOOLEAN DEFAULT TRUE,
  can_delete_memories BOOLEAN DEFAULT FALSE,
  can_manage_users BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  last_active_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_moderators_user_id ON moderators(user_id);
CREATE INDEX idx_moderators_active ON moderators(is_active) WHERE is_active = TRUE;

-- Comments
COMMENT ON TABLE moderators IS 'Users with content moderation privileges';
COMMENT ON COLUMN moderators.notification_frequency IS 'How often to receive report notifications';
```

### Field Details

| Field                  | Type         | Nullable | Default     | Description              |
| ---------------------- | ------------ | -------- | ----------- | ------------------------ |
| id                     | UUID         | No       | auto        | Primary key              |
| user_id                | UUID         | No       | -           | User with mod privileges |
| email                  | VARCHAR(255) | No       | -           | Notification email       |
| notification_enabled   | BOOLEAN      | No       | TRUE        | Receive notifications    |
| notification_frequency | VARCHAR(20)  | No       | 'immediate' | Notification timing      |
| can_hide_memories      | BOOLEAN      | No       | TRUE        | Can hide content         |
| can_delete_memories    | BOOLEAN      | No       | FALSE       | Can delete content       |
| can_manage_users       | BOOLEAN      | No       | FALSE       | Can manage users         |
| created_at             | TIMESTAMPTZ  | No       | NOW()       | Added as mod             |
| created_by             | UUID         | Yes      | null        | Who added them           |
| last_active_at         | TIMESTAMPTZ  | Yes      | null        | Last moderation action   |
| is_active              | BOOLEAN      | No       | TRUE        | Active status            |

### Business Rules

1. **Moderator Selection**:

   - Must be trusted family members or friends
   - Typically 2-5 moderators total
   - Must have Google OAuth account (no anonymous mods)

2. **Notification Frequency**:

   - `immediate` - Email per report
   - `daily_digest` - One email per day
   - `weekly_digest` - One email per week
   - `disabled` - No emails (check dashboard manually)

3. **Permissions** (future expansion):
   - `can_hide_memories` - Hide from public view
   - `can_delete_memories` - Permanently delete
   - `can_manage_users` - Add/remove moderators

---

## RELATIONSHIPS DIAGRAM

```
┌─────────────┐
│    users    │
│  (id: UUID) │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       │ user_id         │ user_id
       │                 │
       ▼                 ▼
┌─────────────┐   ┌──────────────┐
│  memories   │   │  moderators  │
│  (id: UUID) │   │  (id: UUID)  │
└──────┬──────┘   └──────────────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       │ memory_id       │ memory_id       │ memory_id
       │                 │                 │
       ▼                 ▼                 ▼
┌─────────────┐   ┌──────────────┐  ┌──────────────┐
│    media    │   │   reports    │  │ translations │
│  (id: UUID) │   │  (id: UUID)  │  │  (id: UUID)  │
└─────────────┘   └──────────────┘  └──────────────┘
```

### Cascade Rules

- **User deleted** → All their memories deleted (CASCADE)
- **Memory deleted** → All media deleted (CASCADE)
- **Memory deleted** → All reports deleted (CASCADE)
- **Memory deleted** → All translations deleted (CASCADE)
- **Reporter deleted** → Report remains, reporter_id set to NULL (SET NULL)

---

## INDEXES STRATEGY

### Performance Indexes

**Critical for Performance:**

```sql
-- Map queries (most common query type)
CREATE INDEX idx_memories_coordinates ON memories USING GIST(coordinates);
CREATE INDEX idx_memories_visible ON memories(is_hidden, is_deleted);

-- Memory listing and sorting
CREATE INDEX idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX idx_memories_user_id ON memories(user_id);

-- Photo gallery loading
CREATE INDEX idx_media_memory_id ON media(memory_id, display_order);

-- Language filtering
CREATE INDEX idx_memories_language ON memories(language);
```

**Moderation Queries:**

```sql
-- Pending reports
CREATE INDEX idx_reports_status ON reports(status) WHERE status = 'pending';
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
```

**Translation Cache:**

```sql
-- Quick translation lookup
CREATE INDEX idx_translations_memory_id ON translations(memory_id);
CREATE UNIQUE INDEX idx_translations_memory_target ON translations(memory_id, target_language);
```

### Index Maintenance

- **GIST Index**: Used for geographic queries (PostGIS)
- **GIN Index**: Used for array queries (tags)
- **B-tree Indexes**: Default for most queries
- **Partial Indexes**: Used for common WHERE conditions (e.g., `WHERE status = 'pending'`)

**Monitoring:**

- Check index usage via Supabase dashboard
- Remove unused indexes if identified
- Add indexes based on slow query logs

---

## STORAGE BUCKETS

### Supabase Storage Buckets

```sql
-- Bucket for full-size images
BUCKET: memories-photos
  - Public access: READ
  - Authenticated write: Both Google and anonymous users
  - Max file size: 10 MB
  - Allowed types: image/jpeg, image/png, image/webp
  - Path structure: {memory_id}/{photo_id}.{ext}

-- Bucket for thumbnails (auto-generated)
BUCKET: memories-thumbnails
  - Public access: READ
  - Generated server-side (Edge Function or trigger)
  - Max dimensions: 300x300px
  - Path structure: {memory_id}/{photo_id}_thumb.webp
```

### Storage Policies

```sql
-- RLS Policy for memories-photos bucket
CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memories-photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'memories-photos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'memories-photos'
    AND owner = auth.uid()
  );
```

---

## DATABASE TRIGGERS

### Auto-Update Timestamps

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Update Photo Count

```sql
-- Function to update memory photo_count
CREATE OR REPLACE FUNCTION update_memory_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE memories
    SET photo_count = photo_count + 1
    WHERE id = NEW.memory_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE memories
    SET photo_count = GREATEST(photo_count - 1, 0)
    WHERE id = OLD.memory_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger on media table
CREATE TRIGGER update_photo_count_on_insert
  AFTER INSERT ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_memory_photo_count();

CREATE TRIGGER update_photo_count_on_delete
  AFTER DELETE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_memory_photo_count();
```

---

## MIGRATION STRATEGY

### Phase 1: Initial Setup (Phase 2 of Project)

1. Create all tables via Supabase dashboard or SQL editor
2. Set up Row Level Security policies
3. Create storage buckets
4. Add indexes
5. Create triggers

### Phase 2: Seed Data (Phase 8 of Project)

1. Create moderator accounts
2. Add 5-10 initial memories
3. Test all relationships

### Phase 3: Production (Phase 9 of Project)

1. Set up automated backups
2. Monitor database size and performance
3. Add indexes based on slow queries
4. Regular maintenance

---

## BACKUP & RECOVERY

### Supabase Backups

- **Automatic daily backups** included in Pro plan
- Restore point-in-time (PITR) available
- Manual backup before major changes
- Export SQL dumps periodically for local backup

### Critical Data

1. **Memories** - Core content (highest priority)
2. **Media** - Photos (stored separately in Storage)
3. **Users** - Contributor information
4. **Translations** - Can be regenerated if lost

---

## NEXT STEPS

✅ **Schema Design Complete**

**Now Ready For:**

1. Define Row Level Security (RLS) policies → Task 2
2. Design authentication flows → Task 3
3. Create navigation structure → Task 4

**In Phase 2.2 (Supabase Configuration):**

- Copy this schema to Supabase SQL editor
- Execute CREATE TABLE statements
- Configure RLS policies
- Set up storage buckets
- Test with sample data

---

**Document Status:** ✅ Complete - Ready for Review  
**Last Updated:** December 27, 2025  
**Next Review:** Before Phase 2.2 implementation
