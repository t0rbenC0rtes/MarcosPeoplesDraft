# Phase 1.2: Site Navigation Structure

## marcospeoples.com - Information Architecture & Routes

**Date Created:** December 27, 2025  
**Status:** In Progress  
**Navigation Style:** Map-centric with minimal chrome

---

## TABLE OF CONTENTS

1. [Navigation Philosophy](#navigation-philosophy)
2. [Site Map](#site-map)
3. [URL Structure](#url-structure)
4. [Page Specifications](#page-specifications)
5. [Navigation Components](#navigation-components)
6. [Mobile Navigation](#mobile-navigation)
7. [User Flows](#user-flows)
8. [Breadcrumbs & Back Navigation](#breadcrumbs--back-navigation)

---

## NAVIGATION PHILOSOPHY

### Core Principles

**Map as Primary Navigation**

- Interactive map is the homepage and main interface
- Memories discovered through geographical exploration
- Map always accessible (persistent across views)

**Minimal UI Chrome**

- Focus on content, not navigation bars
- Clean, unobtrusive interface elements
- Navigation fades into background

**No Traditional "About" Page**

- Everyone knows Marcos
- His story told through contributed memories
- Site purpose self-evident

**Seamless Flows**

- Smooth transitions between views
- Modal overlays instead of full page loads (where appropriate)
- "Return to map" always available

---

## SITE MAP

### Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     marcospeoples.com                        │
│              (Home / Map View with Components)               │
│                                                              │
│  • Interactive Timeline (overlay component)                  │
│  • Search Bar (below map)                                   │
│  • Memory Detail Modals                                     │
│  • Filter Panel                                             │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─→ Memory Detail Modal (/:memoryId)
             │   └─→ Photo Gallery Modal (/:memoryId/photo/:photoId)
             │
             ├─→ Share Memory (/share)
             │   ├─→ [Auth Modal if not logged in]
             │   └─→ Submit Form → Back to Map
             │
             ├─→ Profile (/profile or /profile/:userId)
             │   └─→ User's contributions list & edit
             │
             ├─→ Auth Callback (/auth/callback)
             │   └─→ Redirect to intended destination
             │
             ├─→ Admin Dashboard (/admin) [Password Protected]
             │   └─→ Moderation tools
             │
             └─→ Footer Pages
                 ├─→ How to Contribute (/contribute)
                 ├─→ Privacy Policy (/privacy)
                 └─→ Terms of Use (/terms)
```

### Page Hierarchy

**Level 1: Core Experience (Single Page)**

- Home / Map View (/) with integrated components:
  - Interactive Timeline (slider overlay)
  - Search Bar (below map)
  - Memory Detail Modals
  - Filter Panel

**Level 2: Full Pages**

- Share Memory (/share)
- User Profile (/profile)

**Level 3: Special Routes**

- Admin Dashboard (/admin) - Password protected
- Photo Gallery (/:memoryId/photo/:photoId)

**Level 4: Legal/Info**

- How to Contribute (/contribute)
- Privacy Policy (/privacy)
- Terms of Use (/terms)

---

## URL STRUCTURE

### Route Definitions

| Route                       | Type     | Purpose                                    | Auth Required   |
| --------------------------- | -------- | ------------------------------------------ | --------------- |
| `/`                         | Page     | Home - Map with timeline, search, filters  | No              |
| `/:memoryId`                | Modal    | Memory detail view (modal over map)        | No              |
| `/share`                    | Page     | Submit new memory form                     | Yes\*           |
| `/profile`                  | Page     | View/edit user's own contributions         | Yes             |
| `/profile/:userId`          | Page     | View another user's contributions (future) | No              |
| `/:memoryId/photo/:photoId` | Modal    | Fullscreen photo gallery                   | No              |
| `/auth/callback`            | Redirect | OAuth callback handler                     | N/A             |
| `/admin`                    | Page     | Moderation dashboard                       | Yes (Admin)\*\* |
| `/contribute`               | Page     | How to contribute guide                    | No              |
| `/privacy`                  | Page     | Privacy policy                             | No              |
| `/terms`                    | Page     | Terms of use                               | No              |

\*Auth requested on page load via modal  
\*\*Password protected admin access

### URL Examples

**Memory Detail (Modal over map):**

- `https://marcospeoples.com/a7b3c9d2-1234-5678-90ab-cdef12345678`
- Opens memory modal overlay on map

**Memory with Location:**

- `https://marcospeoples.com/?lat=50.8503&lng=4.3517&zoom=12&memory=a7b3c9d2`
- Opens map centered on location with memory modal

**Photo Gallery:**

- `https://marcospeoples.com/a7b3c9d2/photo/photo-uuid-here`
- Opens fullscreen photo modal

**Profile:**

- `https://marcospeoples.com/profile` - Current user's profile
- `https://marcospeoples.com/profile/user-uuid` - Another user's profile (future)

**Admin Dashboard:**

- `https://marcospeoples.com/admin` - Password protected

### Query Parameters

**Map State:**

```
/?lat={latitude}&lng={longitude}&zoom={level}
```

Example: `/?lat=50.8503&lng=4.3517&zoom=12`

**Filters (applied to map):**

```
/?year={year}&language={lang}&location={city}
```

Example: `/?year=1985&language=fr`

**Timeline Filter:**

```
/?timeline=1980s
or
/?timelineStart=1980&timelineEnd=1989
```

Example: `/?timeline=1980s` (filters map to show only 1980s memories)

**Search (applies to map):**

```
/?search={query}
```

Example: `/?search=brussels` (filters map markers + highlights in search bar)

**Memory Preview:**

```
/?memory={memoryId}
```

Example: `/?memory=a7b3c9d2` (opens memory modal over map)

---

## PAGE SPECIFICATIONS

### 1. Home / Map View (`/`)

**Purpose:** Primary interface - explore memories through interactive map with integrated timeline and search

**Layout:**

```
┌────────────────────────────────────────────────────────────┐
│ Header (minimal)                                            │
│ [Logo] [Language] [Theme] [Share Memory] [Profile] [User]  │
├────────────────────────────────────────────────────────────┤
│ Timeline Slider (overlay at top - Chakra UI)               │
│ [1972 ====●========●●●====●●====●● 2025] [Reset]          │
├────────────────────────────────────────────────────────────┤
│                                                             │
│                  INTERACTIVE GLOBE MAP                      │
│                  (Full viewport)                            │
│                                                             │
│                  • Memory markers                           │
│                  • Clusters                                 │
│                  • Hover previews                           │
│                                                             │
├────────────────────────────────────────────────────────────┤
│ Search Bar (below map)                                      │
│ [🔍 Search by name, year, location, or memory...]          │
├────────────────────────────────────────────────────────────┤
│ Footer (minimal)                                            │
│ Celebrating {count} memories • How to Contribute • Privacy │
└────────────────────────────────────────────────────────────┘
```

**Key Features:**

- Full-screen globe map interface (Mapbox spheric projection)
- **Interactive Timeline** (top overlay):
  - Slider component (consider Chakra UI RangeSlider)
  - Drag to select year range (e.g., 1980-1989)
  - Visual indicators show memory distribution across years
  - Filters map markers in real-time
  - Reset button to clear timeline filter
- **Search Bar** (below map):
  - Search matches: names, years, locations, memory text
  - Live filtering as you type
  - Highlights matching markers on map
  - No separate search results page
- Markers for individual memories
- Cluster markers for groups
- Hover shows memory preview card
- Click marker → Opens memory detail modal
- Map controls (zoom, rotate globe, style toggle)
- Optional filter panel for language/additional filters

**URL Handling:**

- Default: Globe view of all memories (1972-2025)
- With timeline param: `/?timeline=1980s` filters to decade
- With search param: `/?search=brussels` filters and highlights

**Mobile Behavior:**

- Full-screen map
- Timeline slider at top (touch-friendly)
- Search bar below map (sticky)
- Tap marker → Memory detail modal (not full page)
- Bottom navigation bar (Map, Share, Profile)

---

### 2. Memory Detail (`/:memoryId`)

**Purpose:** Display full memory with story, photos, and metadata

**Desktop Layout (Modal over map):**

```
┌────────────────────────────────────────────────────────────┐
│                     MAP (blurred)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MEMORY MODAL                              [X Close] │  │
│  │  ─────────────────────────────────────────────────── │  │
│  │                                                       │  │
│  │  Photo Gallery (main + thumbnails)                   │  │
│  │                                                       │  │
│  │  ─────────────────────────────────────────────────── │  │
│  │                                                       │  │
│  │  Title: "Summer in Brussels"                         │  │
│  │  By: Maria Santos • July 1985 • Brussels, Belgium   │  │
│  │                                                       │  │
│  │  Story:                                               │  │
│  │  Lorem ipsum dolor sit amet, consectetur adipiscing  │  │
│  │  elit. Memory text here...                           │  │
│  │                                                       │  │
│  │  [Translate to English ▼] [Share] [Report]          │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Mobile Layout (Modal):**

```
┌────────────────────────────────────┐
│ [X Close]          [•••]           │
├────────────────────────────────────┤
│                                    │
│   Photo Gallery (swipeable)        │
│                                    │
├────────────────────────────────────┤
│                                    │
│ Title: "Summer in Brussels"       │
│                                    │
│ 👤 Maria Santos                   │
│ 📍 Brussels, Belgium               │
│ 📅 July 1985                       │
│                                    │
│ Story:                             │
│ Lorem ipsum dolor sit amet...      │
│                                    │
│                                    │
│ [Translate] [Share] [Report]      │
│                                    │
└────────────────────────────────────┘
```

**Key Features:**

- Photo gallery with swipe/arrows
- Memory story (full text)
- Author info with profile pic (click to view their profile)
- Location and date metadata
- Translation button (if memory in different language)
- Share button (copy link, social media)
- Report button (if inappropriate)

**Actions:**

- Close/Back → Return to map
- Click photo → Fullscreen gallery modal
- Click author name → Navigate to /profile/:userId
- Translate → Show translated version
- Share → Copy link or open share sheet

**URL Behavior:**

- Direct link loads memory modal over map
- ESC key or click outside closes modal → Return to map
- Back button closes modal → Return to map
- Shareable URL with memory ID

---

### 3. Share Memory (`/share`)

│ │
│ Photo Gallery (swipeable) │
│ │
├────────────────────────────────────┤
│ │
│ Title: "Summer in Brussels" │
│ │
│ 👤 Maria Santos │
│ 📍 Brussels, Belgium │
│ 📅 July 1985 │
│ │
│ Story: │
│ Lorem ipsum dolor sit amet... │
│ │
│ │
│ [Translate] [Share] [Report] │
│ │
└────────────────────────────────────┘

```

**Key Features:**

- Photo gallery with swipe/arrows
- Memory story (full text)
- Author info with profile pic
- Location and date metadata
- Translation button (if memory in different language)
- Share button (copy link, social media)
- Report button (if inappropriate)

**Actions:**

- Close/Back → Return to map
- Click photo → Fullscreen gallery view
- Translate → Show translated version
- Share → Copy link or open share sheet

**URL Behavior:**

- Direct link loads memory over map
- Back button returns to map
- Shareable URL with memory ID

---

### 3. Share Memory (`/share`)

**Purpose:** Form to submit new memory with photos and location

**Layout:**

```

┌────────────────────────────────────────────────────────────┐
│ [← Back to Map] Step 1 of 3│
├────────────────────────────────────────────────────────────┤
│ │
│ Share Your Memory of Marcos │
│ │
│ Step 1: Tell Your Story │
│ ───────────────────────────── │
│ │
│ Title (optional) │
│ [_____________________________________________] │
│ │
│ Your Memory │
│ [_____________________________________________] │
│ [_____________________________________________] │
│ [_____________________________________________] │
│ [_____________________________________________] │
│ │
│ When did this happen? (optional) │
│ Year: [____] or Time period: [1970s ▼] │
│ │
│ [Cancel] [Next: Add Photos →] │
│ │
└────────────────────────────────────────────────────────────┘

```

**Multi-Step Form:**

**Step 1: Tell Your Story**

- Title (optional, max 500 chars)
- Story text (optional, max 5000 chars)
- Time period (optional - year or decade)

**Step 2: Add Photos**

- Drag & drop upload area
- Multiple file selection
- Image preview thumbnails
- Reorder photos
- Max 20 photos
- Skip option

**Step 3: Select Location**

- Interactive map
- Search for location
- Click to place marker
- Confirm location name

**Step 4: Review & Submit**

- Preview all entered data
- Edit any section
- Submit button

**Key Features:**

- Progressive disclosure (steps)
- Save draft automatically (localStorage)
- All fields optional except location
- Image compression on upload
- Preview before submit

**Auth Handling:**

- If not authenticated: Show auth modal on page load
- Choose Google OAuth or Anonymous
- After auth: Continue with form

**Mobile Behavior:**

- Full-screen form
- One step visible at a time
- Touch-friendly inputs
- Mobile photo upload

---

### 4. User Profile (`/profile` or `/profile/:userId`)

**Purpose:** View and manage user's contributed memories

**Layout:**

```

┌────────────────────────────────────────────────────────────┐
│ [← Back to Map] │
├────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Profile Picture] │ │
│ │ │ │
│ │ Maria Santos │ │
│ │ 📅 Member since December 2025 │ │
│ │ 📝 3 memories shared │ │
│ │ │ │
│ │ [Edit Profile] (if own profile) │ │
│ └─────────────────────────────────────────────────────┘ │
│ │
│ My Contributions │
│ ───────────────────────────────────────────────────── │
│ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Photo] "Summer in Brussels" [Edit] │ │
│ │ July 1985 • Brussels, Belgium [Delete] │ │
│ │ 3 photos • 247 words │ │
│ └────────────────────────────────────────────────────┘ │
│ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Photo] "Concert at AB" [Edit] │ │
│ │ 1990s • Brussels, Belgium [Delete] │ │
│ │ 2 photos • 156 words │ │
│ └────────────────────────────────────────────────────┘ │
│ │
└────────────────────────────────────────────────────────────┘

```

**Key Features:**

- Profile information (name, profile pic, join date)
- List of all memories contributed by user
- Memory cards with preview
- Edit button for each memory (redirects to edit form)
- Delete button with confirmation modal
- Statistics (# of memories, total photos, total views)

**Own Profile vs Other User's Profile:**

**Own Profile (`/profile`):**
- Full edit capabilities
- Delete memories
- Edit profile information (name, profile pic if Google)
- Available for both authenticated and guest users*

**Other User's Profile (`/profile/:userId`):**
- Read-only view
- No edit/delete buttons
- Can click memories to view details
- Future feature

*Note: Guest users have profile page if technically feasible, otherwise auth-only

**Auth Requirements:**
- Must be authenticated to access /profile
- Can view own contributions only (initially)
- Future: Public profiles for all users

**Mobile Behavior:**
- Full-screen page
- Stack memory cards vertically
- Swipe to reveal edit/delete actions
- Touch-friendly buttons

---

### 5. Admin Dashboard (`/admin`)

**Purpose:** Moderation tools for site administrators

**Layout:**

```

┌────────────────────────────────────────────────────────────┐
│ Admin Dashboard [Sign Out] │
├────────────────────────────────────────────────────────────┤
│ │
│ ┌──────────┬──────────┬──────────┬──────────┐ │
│ │ Reports │ Memories │ Users │ Settings │ │
│ │ 5 │ 147 │ 52 │ │ │
│ └──────────┴──────────┴──────────┴──────────┘ │
│ │
│ Pending Reports (5) │
│ ───────────────────────────────────────────────────── │
│ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Report #1234 │ │
│ │ Memory: "Summer in Brussels" │ │
│ │ Reason: Inappropriate content │ │
│ │ Reported by: John Doe • 2 hours ago │ │
│ │ │ │
│ │ [View Memory] [Dismiss] [Hide Memory] [Delete] │ │
│ └────────────────────────────────────────────────────┘ │
│ │
│ Recent Memories │
│ ───────────────────────────────────────────────────── │
│ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Photo] "Concert at AB" │ │
│ │ By anonymous • 5 minutes ago │ │
│ │ [View] [Hide] [Delete] │ │
│ └────────────────────────────────────────────────────┘ │
│ │
└────────────────────────────────────────────────────────────┘

```

**Key Features:**

- Dashboard overview (stats, pending actions)
- Reports management:
  - View reported memories
  - Review reporter's reason
  - Actions: Dismiss, hide, or delete memory
  - Moderator notes
- Memory management:
  - View all memories (including hidden)
  - Hide/unhide memories
  - Delete memories permanently
  - Bulk actions
- User management (Phase 5):
  - View all users
  - Manage moderator list
  - Ban/unban users (future)
- Activity log (audit trail)

**Auth Requirements:**
- Password protected route
- Requires admin credentials
- Not accessible via regular auth (Google/Anonymous)
- Separate login form at /admin

**Security:**
- Admin password stored securely (environment variable)
- Session timeout after 30 minutes
- IP logging for all admin actions
- Two-factor authentication (future enhancement)

**Mobile Behavior:**
- Full responsive design
- Tab navigation for sections
- Touch-friendly action buttons
- Optimized for tablet use

---

### 6. Search Results (REMOVED)

**Note:** Search is now integrated into the main map view via search bar. No separate search results page.

---

### 7. Timeline View (REMOVED)

**Note:** Timeline is now an overlay component on the main map view. No separate timeline page.

---

### 8. Photo Gallery (`/:memoryId/photo/:photoId`)

**Purpose:** Fullscreen photo viewing experience

**Layout:**

```

┌────────────────────────────────────────────────────────────┐
│ [X Close]│
│ │
│ │
│ │
│ │
│ FULLSCREEN PHOTO │
│ │
│ │
│ │
│ │
│ [← Prev] [Next →] │
│ │
│ ● ○ ○ ○ ○ (3 of 5) │
└────────────────────────────────────────────────────────────┘

```

**Key Features:**

- Black background
- Fullscreen photo display
- Left/right arrows for navigation
- Keyboard shortcuts (arrow keys, ESC)
- Swipe gestures on mobile
- Photo counter
- Thumbnail strip (optional)

**Actions:**

- Close → Return to memory detail modal
- Next/Prev → Navigate photos
- ESC key → Close
- Click outside → Close

---

### 9. Auth Callback (`/auth/callback`)

**Purpose:** Handle OAuth redirects

**Behavior:**

- No UI (loading state only)
- Process OAuth tokens
- Create/load user profile
- Redirect to intended destination
- Show error if auth fails

---

### 10. Footer Pages

#### How to Contribute (`/contribute`)

- Step-by-step guide
- FAQ
- Contact information
- Examples of good memories

#### Privacy Policy (`/privacy`)

- Data collection practices
- Cookie usage
- Photo rights
- Deletion requests

#### Terms of Use (`/terms`)

- Acceptable content
- Moderation policy
- Copyright
- Liability

---

## NAVIGATION COMPONENTS

### Header Navigation

**Desktop:**

```

┌────────────────────────────────────────────────────────────┐
│ MARCOSPEOPLES.COM [EN ▼] [☀️/🌙] [Share] [Profile] │
│ [👤] │
└────────────────────────────────────────────────────────────┘

```

**Elements:**

- Logo/Site name (left) → Links to home
- Language selector (center-right)
- Theme toggle (center-right)
- "Share a Memory" button (prominent, right)
- "Profile" link (right, if authenticated)
- User menu (right)

**User Menu (Unauthenticated):**

- Sign in

**User Menu (Authenticated):**

- Profile name/picture
- My Profile → /profile
- Sign out (Google only)

---

### Mobile Header

**Collapsed:**

```

┌────────────────────────────────────┐
│ [☰] MARCOSPEOPLES.COM [EN] [👤]│
└────────────────────────────────────┘

```

**Expanded (Slide-out Menu):**

```

┌────────────────────────────────────┐
│ [X] Menu │
├────────────────────────────────────┤
│ │
│ [👤] Profile (if authenticated) │
│ [🌐] Language: English ▼ │
│ [☀️] Theme: Light ▼ │
│ │
│ ─────────────────────────────── │
│ │
│ [ℹ️] How to Contribute │
│ [🔒] Privacy Policy │
│ [📄] Terms of Use │
│ │
└────────────────────────────────────┘

```

---

### Mobile Bottom Navigation Bar

**Fixed at bottom:**

```

┌────────────────────────────────────┐
│ │
│ [🗺️] [➕] [👤] │
│ Map Share Profile │
│ │
└────────────────────────────────────┘

```

**Buttons:**
- Map (home icon) → Return to map view
- Share (plus icon) → Navigate to /share
- Profile (user icon) → Navigate to /profile (or show auth modal if not logged in)

**Behavior:**
- Fixed position, always visible
- Highlights current page
- Touch-friendly spacing (min 44px tap targets)

```

┌────────────────────────────────────────────────────────────┐
│ [X Close]│
│ │
│ │
│ │
│ │
│ FULLSCREEN PHOTO │
│ │
│ │
│ │
│ │
│ [← Prev] [Next →] │
│ │
│ ● ○ ○ ○ ○ (3 of 5) │
└────────────────────────────────────────────────────────────┘

```

**Key Features:**

- Black background
- Fullscreen photo display
- Left/right arrows for navigation
- Keyboard shortcuts (arrow keys, ESC)
- Swipe gestures on mobile
- Photo counter
- Thumbnail strip (optional)

**Actions:**

- Close → Return to memory detail
- Next/Prev → Navigate photos
- ESC key → Close
- Click outside → Close

---

### 7. Auth Callback (`/auth/callback`)

**Purpose:** Handle OAuth redirects

**Behavior:**

- No UI (loading state only)
- Process OAuth tokens
- Create/load user profile
- Redirect to intended destination
- Show error if auth fails

---

### 8. Footer Pages

#### How to Contribute (`/contribute`)

- Step-by-step guide
- FAQ
- Contact information
- Examples of good memories

#### Privacy Policy (`/privacy`)

- Data collection practices
- Cookie usage
- Photo rights
- Deletion requests

#### Terms of Use (`/terms`)

- Acceptable content
- Moderation policy
- Copyright
- Liability

---

## NAVIGATION COMPONENTS

### Header Navigation

**Desktop:**

```

┌────────────────────────────────────────────────────────────┐
│ MARCOSPEOPLES.COM [🔍 Search] [EN ▼] [☀️/🌙] │
│ │
│ [Share a Memory] [👤 User Menu] │
└────────────────────────────────────────────────────────────┘

```

**Elements:**

- Logo/Site name (left) → Links to home
- Search bar (center-left)
- Language selector (center-right)
- Theme toggle (center-right)
- "Share a Memory" button (prominent, right)
- User menu (right)

**User Menu (Unauthenticated):**

- Sign in

**User Menu (Authenticated):**

- Profile name/picture
- My Memories (future)
- Sign out (Google only)

---

### Mobile Header

**Collapsed:**

```

┌────────────────────────────────────┐
│ [☰] MARCOSPEOPLES.COM [🔍] [👤]│
└────────────────────────────────────┘

```

**Expanded (Slide-out Menu):**

```

┌────────────────────────────────────┐
│ [X] Menu │
├────────────────────────────────────┤
│ │
│ [🏠] Home │
│ [✏️] Share a Memory │
│ [🔍] Search │
│ [📅] Timeline │
│ [🌐] Language: English ▼ │
│ [☀️] Theme: Light ▼ │
│ │
│ ─────────────────────────────── │
│ │
│ [ℹ️] How to Contribute │
│ [🔒] Privacy Policy │
│ [📄] Terms of Use │
│ │
└────────────────────────────────────┘

```

---

### Footer (Desktop)

```

┌────────────────────────────────────────────────────────────┐
│ │
│ Celebrating {count} memories of Marcos Peebles │
│ September 29, 1972 - December 12, 2025 │
│ │
│ How to Contribute • Privacy Policy • Terms of Use │
│ │
└────────────────────────────────────────────────────────────┘

```

**Mobile:** Similar but stacked vertically

---

### Filter Panel

**Desktop (Sidebar):**

```

┌──────────────────────┐
│ Filters │
│ ──────────────────── │
│ │
│ 📅 Time Period │
│ □ 1970s │
│ □ 1980s │
│ □ 1990s │
│ □ 2000s │
│ □ 2010s │
│ □ 2020s │
│ │
│ 🌐 Language │
│ □ English │
│ □ French │
│ □ Spanish │
│ □ Dutch │
│ □ Portuguese │
│ │
│ 📍 Location │
│ [Search location...] │
│ │
│ [Clear All] │
│ │
└──────────────────────┘

```

**Mobile (Bottom Sheet):**

- Swipe up to reveal
- Same filters, touch-optimized
- Apply/Cancel buttons

---

## MOBILE NAVIGATION

### Bottom Navigation Bar (Optional)

```

┌────────────────────────────────────┐
│ │
│ [🗺️ Map] [📅 Timeline] [➕ Share] │
│ │
└────────────────────────────────────┘

```

**Alternative:** Keep minimal, rely on header + gestures

---

### Mobile Gestures

- **Swipe right:** Back to previous view
- **Swipe up:** Open filters (on map)
- **Swipe down:** Close modal/overlay
- **Pinch:** Zoom map
- **Tap:** Select marker/memory

---

## USER FLOWS

### Flow 1: Discover Memory

```

1. User lands on homepage (map with globe view)
2. Browses map (pan/zoom/rotate globe)
3. Hovers marker → Preview card
4. Clicks marker → Memory detail modal opens over map
5. Reads story, views photos
6. Closes modal (ESC or X) → Back to map

```

### Flow 2: Use Timeline to Filter

```

1. User on map homepage
2. Sees timeline slider at top
3. Drags slider to select 1980-1989
4. Map markers filter in real-time to show only 1980s memories
5. Clicks marker → Memory detail modal opens
6. Closes modal → Back to filtered map
7. Clicks "Reset" on timeline → All memories shown again

```

### Flow 3: Search for Memory

```

1. User on map homepage
2. Types "Brussels" in search bar below map
3. Map markers filter in real-time
4. Matching memories highlighted
5. Clicks highlighted marker → Memory detail modal opens
6. Reads memory
7. Closes modal → Back to filtered map view
8. Clears search → All markers shown again

```

### Flow 4: Share Memory (New Contributor)

```

1. User on map, clicks "Share a Memory" button
2. Redirected to /share page
3. Auth modal appears (not logged in)
4. Chooses "Continue as Guest"
5. Enters name "Maria" (optional)
6. Auth completes → Form appears
7. Fills Step 1: Story text and title
8. Proceeds to Step 2: Uploads 3 photos
9. Proceeds to Step 3: Clicks on map to set Brussels location
10. Step 4: Reviews all content
11. Clicks Submit
12. Success message → Redirected to new memory detail modal
13. Option to share link or return to map

```

### Flow 5: View User Profile

```

1. Authenticated user clicks their name/avatar in header
2. Selects "My Profile" from dropdown
3. Navigates to /profile page
4. Sees list of their 3 contributed memories
5. Clicks "Edit" on one memory
6. Redirected to /share page with pre-filled form
7. Makes edits, submits
8. Success message → Back to profile page

```

### Flow 6: Browse Timeline + Search Combined

```

1. User on map homepage
2. Drags timeline slider to 1985-1995
3. Map shows memories from that period
4. Then types "London" in search bar
5. Map now shows only London memories from 1985-1995
6. Clicks marker → Memory detail modal
7. Reads memory about London in 1990s

````

---

## BREADCRUMBS & BACK NAVIGATION

### Breadcrumb Strategy

**Minimal (No visible breadcrumbs)**

- Back button/link shows previous step
- URL structure provides context
- Modal overlays have X close button
- ESC key closes modals

### Back Navigation Rules

| Current Page                | Back Action | Destination                        |
| --------------------------- | ----------- | ---------------------------------- |
| Memory Detail Modal         | Close/ESC   | Map (preserve position & filters)  |
| Memory Detail (direct link) | Close/ESC   | Map (centered on memory)           |
| Share Memory (/share)       | Back button | Map                                |
| Profile (/profile)          | Back button | Map or previous page               |
| Admin Dashboard (/admin)    | Back button | Admin dashboard (no map access)    |
| Photo Gallery Modal         | Close/ESC   | Memory Detail Modal                |
| Footer pages                | Back button | Referring page or Map              |

**ESC Key Behavior:**

- Closes any open modal (memory detail, photo gallery)
- Returns to underlying view (map)
- Multiple ESC presses: Modal → Map → (browser back)

---

## IMPLEMENTATION NOTES

### Timeline Component (Chakra UI)

**Recommended Components:**

- `RangeSlider` from Chakra UI for year range selection
- `Tooltip` to show year on hover
- `Box` with visual indicators (dots) for memory distribution
- `Button` for reset action

**Features:**

- Two-thumb slider for start/end year (1972-2025)
- Visual density indicator (more dots = more memories)
- Smooth animation when filtering
- Responsive touch interactions

**Example Structure:**

```jsx
<Box position="absolute" top="80px" width="100%" p={4}>
  <RangeSlider
    min={1972}
    max={2025}
    defaultValue={[1972, 2025]}
    onChange={(val) => filterMemoriesByYear(val)}
  >
    <RangeSliderTrack>
      <RangeSliderFilledTrack />
    </RangeSliderTrack>
    <RangeSliderThumb index={0} />
    <RangeSliderThumb index={1} />
  </RangeSlider>
  <Button size="sm" onClick={resetTimeline}>
    Reset
  </Button>
</Box>
````

### Search Bar Component

**Features:**

- Debounced input (300ms delay)
- Clear button (X) when text entered
- Loading indicator during search
- Accessible (ARIA labels)

**Search Logic:**

- Searches: memory titles, stories, location names, author names, years
- Case-insensitive
- Partial matches allowed
- Results update map markers in real-time

### Mobile Bottom Bar

**Implementation:**

- Fixed position: `position: fixed; bottom: 0;`
- Z-index above map but below modals
- Touch targets: minimum 44px × 44px
- Active state styling for current page
- Hide on scroll (optional UX enhancement)

---

## TECHNICAL SPECIFICATIONS

### Route Configuration (React Router)

```jsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/:memoryId" element={<HomePage />} />
  <Route path="/:memoryId/photo/:photoId" element={<HomePage />} />
  <Route path="/share" element={<ShareMemoryPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/profile/:userId" element={<ProfilePage />} />
  <Route path="/auth/callback" element={<AuthCallbackPage />} />
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/contribute" element={<ContributePage />} />
  <Route path="/privacy" element={<PrivacyPage />} />
  <Route path="/terms" element={<TermsPage />} />
</Routes>
```

**Note:** Memory detail and photo gallery render as modals over HomePage, not separate route components.

### State Management

**URL State (via query params):**

- Map position: `?lat=50.8503&lng=4.3517&zoom=12`
- Timeline filter: `?timeline=1980s` or `?timelineStart=1980&timelineEnd=1989`
- Search: `?search=brussels`
- Active memory: `?memory=uuid`

**App State (Context/Zustand):**

- Active modal (memory detail, photo gallery, auth)
- User authentication status
- Current filters applied
- Map instance reference

---

## NEXT STEPS

✅ **Navigation Structure Complete - All Questions Answered**

**Decisions Made:**

1. ✅ Timeline: Interactive slider overlay on map (Chakra UI)
2. ✅ Search: Search bar below map, no separate page
3. ✅ Memory Detail: Modal over map (desktop & mobile)
4. ✅ Mobile Navigation: Bottom bar (Map, Share, Profile)
5. ✅ User Profile: Separate page (/profile), editable
6. ✅ Admin Dashboard: Separate /admin route, password protected

**Ready For:**

- Task 5: Define metadata taxonomy
- Task 6: Document API endpoints

**Next Implementation Phase:**

- Phase 3.1: Build React components based on this structure
- Phase 3.3: Implement interactive map with timeline overlay
- Phase 3.4: Build memory modal components

---

**Document Status:** ✅ Complete - All Questions Answered  
**Last Updated:** December 27, 2025  
**Navigation Style:** Map-centric, seamless experience, Chakra UI components

- Should search be a dedicated page or an overlay on the map?
- Do you want advanced filters (date range, multiple locations)?

**3. Memory Detail:**

- Desktop: Modal over map or full page?
- Should map stay visible (blurred) behind modal?

**4. Mobile Bottom Navigation:**

- Do you want a fixed bottom nav bar (Map, Timeline, Share)?
- Or keep navigation minimal in hamburger menu only?

**5. User Profile:**

- Should authenticated users have a profile page showing their contributions?
- Or keep it minimal with just "My Memories" link in menu?

**6. Moderation Dashboard:**

- Phase 1: Manual via Supabase (confirmed)
- Phase 5: Want dedicated `/admin` route or integrated into main site?

---

## NEXT STEPS

**Please review and provide feedback on:**

1. Overall navigation structure
2. URL patterns
3. Mobile vs desktop differences
4. Any missing pages/flows
5. Answers to the questions above

**Once approved, ready for:**

- Task 5: Define metadata taxonomy
- Task 6: Document API endpoints

---

**Document Status:** 🔄 In Progress - Awaiting Feedback  
**Last Updated:** December 27, 2025  
**Navigation Style:** Map-centric, minimal chrome
