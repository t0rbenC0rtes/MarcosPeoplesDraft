# Phase 1.2: API Endpoints Documentation

## marcospeoples.com - Supabase Queries & Edge Functions

**Date Created:** December 27, 2025  
**Status:** Complete  
**Purpose:** Define all database queries, mutations, and Edge Functions

---

## TABLE OF CONTENTS

1. [API Overview](#api-overview)
2. [Memory Endpoints](#memory-endpoints)
3. [User Endpoints](#user-endpoints)
4. [Media Endpoints](#media-endpoints)
5. [Translation Endpoints](#translation-endpoints)
6. [Moderation Endpoints](#moderation-endpoints)
7. [Search & Filter Endpoints](#search--filter-endpoints)
8. [Geographic Endpoints](#geographic-endpoints)
9. [Edge Functions](#edge-functions)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [Authentication Headers](#authentication-headers)

---

## API OVERVIEW

### Technology Stack

**Database:** Supabase PostgreSQL + PostGIS  
**Client:** `@supabase/supabase-js` v2  
**Edge Functions:** Supabase Edge Functions (Deno)  
**Storage:** Supabase Storage

### API Architecture

**Direct Database Queries:**

- Memory CRUD operations
- User profile management
- Search and filtering
- Geographic queries

**Edge Functions:**

- Image processing (compression, thumbnails)
- Translation service (Google Translate API)
- Email notifications (future)

**Real-time (Phase 5):**

- Live memory additions (broadcast to all viewers)
- Moderation queue updates

### Authentication Context

**Public Access (No Auth):**

- Read memories (visible only)
- Read user profiles (public fields)
- Search and filter

**Authenticated Access:**

- Create memory
- Update own memory
- Delete own memory
- Upload photos
- Report content

**Moderator Access:**

- View all reports
- Hide/unhide memories
- Manage moderator list

---

## MEMORY ENDPOINTS

### 1. Create Memory

**Operation:** `INSERT INTO memories`

**Authentication:** Required (Google or Anonymous)

**Request:**

```typescript
interface CreateMemoryRequest {
  title?: string; // Optional, max 500 chars
  story?: string; // Optional, max 10000 chars
  language?: string; // ISO 639-1 code, default 'en'
  time_period?: string; // "1980s", "1990s", etc.
  year?: number; // 1972-2025
  location_name: string; // Required: "Brussels, Belgium"
  city?: string; // "Brussels"
  country?: string; // "Belgium"
  latitude: number; // Required: 50.8503
  longitude: number; // Required: 4.3517
  tags?: string[]; // Optional, max 10 tags
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase
  .from("memories")
  .insert({
    user_id: userId, // From auth context
    title: request.title,
    story: request.story,
    language: request.language || "en",
    time_period: request.time_period,
    year: request.year,
    location_name: request.location_name,
    city: request.city,
    country: request.country,
    coordinates: `POINT(${request.longitude} ${request.latitude})`,
    latitude: request.latitude,
    longitude: request.longitude,
    tags: request.tags || [],
    photo_count: 0, // Will be updated when photos uploaded
    is_hidden: false,
    is_deleted: false,
  })
  .select()
  .single();
```

**Response:**

```typescript
interface CreateMemoryResponse {
  id: string; // UUID
  user_id: string;
  title: string | null;
  story: string | null;
  language: string;
  time_period: string | null;
  year: number | null;
  location_name: string;
  city: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  tags: string[];
  photo_count: number;
  created_at: string; // ISO timestamp
  updated_at: string;
}
```

**Error Codes:**

- `401`: Unauthorized (no auth token)
- `400`: Invalid request (missing required fields)
- `422`: Validation error (invalid coordinates, year out of range)
- `500`: Database error

---

### 2. Get Single Memory

**Operation:** `SELECT FROM memories`

**Authentication:** Not required (public read)

**Request:**

```typescript
interface GetMemoryRequest {
  memoryId: string; // UUID
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase
  .from("memories")
  .select(
    `
    *,
    user:users (
      id,
      name,
      profile_pic_url
    ),
    media:media (
      id,
      file_url,
      thumbnail_url,
      display_order
    )
  `
  )
  .eq("id", memoryId)
  .eq("is_hidden", false)
  .eq("is_deleted", false)
  .single();
```

**Response:**

```typescript
interface GetMemoryResponse {
  id: string;
  user_id: string;
  title: string | null;
  story: string | null;
  language: string;
  time_period: string | null;
  year: number | null;
  location_name: string;
  city: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  tags: string[];
  photo_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    profile_pic_url: string | null;
  };
  media: Array<{
    id: string;
    file_url: string;
    thumbnail_url: string;
    display_order: number;
  }>;
}
```

**Error Codes:**

- `404`: Memory not found or hidden
- `500`: Database error

---

### 3. Get Multiple Memories (List)

**Operation:** `SELECT FROM memories`

**Authentication:** Not required (public read)

**Request:**

```typescript
interface GetMemoriesRequest {
  limit?: number; // Default 50, max 100
  offset?: number; // For pagination
  order_by?: "created_at" | "year" | "location_name";
  order_direction?: "asc" | "desc";
}
```

**Supabase Query:**

```javascript
let query = supabase
  .from("memories")
  .select(
    `
    *,
    user:users (
      id,
      name,
      profile_pic_url
    )
  `
  )
  .eq("is_hidden", false)
  .eq("is_deleted", false)
  .order(request.order_by || "created_at", {
    ascending: request.order_direction === "asc",
  })
  .range(
    request.offset || 0,
    (request.offset || 0) + (request.limit || 50) - 1
  );

const { data, error } = await query;
```

**Response:**

```typescript
interface GetMemoriesResponse {
  memories: Array<{
    id: string;
    title: string | null;
    story: string | null;
    language: string;
    time_period: string | null;
    year: number | null;
    location_name: string;
    latitude: number;
    longitude: number;
    tags: string[];
    photo_count: number;
    created_at: string;
    user: {
      id: string;
      name: string;
      profile_pic_url: string | null;
    };
  }>;
  count: number; // Total count (for pagination)
}
```

**Error Codes:**

- `400`: Invalid parameters
- `500`: Database error

---

### 4. Update Memory

**Operation:** `UPDATE memories`

**Authentication:** Required (must be memory owner)

**Request:**

```typescript
interface UpdateMemoryRequest {
  memoryId: string;
  updates: {
    title?: string;
    story?: string;
    language?: string;
    time_period?: string;
    year?: number;
    location_name?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    tags?: string[];
  };
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase
  .from("memories")
  .update({
    ...request.updates,
    coordinates:
      request.updates.latitude && request.updates.longitude
        ? `POINT(${request.updates.longitude} ${request.updates.latitude})`
        : undefined,
    updated_at: new Date().toISOString(),
  })
  .eq("id", request.memoryId)
  .eq("user_id", userId) // RLS enforces this
  .select()
  .single();
```

**Response:** Same as CreateMemoryResponse

**Error Codes:**

- `401`: Unauthorized
- `403`: Forbidden (not memory owner)
- `404`: Memory not found
- `422`: Validation error
- `500`: Database error

---

### 5. Delete Memory (Soft Delete)

**Operation:** `UPDATE memories SET is_deleted = true`

**Authentication:** Required (must be memory owner)

**Request:**

```typescript
interface DeleteMemoryRequest {
  memoryId: string;
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase
  .from("memories")
  .update({
    is_deleted: true,
    updated_at: new Date().toISOString(),
  })
  .eq("id", request.memoryId)
  .eq("user_id", userId) // RLS enforces this
  .select()
  .single();
```

**Response:**

```typescript
interface DeleteMemoryResponse {
  success: boolean;
  message: string;
}
```

**Error Codes:**

- `401`: Unauthorized
- `403`: Forbidden (not memory owner)
- `404`: Memory not found
- `500`: Database error

---

## USER ENDPOINTS

### 1. Create User Profile

**Operation:** `INSERT INTO users`

**Authentication:** Required (Supabase Auth)

**Trigger:** Called automatically after Google OAuth or Anonymous login

**Request:**

```typescript
interface CreateUserRequest {
  auth_id: string; // From Supabase Auth
  auth_type: "google" | "anonymous";
  name: string; // Required
  email?: string; // Google only
  profile_pic_url?: string; // Google only
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase
  .from("users")
  .insert({
    auth_id: request.auth_id,
    auth_type: request.auth_type,
    name: request.name,
    email: request.email,
    profile_pic_url: request.profile_pic_url,
  })
  .select()
  .single();
```

**Response:**

```typescript
interface CreateUserResponse {
  id: string; // UUID
  auth_id: string;
  auth_type: string;
  name: string;
  email: string | null;
  profile_pic_url: string | null;
  created_at: string;
}
```

**Error Codes:**

- `400`: Invalid request
- `409`: User already exists (auth_id conflict)
- `500`: Database error

---

### 2. Get User Profile

**Operation:** `SELECT FROM users`

**Authentication:** Not required (public read for public fields)

**Request:**

```typescript
interface GetUserRequest {
  userId: string; // UUID
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase
  .from("users")
  .select("id, name, profile_pic_url, created_at")
  .eq("id", userId)
  .single();
```

**Response:**

```typescript
interface GetUserResponse {
  id: string;
  name: string;
  profile_pic_url: string | null;
  created_at: string;
}
```

**Error Codes:**

- `404`: User not found
- `500`: Database error

---

### 3. Update User Profile

**Operation:** `UPDATE users`

**Authentication:** Required (must be profile owner)

**Request:**

```typescript
interface UpdateUserRequest {
  updates: {
    name?: string;
    profile_pic_url?: string;
  };
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase
  .from("users")
  .update(request.updates)
  .eq("auth_id", authId) // RLS enforces this
  .select()
  .single();
```

**Response:** Same as CreateUserResponse

**Error Codes:**

- `401`: Unauthorized
- `403`: Forbidden
- `404`: User not found
- `500`: Database error

---

### 4. Get User's Memories

**Operation:** `SELECT FROM memories`

**Authentication:** Not required for public memories; Required to see own hidden memories

**Request:**

```typescript
interface GetUserMemoriesRequest {
  userId: string;
  include_hidden?: boolean; // Only works if requesting own profile
}
```

**Supabase Query:**

```javascript
let query = supabase
  .from("memories")
  .select("*")
  .eq("user_id", userId)
  .eq("is_deleted", false);

// Only show hidden if user is requesting their own profile
if (!request.include_hidden || userId !== currentUserId) {
  query = query.eq("is_hidden", false);
}

const { data, error } = await query.order("created_at", { ascending: false });
```

**Response:**

```typescript
interface GetUserMemoriesResponse {
  memories: Array<{
    id: string;
    title: string | null;
    story: string | null;
    location_name: string;
    year: number | null;
    photo_count: number;
    is_hidden: boolean; // Only visible if own profile
    created_at: string;
  }>;
}
```

**Error Codes:**

- `404`: User not found
- `500`: Database error

---

## MEDIA ENDPOINTS

### 1. Upload Photo

**Operation:** `Storage.upload` + `INSERT INTO media`

**Authentication:** Required

**Request:**

```typescript
interface UploadPhotoRequest {
  memoryId: string;
  file: File; // Image file (JPEG, PNG, HEIC)
  display_order?: number; // Order in gallery
}
```

**Process:**

1. Upload original to Supabase Storage (`memories-photos` bucket)
2. Call Edge Function to generate thumbnail
3. Insert record into `media` table
4. Update `photo_count` on `memories` table

**Supabase Storage Upload:**

```javascript
// 1. Upload original
const fileName = `${memoryId}/${uuidv4()}.jpg`;
const { data: uploadData, error: uploadError } = await supabase.storage
  .from("memories-photos")
  .upload(fileName, file, {
    contentType: file.type,
    upsert: false,
  });

// 2. Get public URL
const {
  data: { publicUrl },
} = supabase.storage.from("memories-photos").getPublicUrl(fileName);

// 3. Call Edge Function for thumbnail (async)
await supabase.functions.invoke("generate-thumbnail", {
  body: { fileName },
});

// 4. Insert media record
const { data, error } = await supabase
  .from("media")
  .insert({
    memory_id: memoryId,
    file_url: publicUrl,
    thumbnail_url: publicUrl.replace("memories-photos", "memories-thumbnails"),
    file_type: "image",
    display_order: request.display_order || 0,
  })
  .select()
  .single();
```

**Response:**

```typescript
interface UploadPhotoResponse {
  id: string;
  memory_id: string;
  file_url: string;
  thumbnail_url: string;
  display_order: number;
  created_at: string;
}
```

**Error Codes:**

- `401`: Unauthorized
- `403`: Not memory owner
- `400`: Invalid file type
- `413`: File too large (max 10MB)
- `500`: Upload failed

---

### 2. Delete Photo

**Operation:** `Storage.remove` + `DELETE FROM media`

**Authentication:** Required (must be memory owner)

**Request:**

```typescript
interface DeletePhotoRequest {
  photoId: string; // Media ID
}
```

**Supabase Query:**

```javascript
// 1. Get file path
const { data: media } = await supabase
  .from("media")
  .select("file_url, memory_id")
  .eq("id", photoId)
  .single();

// 2. Verify ownership via memory
const { data: memory } = await supabase
  .from("memories")
  .select("user_id")
  .eq("id", media.memory_id)
  .single();

if (memory.user_id !== userId) {
  throw new Error("Forbidden");
}

// 3. Delete from storage
const fileName = extractFileNameFromUrl(media.file_url);
await supabase.storage.from("memories-photos").remove([fileName]);

await supabase.storage.from("memories-thumbnails").remove([fileName]);

// 4. Delete from database
const { error } = await supabase.from("media").delete().eq("id", photoId);
```

**Response:**

```typescript
interface DeletePhotoResponse {
  success: boolean;
  message: string;
}
```

**Error Codes:**

- `401`: Unauthorized
- `403`: Forbidden
- `404`: Photo not found
- `500`: Delete failed

---

### 3. Get Memory Photos

**Operation:** `SELECT FROM media`

**Authentication:** Not required (public read)

**Request:**

```typescript
interface GetMemoryPhotosRequest {
  memoryId: string;
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase
  .from("media")
  .select("*")
  .eq("memory_id", memoryId)
  .order("display_order", { ascending: true });
```

**Response:**

```typescript
interface GetMemoryPhotosResponse {
  photos: Array<{
    id: string;
    file_url: string;
    thumbnail_url: string;
    display_order: number;
    created_at: string;
  }>;
}
```

**Error Codes:**

- `404`: Memory not found
- `500`: Database error

---

## TRANSLATION ENDPOINTS

### 1. Translate Memory

**Operation:** Edge Function `translate-memory`

**Authentication:** Not required (public service)

**Request:**

```typescript
interface TranslateMemoryRequest {
  memoryId: string;
  target_language: string; // ISO 639-1 code
}
```

**Edge Function Logic:**

```typescript
// 1. Check if translation exists in cache
const { data: cached } = await supabase
  .from("translations")
  .select("*")
  .eq("memory_id", memoryId)
  .eq("target_language", target_language)
  .single();

if (cached) {
  return cached;
}

// 2. Get original memory
const { data: memory } = await supabase
  .from("memories")
  .select("title, story, language")
  .eq("id", memoryId)
  .single();

// 3. Call Google Translate API
const translatedTitle = await translateText(memory.title, target_language);
const translatedStory = await translateText(memory.story, target_language);

// 4. Cache translation
const { data: translation } = await supabase
  .from("translations")
  .insert({
    memory_id: memoryId,
    source_language: memory.language,
    target_language,
    translated_title: translatedTitle,
    translated_story: translatedStory,
  })
  .select()
  .single();

return translation;
```

**Response:**

```typescript
interface TranslateMemoryResponse {
  id: string;
  memory_id: string;
  source_language: string;
  target_language: string;
  translated_title: string | null;
  translated_story: string | null;
  created_at: string;
}
```

**Error Codes:**

- `404`: Memory not found
- `400`: Invalid language code
- `500`: Translation service error
- `503`: Translation API unavailable

---

### 2. Get Cached Translation

**Operation:** `SELECT FROM translations`

**Authentication:** Not required

**Request:**

```typescript
interface GetTranslationRequest {
  memoryId: string;
  target_language: string;
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase
  .from("translations")
  .select("*")
  .eq("memory_id", memoryId)
  .eq("target_language", target_language)
  .single();
```

**Response:** Same as TranslateMemoryResponse or `null` if not cached

**Error Codes:**

- `404`: Translation not found
- `500`: Database error

---

## MODERATION ENDPOINTS

### 1. Report Memory

**Operation:** `INSERT INTO reports`

**Authentication:** Required

**Request:**

```typescript
interface ReportMemoryRequest {
  memoryId: string;
  reason: "spam" | "inappropriate" | "incorrect" | "other";
  details?: string; // Optional explanation
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase
  .from("reports")
  .insert({
    memory_id: memoryId,
    reporter_user_id: userId,
    reason: request.reason,
    details: request.details,
    status: "pending",
  })
  .select()
  .single();
```

**Response:**

```typescript
interface ReportMemoryResponse {
  id: string;
  memory_id: string;
  reason: string;
  status: string;
  created_at: string;
}
```

**Error Codes:**

- `401`: Unauthorized
- `400`: Invalid request
- `409`: Already reported by this user
- `500`: Database error

---

### 2. Hide/Unhide Memory (Moderator)

**Operation:** `UPDATE memories SET is_hidden`

**Authentication:** Required (Moderator only - Phase 5)

**Note:** Phase 1 moderation happens via Supabase Dashboard

**Request:**

```typescript
interface HideMemoryRequest {
  memoryId: string;
  hidden: boolean;
}
```

**Supabase Query:**

```javascript
// Verify moderator status
const { data: moderator } = await supabase
  .from("moderators")
  .select("*")
  .eq("user_id", userId)
  .single();

if (!moderator) {
  throw new Error("Forbidden: Not a moderator");
}

// Update memory
const { data, error } = await supabase
  .from("memories")
  .update({ is_hidden: request.hidden })
  .eq("id", request.memoryId)
  .select()
  .single();
```

**Response:**

```typescript
interface HideMemoryResponse {
  success: boolean;
  message: string;
}
```

**Error Codes:**

- `401`: Unauthorized
- `403`: Forbidden (not moderator)
- `404`: Memory not found
- `500`: Database error

---

### 3. Get Reports (Moderator Only)

**Operation:** `SELECT FROM reports`

**Authentication:** Required (Moderator only)

**Request:**

```typescript
interface GetReportsRequest {
  status?: "pending" | "reviewed" | "resolved";
  limit?: number;
}
```

**Supabase Query:**

```javascript
let query = supabase
  .from("reports")
  .select(
    `
    *,
    memory:memories (
      id,
      title,
      story,
      user_id
    ),
    reporter:users (
      id,
      name
    )
  `
  )
  .order("created_at", { ascending: false });

if (request.status) {
  query = query.eq("status", request.status);
}

if (request.limit) {
  query = query.limit(request.limit);
}

const { data, error } = await query;
```

**Response:**

```typescript
interface GetReportsResponse {
  reports: Array<{
    id: string;
    memory_id: string;
    reason: string;
    details: string | null;
    status: string;
    created_at: string;
    memory: {
      id: string;
      title: string | null;
      story: string | null;
      user_id: string;
    };
    reporter: {
      id: string;
      name: string;
    };
  }>;
}
```

**Error Codes:**

- `401`: Unauthorized
- `403`: Forbidden (not moderator)
- `500`: Database error

---

## SEARCH & FILTER ENDPOINTS

### 1. Text Search

**Operation:** `SELECT FROM memories` with text matching

**Authentication:** Not required

**Request:**

```typescript
interface SearchMemoriesRequest {
  query: string; // Search term
  limit?: number; // Default 50
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase
  .from("memories")
  .select(
    `
    *,
    user:users (
      id,
      name,
      profile_pic_url
    )
  `
  )
  .or(
    `title.ilike.%${query}%,story.ilike.%${query}%,location_name.ilike.%${query}%`
  )
  .eq("is_hidden", false)
  .eq("is_deleted", false)
  .limit(request.limit || 50);

// Also search by year if query is a number
if (!isNaN(query)) {
  const yearResults = await supabase
    .from("memories")
    .select("*")
    .eq("year", parseInt(query))
    .eq("is_hidden", false)
    .eq("is_deleted", false);

  // Merge results
}
```

**Response:** Same as GetMemoriesResponse

**Error Codes:**

- `400`: Invalid query
- `500`: Database error

---

### 2. Filter by Time Period

**Operation:** `SELECT FROM memories` with time filters

**Authentication:** Not required

**Request:**

```typescript
interface FilterByTimeRequest {
  year_start?: number; // Inclusive
  year_end?: number; // Inclusive
  decade?: string; // "1980s", "1990s", etc.
}
```

**Supabase Query:**

```javascript
let query = supabase
  .from("memories")
  .select("*")
  .eq("is_hidden", false)
  .eq("is_deleted", false);

if (request.year_start && request.year_end) {
  query = query.gte("year", request.year_start).lte("year", request.year_end);
} else if (request.decade) {
  query = query.eq("time_period", request.decade);
}

const { data, error } = await query;
```

**Response:** Same as GetMemoriesResponse

**Error Codes:**

- `400`: Invalid parameters
- `500`: Database error

---

### 3. Filter by Language

**Operation:** `SELECT FROM memories` with language filter

**Authentication:** Not required

**Request:**

```typescript
interface FilterByLanguageRequest {
  languages: string[]; // Array of ISO codes: ['en', 'fr']
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase
  .from("memories")
  .select("*")
  .in("language", request.languages)
  .eq("is_hidden", false)
  .eq("is_deleted", false);
```

**Response:** Same as GetMemoriesResponse

**Error Codes:**

- `400`: Invalid language codes
- `500`: Database error

---

### 4. Filter by Tags

**Operation:** `SELECT FROM memories` with array matching

**Authentication:** Not required

**Request:**

```typescript
interface FilterByTagsRequest {
  tags: string[]; // Array of tags
  match_all?: boolean; // If true, memory must have ALL tags
}
```

**Supabase Query:**

```javascript
let query = supabase
  .from("memories")
  .select("*")
  .eq("is_hidden", false)
  .eq("is_deleted", false);

if (request.match_all) {
  // Memory must contain all tags
  query = query.contains("tags", request.tags);
} else {
  // Memory must contain at least one tag
  query = query.overlaps("tags", request.tags);
}

const { data, error } = await query;
```

**Response:** Same as GetMemoriesResponse

**Error Codes:**

- `400`: Invalid tags
- `500`: Database error

---

## GEOGRAPHIC ENDPOINTS

### 1. Get Memories Within Bounds

**Operation:** `SELECT FROM memories` with PostGIS bounding box

**Authentication:** Not required

**Request:**

```typescript
interface GetMemoriesInBoundsRequest {
  north: number; // Latitude
  south: number;
  east: number; // Longitude
  west: number;
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase.rpc("get_memories_in_bounds", {
  min_lat: request.south,
  max_lat: request.north,
  min_lng: request.west,
  max_lng: request.east,
});
```

**Database Function:**

```sql
CREATE OR REPLACE FUNCTION get_memories_in_bounds(
  min_lat DECIMAL,
  max_lat DECIMAL,
  min_lng DECIMAL,
  max_lng DECIMAL
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  location_name VARCHAR,
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
```

**Response:**

```typescript
interface GetMemoriesInBoundsResponse {
  memories: Array<{
    id: string;
    title: string | null;
    location_name: string;
    latitude: number;
    longitude: number;
    year: number | null;
    photo_count: number;
  }>;
}
```

**Error Codes:**

- `400`: Invalid bounds
- `500`: Database error

---

### 2. Get Memories Near Location

**Operation:** `SELECT FROM memories` with PostGIS distance query

**Authentication:** Not required

**Request:**

```typescript
interface GetMemoriesNearbyRequest {
  latitude: number;
  longitude: number;
  radius_km: number; // Radius in kilometers
  limit?: number;
}
```

**Supabase Query:**

```javascript
const { data, error } = await supabase.rpc("get_memories_nearby", {
  search_lat: request.latitude,
  search_lng: request.longitude,
  radius_km: request.radius_km,
  result_limit: request.limit || 50,
});
```

**Database Function:**

```sql
CREATE OR REPLACE FUNCTION get_memories_nearby(
  search_lat DECIMAL,
  search_lng DECIMAL,
  radius_km DECIMAL,
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  location_name VARCHAR,
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
```

**Response:**

```typescript
interface GetMemoriesNearbyResponse {
  memories: Array<{
    id: string;
    title: string | null;
    location_name: string;
    latitude: number;
    longitude: number;
    distance_km: number;
  }>;
}
```

**Error Codes:**

- `400`: Invalid coordinates or radius
- `500`: Database error

---

## EDGE FUNCTIONS

### 1. Generate Thumbnail

**Function:** `generate-thumbnail`

**Purpose:** Create compressed thumbnail from uploaded photo

**Trigger:** Called after photo upload

**Request:**

```typescript
interface GenerateThumbnailRequest {
  fileName: string; // Path in memories-photos bucket
}
```

**Function Logic:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import sharp from "https://esm.sh/sharp@0.32.0";

serve(async (req) => {
  const { fileName } = await req.json();

  // 1. Download original from storage
  const { data: fileData } = await supabase.storage
    .from("memories-photos")
    .download(fileName);

  // 2. Generate thumbnail (max 400px width, maintain aspect ratio)
  const buffer = await sharp(await fileData.arrayBuffer())
    .resize(400, null, { withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  // 3. Upload thumbnail
  await supabase.storage.from("memories-thumbnails").upload(fileName, buffer, {
    contentType: "image/jpeg",
    upsert: true,
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

**Response:**

```typescript
interface GenerateThumbnailResponse {
  success: boolean;
}
```

**Error Codes:**

- `400`: Invalid file name
- `500`: Processing failed

---

### 2. Translate Text

**Function:** `translate-text`

**Purpose:** Translate memory content using Google Translate API

**Authentication:** Not required (public)

**Request:**

```typescript
interface TranslateTextRequest {
  text: string;
  source_language?: string; // Auto-detect if not provided
  target_language: string;
}
```

**Function Logic:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { text, source_language, target_language } = await req.json();

  // Call Google Translate API
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${Deno.env.get(
      "GOOGLE_TRANSLATE_API_KEY"
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: source_language,
        target: target_language,
        format: "text",
      }),
    }
  );

  const result = await response.json();

  return new Response(
    JSON.stringify({
      translated_text: result.data.translations[0].translatedText,
      detected_source_language:
        result.data.translations[0].detectedSourceLanguage,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
});
```

**Response:**

```typescript
interface TranslateTextResponse {
  translated_text: string;
  detected_source_language?: string;
}
```

**Error Codes:**

- `400`: Invalid request
- `503`: Translation API unavailable
- `500`: Translation failed

---

## ERROR HANDLING

### Standard Error Response

```typescript
interface ErrorResponse {
  error: {
    code: string; // Error code (e.g., "UNAUTHORIZED")
    message: string; // Human-readable message
    details?: any; // Additional error details
  };
}
```

### Error Codes & HTTP Status

| Code                  | HTTP Status | Description                      | Action                   |
| --------------------- | ----------- | -------------------------------- | ------------------------ |
| `UNAUTHORIZED`        | 401         | No auth token or invalid token   | Redirect to login        |
| `FORBIDDEN`           | 403         | Authenticated but not authorized | Show error message       |
| `NOT_FOUND`           | 404         | Resource not found               | Show 404 page            |
| `VALIDATION_ERROR`    | 422         | Invalid input data               | Show validation errors   |
| `RATE_LIMITED`        | 429         | Too many requests                | Show retry message       |
| `SERVER_ERROR`        | 500         | Internal server error            | Show generic error       |
| `SERVICE_UNAVAILABLE` | 503         | Service temporarily down         | Show maintenance message |

### Error Handling Examples

**Client-Side:**

```typescript
try {
  const { data, error } = await supabase.from("memories").select("*");

  if (error) {
    throw error;
  }

  return data;
} catch (error) {
  if (error.code === "PGRST116") {
    // Not found
    console.error("Memory not found");
  } else if (error.message.includes("JWT")) {
    // Auth error
    console.error("Unauthorized");
    // Redirect to login
  } else {
    // Generic error
    console.error("Something went wrong");
  }
}
```

**Edge Function Error:**

```typescript
serve(async (req) => {
  try {
    // Function logic
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          code: "SERVER_ERROR",
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
```

---

## RATE LIMITING

### Supabase Built-in Limits

**Database Queries:**

- Free tier: 500 requests/second
- Pro tier: 1000 requests/second

**Storage:**

- Free tier: 50 MB/file
- Pro tier: 5 GB/file

**Edge Functions:**

- Free tier: 500k invocations/month
- Pro tier: 2M invocations/month

### Application-Level Rate Limiting

**Memory Creation:**

- Limit: 10 memories per user per day
- Implementation: Check count of memories created today

**Photo Upload:**

- Limit: 5 photos per memory
- Max file size: 10MB
- Implementation: Check photo_count before upload

**Reports:**

- Limit: 1 report per user per memory
- Implementation: Check existing reports before insert

**Translation:**

- Limit: 100 translations per user per day
- Implementation: Track in Edge Function with counter

### Rate Limit Headers

```typescript
// Return rate limit info in response headers
headers: {
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Remaining': '95',
  'X-RateLimit-Reset': '1640000000'  // Unix timestamp
}
```

---

## AUTHENTICATION HEADERS

### Supabase Client Setup

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
```

### Authenticated Requests

**Automatic with Supabase Client:**

```typescript
// After login, token is stored in localStorage
// All subsequent requests automatically include token

const { data, error } = await supabase
  .from('memories')
  .insert({ ... });  // Token included automatically
```

**Manual Token:**

```typescript
const token = (await supabase.auth.getSession()).data.session?.access_token;

fetch("https://your-project.supabase.co/rest/v1/memories", {
  headers: {
    Authorization: `Bearer ${token}`,
    apikey: process.env.VITE_SUPABASE_ANON_KEY,
  },
});
```

### Anonymous Session

**localStorage Token:**

```typescript
// Anonymous users have session stored in localStorage
const anonymousSession = {
  userId: "uuid-here",
  name: "User name",
  expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
};

localStorage.setItem("anonymous_session", JSON.stringify(anonymousSession));
```

**Passing to API:**

```typescript
// Include anonymous user_id in requests
const { data, error } = await supabase.from("memories").insert({
  user_id: anonymousSession.userId,
  ...memoryData,
});
```

---

## QUERY OPTIMIZATION

### Indexes

**Memories Table:**

```sql
-- Geographic queries
CREATE INDEX idx_memories_coordinates ON memories USING GIST (coordinates);

-- Time filtering
CREATE INDEX idx_memories_year ON memories (year);
CREATE INDEX idx_memories_time_period ON memories (time_period);

-- Language filtering
CREATE INDEX idx_memories_language ON memories (language);

-- Tag searching
CREATE INDEX idx_memories_tags ON memories USING GIN (tags);

-- Full-text search
CREATE INDEX idx_memories_title_search ON memories USING GIN (to_tsvector('english', title));
CREATE INDEX idx_memories_story_search ON memories USING GIN (to_tsvector('english', story));
```

### Query Performance Tips

**Use `select()` to limit columns:**

```javascript
// ❌ Don't fetch everything
const { data } = await supabase.from("memories").select("*");

// ✅ Fetch only needed columns
const { data } = await supabase
  .from("memories")
  .select("id, title, location_name");
```

**Use pagination:**

```javascript
// ❌ Don't fetch all records
const { data } = await supabase.from("memories").select("*");

// ✅ Use limit and offset
const { data } = await supabase.from("memories").select("*").range(0, 49); // First 50 records
```

**Use RPC for complex queries:**

```javascript
// ❌ Don't fetch and filter in client
const { data } = await supabase.from("memories").select("*");
const nearby = data.filter((m) => calculateDistance(m) < 10);

// ✅ Use database function
const { data } = await supabase.rpc("get_memories_nearby", {
  search_lat: 50.8503,
  search_lng: 4.3517,
  radius_km: 10,
});
```

---

## IMPLEMENTATION CHECKLIST

### Phase 2.3: Database Functions

- [ ] Create `get_memories_in_bounds()` function
- [ ] Create `get_memories_nearby()` function
- [ ] Create all necessary indexes
- [ ] Test query performance with sample data

### Phase 3.2: API Layer

- [ ] Implement memory CRUD operations
- [ ] Implement user profile operations
- [ ] Implement media upload/delete
- [ ] Add error handling for all queries
- [ ] Add loading states in UI

### Phase 3.5: Search & Filter

- [ ] Implement text search
- [ ] Implement time filtering
- [ ] Implement language filtering
- [ ] Implement tag filtering
- [ ] Implement geographic queries

### Phase 4: Edge Functions

- [ ] Deploy `generate-thumbnail` function
- [ ] Deploy `translate-text` function
- [ ] Set up Google Translate API key
- [ ] Test thumbnail generation
- [ ] Test translation caching

### Phase 5: Advanced Features

- [ ] Implement rate limiting
- [ ] Add query caching (React Query)
- [ ] Optimize database queries
- [ ] Add real-time subscriptions
- [ ] Monitor API performance

---

## TESTING STRATEGY

### Unit Tests

**Memory Creation:**

```typescript
describe("createMemory", () => {
  it("should create memory with required fields", async () => {
    const memory = await createMemory({
      title: "Test Memory",
      location_name: "Brussels, Belgium",
      latitude: 50.8503,
      longitude: 4.3517,
    });

    expect(memory.id).toBeDefined();
    expect(memory.location_name).toBe("Brussels, Belgium");
  });

  it("should reject memory without location", async () => {
    await expect(
      createMemory({
        title: "Test Memory",
      })
    ).rejects.toThrow();
  });
});
```

### Integration Tests

**End-to-End Memory Flow:**

1. Create user
2. Create memory
3. Upload photo
4. Fetch memory with photos
5. Update memory
6. Delete memory

### Load Tests

**Concurrent Users:**

- Simulate 100 concurrent users browsing map
- Test API response times under load
- Monitor database connection pool

**Geographic Queries:**

- Test with 10,000+ memories
- Measure query time for bounding box queries
- Verify index usage

---

## NEXT STEPS

✅ **API Endpoints Documentation Complete**

**Phase 1.2 Complete - Ready for Phase 2:**

- Database schema defined
- RLS policies documented
- Authentication flows planned
- Navigation structure designed
- Metadata taxonomy established
- API endpoints documented

**Next Phase: Phase 2 - Infrastructure Setup**

- 2.1: Create Supabase project
- 2.2: Run database migrations
- 2.3: Set up RLS policies
- 2.4: Configure storage buckets
- 2.5: Deploy Edge Functions
- 2.6: Connect to Vercel

---

**Document Status:** ✅ Complete  
**Last Updated:** December 27, 2025  
**Total Endpoints:** 25+ queries + 2 Edge Functions
