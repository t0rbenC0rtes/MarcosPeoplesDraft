# Phase 1.2: Metadata Taxonomy

## marcospeoples.com - Data Categorization & Classification System

**Date Created:** December 27, 2025  
**Status:** Complete  
**Purpose:** Define standardized metadata for memories

---

## TABLE OF CONTENTS

1. [Taxonomy Overview](#taxonomy-overview)
2. [Time Period Classification](#time-period-classification)
3. [Location Taxonomy](#location-taxonomy)
4. [Language Codes](#language-codes)
5. [Tags & Keywords](#tags--keywords)
6. [Memory Metadata Fields](#memory-metadata-fields)
7. [Search & Filter Strategy](#search--filter-strategy)
8. [Auto-Detection Logic](#auto-detection-logic)
9. [Data Validation Rules](#data-validation-rules)

---

## TAXONOMY OVERVIEW

### Purpose of Metadata

**Enable Discovery:**

- Timeline filtering (decade, year, era)
- Geographic exploration (city, country, region)
- Language-based browsing
- Thematic searching (keywords/tags)

**Improve UX:**

- Auto-suggest locations during submission
- Auto-detect language from story text
- Smart filtering on map
- Relevant search results

**Maintain Data Quality:**

- Standardized formats
- Consistent categorization
- Validation rules
- Deduplication

### Metadata Principles

✅ **Flexible**: All fields optional except location  
✅ **Auto-detected**: Minimize manual input where possible  
✅ **Standardized**: Consistent formats (ISO codes, standard names)  
✅ **Searchable**: Optimized for queries and filters  
✅ **Multilingual**: Support for 5 languages

---

## TIME PERIOD CLASSIFICATION

### Marcos's Lifetime: September 29, 1972 - December 12, 2025

### Decade Classification

**Supported Decades:**

```
1970s: 1970-1979 (partial - Marcos born 1972)
1980s: 1980-1989
1990s: 1990-1999
2000s: 2000-2009
2010s: 2010-2019
2020s: 2020-2025 (partial - Marcos passed 2025)
```

**Database Storage:**

```sql
time_period VARCHAR(20)  -- e.g., "1980s", "1990s"
year INTEGER              -- e.g., 1985, 1992
```

### Time Period Rules

**If User Provides Specific Year:**

- Store year as integer: `1985`
- Calculate decade: `"1980s"`
- Display: "1985" or "1985 (1980s)"

**If User Provides Only Decade:**

- Store as string: `"1980s"`
- Set year to NULL
- Display: "1980s"

**If User Provides No Time Info:**

- Both fields NULL
- Display: "Date unknown"
- Memory still appears in "All" timeline view

**Special Cases:**

```
"early 1980s"  → time_period: "1980s", year: 1981
"late 1990s"   → time_period: "1990s", year: 1998
"mid-2000s"    → time_period: "2000s", year: 2005
"childhood"    → time_period: "1970s", year: 1977 (approx age 5)
"university"   → time_period: "1990s", year: 1992 (approx age 20)
```

### Timeline Slider Behavior

**Full Range:** 1972 - 2025

**Decade Shortcuts:**

- 1970s button → Filter to 1972-1979
- 1980s button → Filter to 1980-1989
- 1990s button → Filter to 1990-1999
- 2000s button → Filter to 2000-2009
- 2010s button → Filter to 2010-2019
- 2020s button → Filter to 2020-2025

**Custom Range:**

- Drag sliders to any year range
- Example: 1985-1995 (spans two decades)

### Era Labels (Optional Enhancement)

```
"Early Years"     → 1972-1982 (Birth to age 10)
"Youth"           → 1983-1989 (Age 11-17)
"Young Adult"     → 1990-1999 (Age 18-27)
"Adulthood"       → 2000-2015 (Age 28-43)
"Recent Years"    → 2016-2025 (Age 44-53)
```

Note: Era labels are for potential UI grouping, not stored in database.

---

## LOCATION TAXONOMY

### Geographic Hierarchy

```
World
  └─ Continent
      └─ Country
          └─ Region/State/Province
              └─ City
                  └─ Neighborhood (optional)
                      └─ Specific Place (optional)
```

### Primary Locations (Based on Marcos's Life)

**Brussels, Belgium:**

```json
{
  "city": "Brussels",
  "region": "Brussels-Capital Region",
  "country": "Belgium",
  "continent": "Europe",
  "coordinates": {
    "latitude": 50.8503,
    "longitude": 4.3517
  }
}
```

**London, United Kingdom:**

```json
{
  "city": "London",
  "region": "England",
  "country": "United Kingdom",
  "continent": "Europe",
  "coordinates": {
    "latitude": 51.5074,
    "longitude": -0.1278
  }
}
```

**Santiago de Chile, Chile:**

```json
{
  "city": "Santiago",
  "region": "Santiago Metropolitan Region",
  "country": "Chile",
  "continent": "South America",
  "coordinates": {
    "latitude": -33.4489,
    "longitude": -70.6693
  }
}
```

### Location Database Fields

```sql
-- Human-readable location string
location_name VARCHAR(255)     -- "Brussels, Belgium"

-- Structured components (optional, for filtering)
city VARCHAR(100)              -- "Brussels"
country VARCHAR(100)           -- "Belgium"

-- Geographic coordinates (PostGIS)
coordinates GEOGRAPHY(POINT)   -- PostGIS POINT
latitude DECIMAL(10, 8)        -- 50.8503
longitude DECIMAL(11, 8)       -- 4.3517
```

### Location Formats

**Display Format (User-Facing):**

```
"Brussels, Belgium"
"London, United Kingdom"
"Santiago de Chile, Chile"
"Antwerp, Belgium"
"Paris, France"
```

**Search Format (Queries):**

- By city: `city = 'Brussels'`
- By country: `country = 'Belgium'`
- By region: `coordinates within bounding box`

### Location Auto-Complete

**Data Source:** Mapbox Geocoding API or similar

**When User Types Location:**

1. Query geocoding API with input
2. Show suggestions with format: "City, Country"
3. User selects from list
4. Extract: city, country, coordinates
5. Store all fields

**Fallback:**

- User can type free-form location
- Store in `location_name` field
- Parse city/country if possible
- Geocode coordinates in background

### Common Location Aliases

```
"Brussels" → "Brussels, Belgium"
"Bruxelles" → "Brussels, Belgium"
"London" → "London, United Kingdom"
"Santiago" → "Santiago, Chile"
"Stgo" → "Santiago, Chile"
"UK" → "United Kingdom"
```

### Special Locations

```
"Multiple locations" → Multiple markers or centroid
"Virtual/Online" → No physical location (optional icon)
"Unknown location" → Coordinates NULL, location_name = "Unknown"
```

---

## LANGUAGE CODES

### Supported Languages (ISO 639-1)

Based on Marcos's international connections:

| Language   | Code | Native Name | Countries         |
| ---------- | ---- | ----------- | ----------------- |
| English    | `en` | English     | UK, International |
| French     | `fr` | Français    | Belgium           |
| Spanish    | `es` | Español     | Chile             |
| Dutch      | `nl` | Nederlands  | Belgium           |
| Portuguese | `pt` | Português   | Brazil            |

### Language Field

```sql
language VARCHAR(5)  -- ISO 639-1 code: 'en', 'fr', 'es', 'nl', 'pt'
```

### Language Detection

**Auto-Detection on Submit:**

1. Analyze memory story text
2. Use language detection library (e.g., `franc`, `langdetect`)
3. Set `language` field automatically
4. User can override if incorrect

**Detection Examples:**

```javascript
"I remember the summer in Brussels..." → 'en'
"Je me souviens de l'été à Bruxelles..." → 'fr'
"Recuerdo el verano en Bruselas..." → 'es'
"Ik herinner me de zomer in Brussel..." → 'nl'
"Eu me lembro do verão em Bruxelas..." → 'pt'
```

**Confidence Threshold:**

- If confidence > 80%: Auto-set language
- If confidence < 80%: Prompt user to confirm
- If detection fails: Default to 'en' (most common)

### Language Selector (UI)

**During Memory Submission:**

- Auto-detected and shown
- Dropdown to change: "Language: English ▼"
- Options: English, Français, Español, Nederlands, Português

**During Browsing:**

- Filter panel: Checkboxes for each language
- Header: UI language selector (separate from content language)

---

## TAGS & KEYWORDS

### Tag Purpose

**Enable Thematic Discovery:**

- Find memories about specific topics
- Cross-reference related memories
- Discover patterns (e.g., "all memories about music")

### Tag System Architecture

**Freeform Tags:**

- Users can add custom tags during submission
- No predefined list (initially)
- Tags stored as array: `tags TEXT[]`

**Tag Format:**

- Lowercase
- No special characters (except hyphens)
- Max 30 characters per tag
- Max 10 tags per memory

**Example Tags:**

```
"music", "concert", "family", "vacation", "work",
"birthday", "wedding", "travel", "friendship", "food"
```

### Tag Suggestions (Phase 5)

**Auto-Suggest Based on Content:**

- NLP analysis of story text
- Extract common themes
- Suggest 3-5 relevant tags
- User approves/edits

**Popular Tags:**

- Show most frequently used tags
- Click to add to current memory

### Tag Storage

```sql
-- In memories table
tags TEXT[]  -- PostgreSQL array: ['music', 'concert', 'brussels']

-- Query memories with specific tag
SELECT * FROM memories WHERE 'music' = ANY(tags);

-- Query memories with any of multiple tags
SELECT * FROM memories WHERE tags && ARRAY['music', 'travel'];
```

### Reserved/System Tags (Optional)

```
"photo-only" → Memory with no text, only photos
"milestone" → Significant life event
"group" → Multiple people in photos
```

### Tag Cloud (Future UI Element)

```
music (24)  •  family (18)  •  travel (15)  •  food (12)
brussels (32)  •  london (8)  •  santiago (6)
```

Size of tag = frequency of use

---

## MEMORY METADATA FIELDS

### Complete Field List

```sql
-- Core Content
id UUID
user_id UUID
title VARCHAR(500)              -- Optional
story TEXT                      -- Optional
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- Time Classification
time_period VARCHAR(20)         -- "1980s", "1990s", etc.
year INTEGER                    -- 1985, 1992, etc.

-- Location Classification
location_name VARCHAR(255)      -- "Brussels, Belgium"
city VARCHAR(100)               -- "Brussels"
country VARCHAR(100)            -- "Belgium"
coordinates GEOGRAPHY(POINT)    -- PostGIS for map queries
latitude DECIMAL(10, 8)         -- 50.8503
longitude DECIMAL(11, 8)        -- 4.3517

-- Language & Categorization
language VARCHAR(5)             -- ISO 639-1: 'en', 'fr', 'es'
tags TEXT[]                     -- ['music', 'concert', 'brussels']

-- Media Stats
photo_count INTEGER DEFAULT 0   -- Number of attached photos

-- Moderation
is_hidden BOOLEAN DEFAULT FALSE
is_deleted BOOLEAN DEFAULT FALSE
```

### Metadata Display Priority

**Always Show:**

- Author name + profile pic
- Location (city, country)
- Time period or year

**Show if Available:**

- Title (if provided)
- Tags (if provided)
- Specific date (if year provided)

**Never Show:**

- Internal IDs
- Timestamps (created_at, updated_at)
- Moderation flags
- User IDs

---

## SEARCH & FILTER STRATEGY

### Search Functionality

**Search Bar Matches:**

1. **Memory titles** (partial match, case-insensitive)
2. **Memory stories** (full-text search)
3. **Location names** (city, country)
4. **Author names** (user.name)
5. **Year** (exact match: "1985")
6. **Tags** (exact match: "music")

**Search Query Example:**

```sql
SELECT * FROM memories m
JOIN users u ON m.user_id = u.id
WHERE
  (m.title ILIKE '%brussels%' OR
   m.story ILIKE '%brussels%' OR
   m.location_name ILIKE '%brussels%' OR
   u.name ILIKE '%brussels%' OR
   m.year::text = 'brussels' OR
   'brussels' = ANY(m.tags))
  AND m.is_hidden = FALSE
  AND m.is_deleted = FALSE
ORDER BY m.created_at DESC;
```

### Filter Options

**Timeline Filter:**

- Slider: Year range (1972-2025)
- Buttons: Decade shortcuts (1970s, 1980s, etc.)
- Reset button

**Language Filter:**

- Checkboxes: □ English, □ Français, □ Español, □ Nederlands, □ Português
- "All languages" checkbox

**Location Filter:**

- Search input: Type city or country
- Dropdown of popular locations
- Geographic bounds on map

**Tag Filter (Future):**

- Tag cloud or list
- Multi-select checkboxes
- Show memory count per tag

### Filter Combination Logic

**Multiple Filters = AND Logic:**

```
Timeline: 1980-1989
+ Language: French
+ Location: Brussels
= Show only French memories from Brussels in the 1980s
```

**Search + Filters = AND Logic:**

```
Search: "music"
+ Timeline: 1990s
= Show only memories containing "music" from the 1990s
```

---

## AUTO-DETECTION LOGIC

### Language Detection

**Library:** `franc` or `langdetect` (JavaScript)

**Process:**

1. User types memory story
2. On blur or every N characters, detect language
3. Show detected language in UI
4. Allow user to override

**Example:**

```javascript
import { franc } from "franc";

const detectLanguage = (text) => {
  if (text.length < 20) return "en"; // Too short to detect

  const detected = franc(text);

  // Map franc codes to our supported languages
  const languageMap = {
    eng: "en",
    fra: "fr",
    spa: "es",
    nld: "nl",
    por: "pt",
  };

  return languageMap[detected] || "en"; // Default to English
};
```

### Location Geocoding

**Service:** Mapbox Geocoding API

**Process:**

1. User clicks on map to select location
2. Reverse geocode: coordinates → address
3. Extract: city, country
4. Store all data

**Or:**

1. User types location name in search
2. Forward geocode: address → coordinates
3. Show suggestions
4. User selects → Store all data

**Example API Response:**

```json
{
  "features": [
    {
      "place_name": "Brussels, Belgium",
      "center": [4.3517, 50.8503],
      "place_type": ["place"],
      "properties": {
        "wikidata": "Q239"
      },
      "context": [
        { "id": "region.123", "text": "Brussels-Capital Region" },
        { "id": "country.456", "text": "Belgium" }
      ]
    }
  ]
}
```

### Time Period Calculation

**From Year:**

```javascript
const calculateDecade = (year) => {
  if (!year) return null;
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
};

// Examples:
calculateDecade(1985) → "1980s"
calculateDecade(1992) → "1990s"
calculateDecade(2005) → "2000s"
```

**From Text (Advanced - Future):**

```javascript
const textToTimePeriod = (text) => {
  // Parse phrases like "early 80s", "late nineties"
  if (text.includes("80s") || text.includes("eighties")) return "1980s";
  if (text.includes("90s") || text.includes("nineties")) return "1990s";
  // ... more patterns
};
```

---

## DATA VALIDATION RULES

### Required Fields (Database Level)

```sql
-- Only these fields are truly required
user_id UUID NOT NULL
coordinates GEOGRAPHY(POINT)  -- At least location is required

-- Everything else is optional
title VARCHAR(500)            -- Optional
story TEXT                    -- Optional
year INTEGER                  -- Optional
time_period VARCHAR(20)       -- Optional
```

### Recommended Fields (Application Level)

**Prompt User if Missing:**

- Story OR Title OR Photos (at least one form of content)
- Time period (at least decade)

**Show Warning:**

- "Adding a year helps others discover your memory"
- "Consider adding tags for better searchability"

### Validation Rules

**Time Period:**

```javascript
// Valid values
const validDecades = ["1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];

// Year range
const isValidYear = (year) => year >= 1972 && year <= 2025;
```

**Location:**

```javascript
// Must have coordinates OR location_name
const validateLocation = (memory) => {
  return memory.coordinates || memory.location_name;
};
```

**Language:**

```javascript
// Must be one of supported languages
const validLanguages = ["en", "fr", "es", "nl", "pt"];

const isValidLanguage = (lang) => validLanguages.includes(lang);
```

**Tags:**

```javascript
// Tag validation
const validateTag = (tag) => {
  return (
    tag.length > 0 && tag.length <= 30 && /^[a-z0-9-]+$/.test(tag) // Lowercase alphanumeric + hyphens only
  );
};

// Max 10 tags per memory
const validateTags = (tags) => {
  return tags.length <= 10 && tags.every(validateTag);
};
```

**Title & Story:**

```javascript
// Optional but if provided, enforce length limits
const validateTitle = (title) => title.length <= 500;
const validateStory = (story) => story.length <= 10000; // ~2000 words
```

---

## METADATA MIGRATION STRATEGY

### Initial Launch (Phase 1-3)

**Minimal Metadata:**

- Location (required)
- Time period (optional, encouraged)
- Language (auto-detected)
- Title, story (optional)

**No Tags System:**

- Tags array exists in schema
- Not exposed in UI yet
- Reserved for Phase 5

### Phase 5 Enhancements

**Add Tag System:**

- UI for adding/managing tags
- Tag suggestions based on content
- Tag cloud for discovery
- Popular tags sidebar

**Add Advanced Filters:**

- Filter by tags
- Multiple location selection
- Saved searches (user preferences)

**Add Auto-Tagging:**

- NLP analysis of story content
- Suggest tags based on common themes
- Learn from user corrections

### Backfilling Metadata

**If Location Missing:**

- Prompt user to add when they edit memory
- Show "Help us improve: Add location" banner

**If Language Missing:**

- Run language detection on existing stories
- Update database in background

**If Time Period Missing:**

- Suggest based on photo EXIF data (if available)
- Prompt user during edit

---

## IMPLEMENTATION CHECKLIST

### Phase 2.2: Database Setup

- [x] Include all metadata fields in schema
- [x] Create indexes on: time_period, year, language, coordinates
- [x] Set up GIN index for tags array
- [x] Configure PostGIS for geographic queries

### Phase 3.4: Memory Submission Form

- [ ] Location picker (map click or search)
- [ ] Year input (optional)
- [ ] Decade dropdown (optional)
- [ ] Language auto-detection + override
- [ ] Title & story text areas
- [ ] Tag input (Phase 5)

### Phase 3.3: Map Interface

- [ ] Timeline slider component (Chakra UI)
- [ ] Search bar with live filtering
- [ ] Filter panel (language, optional location)
- [ ] Marker clustering with decade colors

### Phase 5: Advanced Features

- [ ] Tag management UI
- [ ] Tag suggestions (NLP)
- [ ] Popular tags cloud
- [ ] Filter by tags
- [ ] Advanced search (multiple criteria)

---

## EXAMPLE METADATA SETS

### Example 1: Detailed Memory

```json
{
  "id": "a7b3c9d2-1234-5678-90ab-cdef12345678",
  "user_id": "user-uuid",
  "title": "Summer Concert at AB",
  "story": "I remember that amazing night when we all went to see the band at Ancienne Belgique...",
  "language": "en",
  "time_period": "1990s",
  "year": 1995,
  "location_name": "Brussels, Belgium",
  "city": "Brussels",
  "country": "Belgium",
  "coordinates": {
    "latitude": 50.8503,
    "longitude": 4.3517
  },
  "tags": ["music", "concert", "ab", "friends", "brussels"],
  "photo_count": 3,
  "created_at": "2025-12-27T10:30:00Z"
}
```

### Example 2: Minimal Memory

```json
{
  "id": "uuid-here",
  "user_id": "user-uuid",
  "title": null,
  "story": "Great memories from London",
  "language": "en",
  "time_period": null,
  "year": null,
  "location_name": "London, United Kingdom",
  "city": "London",
  "country": "United Kingdom",
  "coordinates": {
    "latitude": 51.5074,
    "longitude": -0.1278
  },
  "tags": [],
  "photo_count": 1,
  "created_at": "2025-12-27T11:00:00Z"
}
```

### Example 3: Photo-Only Memory

```json
{
  "id": "uuid-here",
  "user_id": "user-uuid",
  "title": null,
  "story": null,
  "language": "en", // Default
  "time_period": "2000s",
  "year": 2005,
  "location_name": "Santiago, Chile",
  "city": "Santiago",
  "country": "Chile",
  "coordinates": {
    "latitude": -33.4489,
    "longitude": -70.6693
  },
  "tags": ["photo-only"],
  "photo_count": 5,
  "created_at": "2025-12-27T12:00:00Z"
}
```

---

## NEXT STEPS

✅ **Metadata Taxonomy Complete**

**Now Ready For:**

- Task 6: Document API endpoints

**For Implementation:**

- Use this taxonomy when building submission forms
- Reference when implementing search/filter logic
- Follow validation rules during data entry
- Use language codes for i18n

**Future Enhancements:**

- Machine learning for better tag suggestions
- EXIF data extraction from photos (automatic date/location)
- Collaborative tagging (users suggest tags for others' memories)
- Tag translation across languages

---

**Document Status:** ✅ Complete  
**Last Updated:** December 27, 2025  
**Metadata Strategy:** Flexible, auto-detected, standardized, searchable
