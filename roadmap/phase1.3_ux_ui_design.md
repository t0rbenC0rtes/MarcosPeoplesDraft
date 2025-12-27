# Phase 1.3: UX/UI Design
## marcospeoples.com - Interactive Memorial for Marcos Peebles
### Minimalistic Design System - Black & White Aesthetic

**Date Created:** December 26, 2025  
**Status:** In Progress  
**Prerequisites:** Phase 1.1 & 1.2 Complete ✅  
**Design Tool:** Figma

---

## TABLE OF CONTENTS

1. [Design Philosophy](#design-philosophy)
2. [Design System](#design-system)
3. [Wireframes](#wireframes)
4. [High-Fidelity Mockups](#high-fidelity-mockups)
5. [Component Library](#component-library)
6. [Map Interactions](#map-interactions)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)
9. [Figma Prototype Structure](#figma-prototype-structure)

---

## 1. DESIGN PHILOSOPHY

### 1.1 Core Principles

**Minimalism with Purpose**
- Every element serves a function
- Abundant whitespace for breathing room
- Focus on content, not decoration
- Typography-driven hierarchy

**Respectful Elegance**
- Celebratory aesthetic honoring Marcos's life
- Clean and modern, warm not cold
- Timeless design that won't feel dated
- Balance between reflection and celebration
- Happy memories, smiles, and laughter

**Content First**
- Memories and photos are the heroes
- Color photos pop against monochrome interface
- Interface fades into the background
- Map as the primary navigation tool
- Minimal UI chrome

**Technical Precision**
- Roboto Mono for technical, honest aesthetic
- Grid-based layouts
- Consistent spacing system
- Sharp, clean edges

---

### 1.2 Design Inspiration

**Visual References:**
- Brutalist web design (honest, raw)
- Swiss design (grid systems, typography)
- Modern cartography (clean maps, precise markers)
- Photo journalism (color stories on neutral backgrounds)

**Emotional Goals:**
- **Celebratory**: Honoring Marcos's life with joy
- **Accessible**: Welcoming to all ages and backgrounds
- **Reflective**: Encourages sharing happy memories
- **Connected**: Brings people together through shared experiences
- **Timeless**: Will feel appropriate years from now

---

## 2. DESIGN SYSTEM

### 2.1 Color Palette

#### **Light Theme (Default)**

```css
/* Primary Colors */
--color-bg-primary: #FFFFFF;        /* Pure white background */
--color-bg-secondary: #F5F5F5;      /* Off-white for cards/sections */
--color-bg-tertiary: #E8E8E8;       /* Subtle backgrounds */

--color-text-primary: #000000;      /* Pure black for headings */
--color-text-secondary: #333333;    /* Dark gray for body text */
--color-text-tertiary: #666666;     /* Medium gray for metadata */
--color-text-disabled: #999999;     /* Light gray for disabled */

--color-border: #D0D0D0;            /* Borders and dividers */
--color-border-hover: #000000;      /* Interactive borders */

/* Interactive States */
--color-interactive: #000000;       /* Links, buttons */
--color-interactive-hover: #333333; /* Hover state */
--color-focus: #000000;             /* Focus rings */

/* Minimal Accent Colors (for navigation/clarity only) */
--color-accent-success: #2D7A2D;    /* Success states (subtle green) */
--color-accent-info: #2D5A7A;       /* Info/navigation (subtle blue) */
--color-accent-warning: #7A6A2D;    /* Warnings (subtle yellow) */
--color-accent-error: #7A2D2D;      /* Errors (subtle red) */

/* Map Colors */
--color-map-marker: #000000;        /* Memory markers */
--color-map-cluster: #333333;       /* Cluster bubbles */
--color-map-selected: #2D5A7A;      /* Selected marker (subtle blue) */
```

#### **Dark Theme**

```css
/* Primary Colors */
--color-bg-primary: #0A0A0A;        /* Near-black background */
--color-bg-secondary: #1A1A1A;      /* Slightly lighter for cards */
--color-bg-tertiary: #2A2A2A;       /* Subtle backgrounds */

--color-text-primary: #FFFFFF;      /* Pure white for headings */
--color-text-secondary: #E0E0E0;    /* Light gray for body text */
--color-text-tertiary: #A0A0A0;     /* Medium gray for metadata */
--color-text-disabled: #606060;     /* Dark gray for disabled */

--color-border: #3A3A3A;            /* Borders and dividers */
--color-border-hover: #FFFFFF;      /* Interactive borders */

/* Interactive States */
--color-interactive: #FFFFFF;       /* Links, buttons */
--color-interactive-hover: #E0E0E0; /* Hover state */
--color-focus: #FFFFFF;             /* Focus rings */

/* Minimal Accent Colors (for navigation/clarity only) */
--color-accent-success: #5DB35D;    /* Success states (subtle green) */
--color-accent-info: #5D9AB3;       /* Info/navigation (subtle blue) */
--color-accent-warning: #B3A05D;    /* Warnings (subtle yellow) */
--color-accent-error: #B35D5D;      /* Errors (subtle red) */

/* Map Colors */
--color-map-marker: #FFFFFF;
--color-map-cluster: #E0E0E0;
--color-map-selected: #5D9AB3;      /* Selected marker (subtle blue) */
```

**Theme Toggle Implementation:**
```javascript
// User preference stored in localStorage
// Respects system preference as default
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
```

---

### 2.2 Typography

#### **Font Family**

**Primary Font: Roboto Mono**
- Used for all interface text
- Monospace gives technical, honest feel
- Excellent readability at all sizes
- Available on Google Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;600;700&display=swap');

--font-primary: 'Roboto Mono', monospace;
```

**Font Weights:**
- Light (300): Metadata, captions
- Regular (400): Body text
- Medium (500): Memory titles, labels
- Semi-Bold (600): Section headings
- Bold (700): Page titles, emphasis

---

#### **Type Scale**

```css
/* Display - Page Titles */
--text-display: 48px / 56px; /* size / line-height */
--text-display-weight: 700;
--text-display-spacing: -0.02em; /* letter-spacing */

/* H1 - Section Headers */
--text-h1: 32px / 40px;
--text-h1-weight: 600;
--text-h1-spacing: -0.01em;

/* H2 - Subsection Headers */
--text-h2: 24px / 32px;
--text-h2-weight: 600;
--text-h2-spacing: 0;

/* H3 - Card Titles */
--text-h3: 18px / 24px;
--text-h3-weight: 500;
--text-h3-spacing: 0;

/* Body Large - Memory Stories */
--text-body-lg: 16px / 28px;
--text-body-lg-weight: 400;
--text-body-lg-spacing: 0;

/* Body - Default Text */
--text-body: 14px / 24px;
--text-body-weight: 400;
--text-body-spacing: 0;

/* Body Small - Metadata, Labels */
--text-body-sm: 12px / 20px;
--text-body-sm-weight: 400;
--text-body-sm-spacing: 0.01em;

/* Caption - Tiny Text */
--text-caption: 10px / 16px;
--text-caption-weight: 300;
--text-caption-spacing: 0.02em;
```

**Responsive Typography:**
```css
/* Mobile: Reduce by 20% */
@media (max-width: 768px) {
  --text-display: 38px / 46px;
  --text-h1: 26px / 34px;
  --text-h2: 20px / 28px;
}
```

---

### 2.3 Spacing System

**8px Base Grid**
```css
--space-1: 4px;   /* 0.5× */
--space-2: 8px;   /* 1× - base unit */
--space-3: 12px;  /* 1.5× */
--space-4: 16px;  /* 2× */
--space-5: 24px;  /* 3× */
--space-6: 32px;  /* 4× */
--space-7: 48px;  /* 6× */
--space-8: 64px;  /* 8× */
--space-9: 96px;  /* 12× */
--space-10: 128px; /* 16× */
```

**Usage Guidelines:**
- Component padding: `--space-4` to `--space-6`
- Section spacing: `--space-7` to `--space-9`
- Micro-spacing (icons, labels): `--space-1` to `--space-3`
- Page margins: `--space-6` (mobile), `--space-8` (desktop)

---

### 2.4 Layout Grid

**Desktop Grid (1440px max-width)**
```
Margins: 64px (left/right)
Columns: 12 columns
Gutter: 24px
Max Content Width: 1312px
```

**Tablet Grid (768px - 1023px)**
```
Margins: 32px
Columns: 8 columns
Gutter: 16px
```

**Mobile Grid (< 768px)**
```
Margins: 16px
Columns: 4 columns
Gutter: 16px
```

---

### 2.5 Elevation & Shadows

**Minimal Shadow System** (subtle, mostly for dark theme)

```css
/* Light Theme - Almost no shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.12);

/* Dark Theme - Slightly more pronounced */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.5);
--shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.6);
```

**Usage:**
- Cards: `--shadow-sm` or `1px solid border` (prefer border)
- Modals: `--shadow-lg`
- Dropdowns: `--shadow-md`

---

### 2.6 Border Radius

**Sharp with Subtle Softness**
```css
--radius-none: 0px;      /* Default - sharp corners */
--radius-sm: 2px;        /* Buttons, inputs */
--radius-md: 4px;        /* Cards, images */
--radius-lg: 8px;        /* Modals, large containers */
--radius-full: 9999px;   /* Pills, avatars */
```

---

### 2.7 Transitions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Usage:**
- Hover states: `--transition-fast`
- Panel transitions: `--transition-base`
- Modal animations: `--transition-slow`

---

## 3. WIREFRAMES

### 3.1 Homepage / Map View (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                          │
│  ┌──────────────┐                          ┌─────────────────┐  │
│  │ MARCOSPEOPLES │         Navigation       │ [SHARE MEMORY] │  │
│  │   .COM       │     Search | EN▾         │    [☀️ / 🌙 ]   │  │
│  └──────────────┘                          └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                           │   │
│  │                   INTERACTIVE MAP                        │   │
│  │              (Mapbox Globe Projection)                   │   │
│  │                Monochrome Grayscale                      │   │
│  │                                                           │   │
│  │    🗺️  Markers showing memory locations                  │   │
│  │        Clusters for multiple memories                    │   │
│  │        Geographic focus: Brussels, London, Santiago      │   │
│  │                                                           │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │ MAP CONTROLS                                     │     │   │
│  │  │  [+] [-]  Zoom                                   │     │   │
│  │  │  [⊡]      Fullscreen                             │     │   │
│  │  │  [🧭]     Reset view                              │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  BOTTOM INFO BAR                                                │
│  "Celebrating 147 memories from 52 contributors | 1972-2025"    │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Full-viewport map (hero element)
- Minimal header with logo + navigation
- Floating "Share Memory" CTA button (top right)
- Theme toggle (sun/moon icon)
- Map controls in bottom-left
- Info bar showing stats

---

### 3.2 Memory Detail View (Modal/Sidebar)

**Desktop - Sidebar Overlay**
```
┌─────────────────────────────────────────────────────────────┐
│                                    │                         │
│                                    │  ┌───────────────────┐ │
│        MAP (dimmed)                │  │       [×]         │ │
│        continues in                │  ├───────────────────┤ │
│        background                  │  │                   │ │
│                                    │  │  [PHOTO GALLERY]  │ │
│                                    │  │   (swipeable)     │ │
│                                    │  │                   │ │
│        Selected marker             │  ├───────────────────┤ │
│        highlighted                 │  │ "Summer in        │ │
│                                    │  │  Brussels, 1985"  │ │
│                                    │  ├───────────────────┤ │
│                                    │  │ 📍 Brussels, BE   │ │
│                                    │  │ 📅 June 1985      │ │
│                                    │  │ ✍️  John Doe      │ │
│                                    │  ├───────────────────┤ │
│                                    │  │                   │ │
│                                    │  │ Full story text   │ │
│                                    │  │ goes here with    │ │
│                                    │  │ comfortable       │ │
│                                    │  │ reading space...  │ │
│                                    │  │                   │ │
│                                    │  │ (scrollable)      │ │
│                                    │  │                   │ │
│                                    │  ├───────────────────┤ │
│                                    │  │ [Translate] [Share]│
│                                    │  │ [Report]          │ │
│                                    │  └───────────────────┘ │
└─────────────────────────────────────────────────────────────┘
     60% map continues       │        40% sidebar (480px)
```

**Mobile - Full Screen Modal**
```
┌────────────────────┐
│ [← Back]       [×] │
├────────────────────┤
│                    │
│  [PHOTO GALLERY]   │
│    (swipeable)     │
│                    │
├────────────────────┤
│ "Summer in         │
│  Brussels, 1985"   │
├────────────────────┤
│ 📍 Brussels, BE    │
│ 📅 June 1985       │
│ ✍️  John Doe       │
├────────────────────┤
│                    │
│ Full story text    │
│ scrollable...      │
│                    │
│                    │
├────────────────────┤
│ [Translate] [Share]│
│ [Report]           │
└────────────────────┘
```

---

### 3.3 Share Memory Form

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER                                        [×] Close     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Share a Memory                                             │
│  ────────────────                                           │
│                                                              │
│  STEP 1/3: Authentication                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │                                                     │     │
│  │        [G]  Sign in with Google                    │     │
│  │                                                     │     │
│  │        ────────── OR ──────────                     │     │
│  │                                                     │     │
│  │        Continue as guest                           │     │
│  │        ┌──────────────────────────────────┐        │     │
│  │        │ Your name                        │        │     │
│  │        └──────────────────────────────────┘        │     │
│  │                                 [Continue →]       │     │
│  │                                                     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Step 2/3: Location & Content**
```
┌─────────────────────────────────────────────────────────────┐
│  STEP 2/3: Your Memory                                      │
│                                                              │
│  Title                                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Summer in Brussels                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Where did this memory take place?                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [MAP - Click to select location]                     │   │
│  │                                                       │   │
│  │    • Brussels, Belgium (selected)                    │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Your story (50-5000 characters)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ It was a beautiful summer day in 1985...            │   │
│  │                                                       │   │
│  │                                                       │   │
│  │                                                       │   │
│  │                            127/5000 characters       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  When did this happen? (optional)                           │
│  ┌──────────┐                                               │
│  │ 06/1985  │  Month/Year                                  │
│  └──────────┘                                               │
│                                                              │
│                             [← Back]  [Continue →]          │
└─────────────────────────────────────────────────────────────┘
```

**Step 3/3: Photos**
```
┌─────────────────────────────────────────────────────────────┐
│  STEP 3/3: Add Photos (Optional)                            │
│                                                              │
│  Upload up to 8 photos                                      │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │          │  │          │  │          │                  │
│  │  photo1  │  │  photo2  │  │   [+]    │                  │
│  │   [×]    │  │   [×]    │  │  Add     │                  │
│  │          │  │          │  │          │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                              │
│  Or drag and drop files here                                │
│  Max 10MB per photo • JPG, PNG, WebP                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ☑️  I confirm I have the right to share these photos  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│                             [← Back]  [Submit Memory]       │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.4 Search & Filter Interface

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────┐             │
│  │ 🔍  Search memories...                     │  [Filters]  │
│  └────────────────────────────────────────────┘             │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ FILTERS (collapsible)                                │    │
│  │                                                       │    │
│  │ Location                                             │    │
│  │ ☐ Brussels  ☐ London  ☐ Santiago  ☐ Other          │    │
│  │                                                       │    │
│  │ Time Period                                          │    │
│  │ ☐ 1970s  ☐ 1980s  ☐ 1990s  ☐ 2000s  ☐ 2010s  ☐ 2020s│    │
│  │                                                       │    │
│  │ Language                                             │    │
│  │ ☐ EN  ☐ FR  ☐ ES  ☐ NL  ☐ PT                       │    │
│  │                                                       │    │
│  │                    [Clear All]  [Apply Filters]     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  147 memories found                           [Grid] [Map]  │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ [thumbnail]  │ │ [thumbnail]  │ │ [thumbnail]  │        │
│  │              │ │              │ │              │        │
│  │ Summer in    │ │ Winter      │ │ Career       │        │
│  │ Brussels     │ │ London       │ │ Santiago     │        │
│  │              │ │              │ │              │        │
│  │ 📍 Brussels  │ │ 📍 London    │ │ 📍 Santiago  │        │
│  │ 📅 1985      │ │ 📅 1992      │ │ 📅 2003      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│  [Load More]                                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. HIGH-FIDELITY MOCKUPS

### 4.1 Homepage - Light Theme

**Visual Description:**
```
┌──────────────────────────────────────────────────────────────────┐
│ [MARCOSPEOPLES.COM]                     About  Search  EN▾  [☀️/🌙]│
│                                              [SHARE A MEMORY ─→] │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                                                                   │
│        🗺️ MONOCHROME MAP (Mapbox Light/Grayscale style)          │
│                                                                   │
│           • Black markers for memory locations                   │
│           • Clusters with white background, black text           │
│           • Clean streets, minimal labels                        │
│           • Geographic focus: Europe & South America             │
│                                                                   │
│        Map fills entire viewport                                 │
│        Pure white background, light gray borders for countries   │
│                                                                   │
│        [+]  Zoom controls (bottom-left)                          │
│        [-]  Black on white, minimal                              │
│        [⊡]  1px border                                           │
│                                                                   │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│ Exploring 147 memories from 52 contributors | 1972-2025         │
└──────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- **Background**: Pure white (#FFFFFF)
- **Header**: 
  - Logo: Roboto Mono Bold, 16px, uppercase
  - Navigation: Roboto Mono Regular, 14px
  - 1px bottom border (#D0D0D0)
  - Height: 64px
- **CTA Button**: 
  - Black background, white text
  - Roboto Mono Medium, 14px
  - 2px border radius
  - Hover: inverts (white bg, black text, black border)
- **Map**: 
  - Mapbox Monochrome/Light style
  - Custom styling for clean aesthetic
  - Markers: filled black circles
  - Clusters: white circles with black border + count
- **Footer Bar**:
  - Light gray background (#F5F5F5)
  - Roboto Mono Light, 12px
  - 1px top border

---

### 4.2 Homepage - Dark Theme

**Visual Description:**
```
┌──────────────────────────────────────────────────────────────────┐
│ [MARCOSPEOPLES.COM]                     About  Search  EN▾  [☀️/🌙]│
│                                              [SHARE A MEMORY ─→] │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                                                                   │
│        🗺️ DARK MAP (Mapbox Dark style)                           │
│                                                                   │
│           • White markers for memory locations                   │
│           • Clusters with black background, white text           │
│           • Dark streets, minimal contrast                       │
│           • Subtle glow on markers for visibility                │
│                                                                   │
│        Map fills entire viewport                                 │
│        Near-black background (#0A0A0A)                           │
│        Subtle gray borders for countries                         │
│                                                                   │
│        [+]  Zoom controls (bottom-left)                          │
│        [-]  White on dark, minimal                               │
│        [⊡]  1px border (#3A3A3A)                                 │
│                                                                   │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│ Exploring 147 memories from 52 contributors | 1972-2025         │
└──────────────────────────────────────────────────────────────────┘
```

**Design Details:**
- **Background**: Near-black (#0A0A0A)
- **Header**: 
  - White text on dark background
  - 1px bottom border (#3A3A3A)
- **CTA Button**: 
  - White background, black text
  - Hover: inverts (black bg, white text, white border)
- **Map**: 
  - Mapbox Dark style
  - White markers with subtle glow
  - Clusters: dark with white outline
- **Footer Bar**:
  - Slightly lighter black (#1A1A1A)
  - White text

---

### 4.3 Memory Card Component

**Light Theme:**
```
┌────────────────────────────────────┐
│ [Thumbnail Image - FULL COLOR]     │
│ Photos NOT converted to grayscale  │
│ Creates vibrant contrast with UI   │
│ 4:3 ratio, 2px radius              │
├────────────────────────────────────┤
│ Summer in Brussels, 1985           │ ← Roboto Mono Medium, 18px
│                                    │
│ 📍 Brussels, Belgium               │ ← Roboto Mono Regular, 12px
│ 📅 June 1985                       │   Light gray (#666666)
│ ✍️  John Doe                       │
│                                    │
│ It was a beautiful summer day...   │ ← Roboto Mono Regular, 14px
│ (truncated at 2 lines)             │   Dark gray (#333333)
│                                    │
│ ────────────────────────────────   │
│ [Read More →]                      │ ← Black text, underline on hover
└────────────────────────────────────┘

1px border (#D0D0D0)
No shadow
Hover: border becomes black
```

**Dark Theme:**
```
┌────────────────────────────────────┐
│ [Thumbnail Image - FULL COLOR]     │
│ Color photos pop on dark interface │
├────────────────────────────────────┤
│ Summer in Brussels, 1985           │ ← White text
│                                    │
│ 📍 Brussels, Belgium               │ ← Light gray (#A0A0A0)
│ 📅 June 1985                       │
│ ✍️  John Doe                       │
│                                    │
│ It was a beautiful summer day...   │ ← Off-white (#E0E0E0)
│                                    │
│ ────────────────────────────────   │
│ [Read More →]                      │ ← White, underline on hover
└────────────────────────────────────┘

1px border (#3A3A3A)
Background: #1A1A1A
Hover: border becomes white
```

---

### 4.4 Memory Detail Modal/Sidebar

**Light Theme - Desktop Sidebar:**
```
│ MAP (60%)       │ SIDEBAR (40%, max 480px)                       │
│                 ├────────────────────────────────────────────────┤
│ [dimmed         │ [×] Close                                      │
│  slightly]      ├────────────────────────────────────────────────┤
│                 │                                                 │
│ Selected        │  ┌──────────────────────────────────────────┐  │
│ marker ●        │  │                                           │  │
│ highlighted     │  │     [Main Photo - Full Color]            │  │
│                 │  │     Photos remain in original colors      │  │
│                 │  │     (creates beautiful contrast with B&W) │  │
│                 │  │                                           │  │
│                 │  └──────────────────────────────────────────┘  │
│                 │                                                 │
│                 │  • • • •  Photo indicators (4 photos)          │
│                 │                                                 │
│                 │  Summer in Brussels, 1985                      │
│                 │  ─────────────────────────────                 │
│                 │                                                 │
│                 │  📍 Brussels, Belgium                          │
│                 │  📅 June 15, 1985                              │
│                 │  ✍️  John Doe (Google)                         │
│                 │  🌐 English                                    │
│                 │                                                 │
│                 │  ─────────────────────────────                 │
│                 │                                                 │
│                 │  It was a beautiful summer day in Brussels.    │
│                 │  Marcos and I walked through the Grand Place,  │
│                 │  enjoying the sunshine and talking about life. │
│                 │  He had this incredible way of making every    │
│                 │  moment feel special...                        │
│                 │                                                 │
│                 │  [Full story continues, scrollable]            │
│                 │                                                 │
│                 │  ─────────────────────────────                 │
│                 │                                                 │
│                 │  [Translate to ▾]  [Share]  [Report]          │
│                 │                                                 │
│                 │  Related Memories (same location):             │
│                 │  • Winter in Brussels (1988)                   │
│                 │  • European Parliament Visit (1995)            │
│                 │                                                 │
└─────────────────┴─────────────────────────────────────────────────┘

Background: White (#FFFFFF)
Text: Black/Dark Gray
Photos: Full color (not converted to grayscale)
Border-left: 1px solid #D0D0D0
```

---

### 4.5 Form Components

**Input Field - Light Theme:**
```
Label (Roboto Mono Medium, 14px, #000)
┌──────────────────────────────────────┐
│ Placeholder text (#999)              │
│                                      │
└──────────────────────────────────────┘
1px border (#D0D0D0)
Padding: 12px 16px
Border-radius: 2px

Focus State:
┌──────────────────────────────────────┐
│ User input (#000)                    │
│                                      │
└──────────────────────────────────────┘
2px border (#000)
```

**Button Styles:**
```
PRIMARY (CTA)
┌───────────────────┐
│ SHARE A MEMORY ─→ │  Black bg, white text
└───────────────────┘  Roboto Mono Medium, 14px
Hover: White bg, black text, black border

SECONDARY
┌───────────────────┐
│   Continue   →    │  White bg, black text, black border
└───────────────────┘  
Hover: Black bg, white text

GHOST (Subtle)
┌───────────────────┐
│   Cancel          │  Transparent, black text
└───────────────────┘  Underline on hover
```

---

## 5. COMPONENT LIBRARY

### 5.1 Core Components

#### **Button Component**

**Variants:**
1. **Primary**: Black bg, white text (CTA)
2. **Secondary**: White bg, black text, black border
3. **Ghost**: Transparent, underline on hover
4. **Icon**: Square button with icon only

**States:**
- Default
- Hover (color inversion)
- Active (slightly darker)
- Disabled (gray, 50% opacity)
- Loading (spinner)

**Sizes:**
- Small: 32px height, 12px text
- Medium: 40px height, 14px text
- Large: 48px height, 16px text

**Figma Component Structure:**
```
Button
├─ Variant: Primary/Secondary/Ghost/Icon
├─ Size: Small/Medium/Large
├─ State: Default/Hover/Active/Disabled/Loading
└─ Icon: Left/Right/None
```

---

#### **Input Component**

**Types:**
- Text
- Textarea
- Select/Dropdown
- Date Picker
- File Upload

**States:**
- Default
- Focus (thick border)
- Error (red border, error message)
- Disabled (gray, 50% opacity)
- Success (green border)

**Figma Component:**
```
Input
├─ Type: Text/Textarea/Select
├─ State: Default/Focus/Error/Disabled
├─ Label: Yes/No
└─ Helper Text: Yes/No
```

---

#### **Card Component**

**Variants:**
1. **Memory Card** (for grid/list views)
2. **Info Card** (for stats, about sections)
3. **Feature Card** (for homepage features)

**Structure:**
```
Card
├─ Image: Yes/No
├─ Title: Required
├─ Metadata: Optional
├─ Body: Optional
└─ Actions: Optional
```

**States:**
- Default
- Hover (border highlight)
- Selected (thicker border)

---

#### **Modal Component**

**Variants:**
1. **Sidebar Modal** (Memory detail, desktop)
2. **Center Modal** (Forms, confirmations)
3. **Fullscreen Modal** (Mobile memory view)

**Elements:**
- Overlay (50% black, blur backdrop)
- Container (white/dark bg)
- Header (title + close button)
- Body (scrollable content)
- Footer (actions)

---

#### **Map Marker Component**

**Types:**
1. **Single Memory Marker**
   - Filled circle (10px diameter)
   - Black (light theme) / White (dark theme)
   - Hover: scale 1.2×, slight shadow
   
2. **Cluster Marker**
   - Circle with border
   - Number inside (memory count)
   - Size scales with count (16px - 48px)
   - Hover: border thickens

3. **Selected Marker**
   - Larger (16px diameter)
   - Pulsing animation
   - Highlighted border

---

### 5.2 Navigation Components

#### **Header**

**Structure:**
```
┌──────────────────────────────────────────────────────────────┐
│ [Logo]              [Nav Links]          [Actions] [Theme]   │
└──────────────────────────────────────────────────────────────┘

Height: 64px
Padding: 0 64px (desktop), 0 16px (mobile)
Border-bottom: 1px solid
```

**Elements:**
- Logo (clickable, links to home)
- Navigation (About, Search, Language selector)
- Theme toggle (sun/moon icon, smooth transition)
- CTA button (Share a Memory)

---

#### **Footer**

**Structure:**
```
┌──────────────────────────────────────────────────────────────┐
│ MARCOSPEOPLES.COM                                            │
│                                                               │
│ How to Contribute  |  Privacy Policy  |  Terms of Use        │
│                                                               │
│ © 2025 Celebrating the life of Marcos Peebles (1972-2025)   │
│ 147 memories shared with love                                │
└──────────────────────────────────────────────────────────────┘

Background: #F5F5F5 (light) / #1A1A1A (dark)
Padding: 48px 64px
Border-top: 1px solid
```

---

### 5.3 Special Components

#### **Photo Gallery**

**Desktop:**
- Main large image (800px wide)
- Thumbnail strip below (80px × 80px each)
- Left/right arrows for navigation
- Fullscreen button (top-right)
- Swipe gesture support

**Mobile:**
- Full-width swipeable images
- Dot indicators below
- Tap to show/hide controls

**Features:**
- Lazy loading
- Zoom on click (modal)
- Smooth transitions between images
- Photo counter (1/4, 2/4, etc.)

---

#### **Language Selector**

**Dropdown:**
```
┌──────────────┐
│ EN ▾         │ ← Current language
└──────────────┘
     │
     ▼
┌──────────────┐
│ ✓ EN English │ ← Selected
│   FR Français│
│   ES Español │
│   NL Nederlands│
│   PT Português│
└──────────────┘
```

**Flags:** Optional (can use icons if preferred)

---

#### **Theme Toggle**

**Visual:**
```
Light Theme Active:  [☀️ • ○]
Dark Theme Active:   [○ • 🌙]

Animated switch
Smooth theme transition (350ms)
Persists in localStorage
```

---

## 6. MAP INTERACTIONS

### 6.1 Mapbox GL JS Configuration

**Selected: Mapbox GL JS with Globe Projection**
- Modern, smooth performance
- Globe view for world-scale perspective
- Custom monochrome styling
- 3D capabilities
- Free tier: 50,000 loads/month

**Globe Projection Setup:**
```javascript
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11', // Base style (will customize)
  projection: 'globe', // Spheric world map
  center: [4.3517, 50.8503], // Brussels (default center)
  zoom: 1.5, // Start with globe view
  attributionControl: false // Clean interface
});

// Customize for monochrome
map.on('load', () => {
  // Apply custom monochrome styling
  // See section 6.2 for full style configuration
});
```

---

### 6.2 Map Style Customization (Monochrome Grayscale)

**Light Theme Map Style:**
```javascript
const monochromeStyleLight = {
  "version": 8,
  "name": "Marcospeoples Light Monochrome",
  "sources": {
    "mapbox": {
      "type": "vector",
      "url": "mapbox://mapbox.mapbox-streets-v8"
    }
  },
  "layers": [
    {
      "id": "background",
      "type": "background",
      "paint": {
        "background-color": "#FFFFFF"
      }
    },
    {
      "id": "water",
      "type": "fill",
      "source": "mapbox",
      "source-layer": "water",
      "paint": {
        "fill-color": "#F0F0F0"
      }
    },
    {
      "id": "land",
      "type": "fill",
      "source": "mapbox",
      "source-layer": "landuse",
      "paint": {
        "fill-color": "#FAFAFA"
      }
    },
    {
      "id": "roads",
      "type": "line",
      "source": "mapbox",
      "source-layer": "road",
      "paint": {
        "line-color": "#E0E0E0",
        "line-width": 1
      }
    },
    {
      "id": "country-borders",
      "type": "line",
      "source": "mapbox",
      "source-layer": "admin",
      "filter": ["==", "admin_level", 0],
      "paint": {
        "line-color": "#D0D0D0",
        "line-width": 1
      }
    },
    {
      "id": "country-labels",
      "type": "symbol",
      "source": "mapbox",
      "source-layer": "place_label",
      "layout": {
        "text-field": "{name}",
        "text-font": ["Roboto Mono Regular"],
        "text-size": 12
      },
      "paint": {
        "text-color": "#666666",
        "text-halo-color": "#FFFFFF",
        "text-halo-width": 1
      }
    }
  ]
};
```

**Dark Theme Map Style:**
```javascript
const monochromeStyleDark = {
  // ... similar structure
  "layers": [
    {
      "id": "background",
      "paint": {
        "background-color": "#0A0A0A"
      }
    },
    {
      "id": "water",
      "paint": {
        "fill-color": "#1A1A1A"
      }
    },
    {
      "id": "land",
      "paint": {
        "fill-color": "#0F0F0F"
      }
    },
    {
      "id": "roads",
      "paint": {
        "line-color": "#2A2A2A",
        "line-width": 1
      }
    },
    {
      "id": "country-borders",
      "paint": {
        "line-color": "#3A3A3A",
        "line-width": 1
      }
    },
    {
      "id": "country-labels",
      "paint": {
        "text-color": "#A0A0A0",
        "text-halo-color": "#0A0A0A",
        "text-halo-width": 1
      }
    }
  ]
};
```

**Globe-Specific Features:**
```javascript
// Atmosphere effect (subtle)
map.setFog({
  'range': [0.8, 8],
  'color': '#FFFFFF', // Light theme
  'horizon-blend': 0.1
});

// Smooth rotation on idle (optional - celebratory touch)
let isUserInteracting = false;

map.on('mousedown', () => { isUserInteracting = true; });
map.on('mouseup', () => { isUserInteracting = false; });

function spinGlobe() {
  if (!isUserInteracting) {
    const center = map.getCenter();
    center.lng -= 0.1; // Slow rotation
    map.easeTo({ center, duration: 1000, easing: (t) => t });
  }
  requestAnimationFrame(spinGlobe);
}

// Optional: Enable subtle rotation when no interaction
// spinGlobe();
```

---

### 6.3 Marker Clustering Logic

**Supercluster Configuration:**
```javascript
const clusterOptions = {
  radius: 60,        // Cluster radius in pixels
  maxZoom: 16,       // Max zoom before showing individual markers
  minZoom: 2,        // Min zoom level
  extent: 512,       // Tile extent
  nodeSize: 64,      // Size of KD-tree leaf node
};
```

**Cluster Styles:**
```javascript
// Small cluster (2-10 memories)
{
  size: 32px,
  background: white (light) / #1A1A1A (dark),
  border: 2px solid black (light) / white (dark),
  fontSize: 14px
}

// Medium cluster (11-50 memories)
{
  size: 48px,
  fontSize: 16px
}

// Large cluster (51+ memories)
{
  size: 64px,
  fontSize: 18px,
  fontWeight: 600
}
```

---

### 6.4 Interaction Behaviors

**Click Interactions:**

1. **Click Cluster** → Zoom in to expand cluster
2. **Click Marker** → Open memory detail sidebar
3. **Click Map (empty area)** → Close sidebar (if open)

**Hover Interactions:**

1. **Hover Cluster** → Show tooltip ("23 memories")
2. **Hover Marker** → 
   - Marker scales up (1.2×)
   - Show memory title in tooltip
   - Cursor changes to pointer

**Zoom Behaviors:**

```
Zoom 1-3 (World):
└─ Cluster by country
   └─ Large clusters

Zoom 4-7 (Country):
└─ Cluster by city
   └─ Medium clusters

Zoom 8-11 (City):
└─ Cluster by neighborhood
   └─ Small clusters + some individual markers

Zoom 12+ (Street):
└─ All individual markers
   └─ No clustering
```

**Animations:**
- Smooth zoom: 500ms ease-in-out
- Cluster split: 300ms
- Marker appearance: fade-in 200ms
- Selected marker: pulse animation (continuous)

---

### 6.5 Map Controls

**Custom Control Panel (Bottom-Left):**

```
┌────────┐
│   +    │  Zoom In
├────────┤
│   -    │  Zoom Out
├────────┤
│   ⊡    │  Fullscreen
├────────┤
│   🧭   │  Reset View (to default bounds)
└────────┘

Style:
- White bg (light) / #1A1A1A (dark)
- 1px border
- 40px × 40px each button
- Icon only, no text
- Hover: background inverts
```

**Default View Bounds:**
```javascript
const defaultBounds = [
  [-10, 40],  // Southwest (includes Europe)
  [-80, 60]   // Northeast (includes South America)
];
// Centers on Brussels initially
const defaultCenter = [50.8503, 4.3517];
const defaultZoom = 4;
```

---

### 6.6 Mobile Map Interactions

**Touch Gestures:**
- Pinch to zoom
- Two-finger rotate (optional, can disable)
- Single tap on marker → open fullscreen modal
- Double tap → zoom in
- Long press → show coordinates (for contributors)

**Mobile-Specific:**
- Larger tap targets (48px minimum)
- Simplified controls (zoom only)
- Bottom sheet for memory details (instead of sidebar)

---

## 7. RESPONSIVE DESIGN

### 7.1 Breakpoints

```css
/* Mobile: 320px - 767px */
@media (max-width: 767px) { ... }

/* Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) { ... }

/* Desktop: 1024px - 1439px */
@media (min-width: 1024px) and (max-width: 1439px) { ... }

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) { ... }
```

---

### 7.2 Mobile Layout (< 768px)

**Homepage:**
```
┌────────────────────┐
│ [☰]  MARCOS  [🌙]  │  56px header
├────────────────────┤
│                    │
│                    │
│      MAP           │  Full height minus
│   (Mapbox/         │  header + bottom nav
│    Leaflet)        │
│                    │
│                    │
│                    │
├────────────────────┤
│ 🗺️  📋  ➕  🔍  👤 │  Bottom nav (64px)
└────────────────────┘
```

**Memory Detail (Fullscreen Modal):**
```
┌────────────────────┐
│ [← Back]       [×] │
├────────────────────┤
│                    │
│  [PHOTO]           │
│  (swipeable)       │
│                    │
├────────────────────┤
│ Title              │
│ Metadata           │
├────────────────────┤
│                    │
│ Story text         │
│ (scrollable)       │
│                    │
├────────────────────┤
│ [Actions]          │
└────────────────────┘
```

**Typography Adjustments:**
- Reduce all sizes by 15-20%
- Increase line-height for readability
- Larger tap targets (48px minimum)

---

### 7.3 Tablet Layout (768px - 1023px)

**Homepage:**
```
┌──────────────────────────────────┐
│ [LOGO]      Nav      [CTA] [🌙]  │
├──────────────────────────────────┤
│                                  │
│                                  │
│            MAP                   │
│         (Full width)             │
│                                  │
│                                  │
│                                  │
└──────────────────────────────────┘
```

**Memory Detail:**
- Use sidebar modal (similar to desktop)
- Sidebar width: 50% (instead of 40%)
- Map: 50%

---

### 7.4 Desktop Layout (1024px+)

**Max Width Container:**
```css
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 64px;
}
```

**Grid System:**
- 12-column grid
- Memory cards: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Comfortable spacing between elements

---

## 8. ACCESSIBILITY

### 8.1 WCAG 2.1 Level AA Compliance

**Color Contrast:**
- Text on background: minimum 4.5:1 ratio
- Large text (18px+): minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

**Testing:**
```
Light Theme:
✓ #000000 on #FFFFFF = 21:1 (excellent)
✓ #333333 on #FFFFFF = 12.6:1 (excellent)
✓ #666666 on #FFFFFF = 5.7:1 (good)

Dark Theme:
✓ #FFFFFF on #0A0A0A = 19.8:1 (excellent)
✓ #E0E0E0 on #0A0A0A = 16.3:1 (excellent)
✓ #A0A0A0 on #0A0A0A = 9.7:1 (excellent)
```

---

### 8.2 Keyboard Navigation

**Tab Order:**
1. Skip to main content link
2. Header navigation
3. Theme toggle
4. Share memory CTA
5. Map controls
6. Memory markers (focusable)
7. Footer links

**Keyboard Shortcuts:**
```
Tab:          Next focusable element
Shift + Tab:  Previous focusable element
Enter/Space:  Activate button/link
Esc:          Close modal/sidebar
Arrow Keys:   Navigate map (when focused)
+/- :         Zoom in/out (when map focused)
```

**Focus Indicators:**
```css
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

---

### 8.3 Screen Reader Support

**ARIA Labels:**
```html
<!-- Map -->
<div 
  role="application" 
  aria-label="Interactive map showing memory locations">
  
<!-- Marker -->
<button 
  role="button"
  aria-label="View memory: Summer in Brussels, 1985"
  aria-describedby="marker-123-description">
  
<!-- Modal -->
<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="modal-title">
  
<!-- Image -->
<img 
  src="..." 
  alt="Photo of Marcos at Grand Place, Brussels, June 1985">
```

**Live Regions:**
```html
<!-- For notifications -->
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true">
  Memory submitted successfully
</div>
```

---

### 8.4 Alternative Text

**Guidelines:**
- All images must have alt text
- Decorative images: `alt=""`
- Meaningful images: descriptive alt text
- Photos: describe what's in the photo

**Examples:**
```html
<!-- Good -->
<img 
  src="photo1.jpg" 
  alt="Marcos and friends at a cafe in Brussels, summer 1985">

<!-- Good (decorative) -->
<img src="divider.svg" alt="" role="presentation">

<!-- Bad -->
<img src="photo1.jpg" alt="Image">
```

---

### 8.5 Motion & Animation

**Respect User Preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Provide Pause Controls:**
- Auto-playing carousels have pause button
- Animations can be disabled
- Theme transitions can be instant (if preferred)

---

## 9. FIGMA PROTOTYPE STRUCTURE

### 9.1 File Organization

```
📁 marcospeoples.com - Design System
├─ 📄 Cover Page
│  └─ Project overview, version history
│
├─ 📄 Design Tokens
│  ├─ Colors (Light + Dark themes)
│  ├─ Typography styles
│  ├─ Spacing tokens
│  ├─ Border radius
│  └─ Shadows
│
├─ 📄 Components
│  ├─ Buttons (all variants)
│  ├─ Inputs (all types)
│  ├─ Cards
│  ├─ Modals
│  ├─ Navigation (header, footer)
│  ├─ Map markers
│  └─ Form elements
│
├─ 📄 Wireframes
│  ├─ Homepage / Map View
│  ├─ Memory Detail
│  ├─ Share Memory Form
│  ├─ About Marcos
│  ├─ Search & Filter
│  └─ Mobile Views
│
├─ 📄 High-Fidelity Mockups - Light Theme
│  ├─ Desktop (1440px)
│  ├─ Tablet (768px)
│  └─ Mobile (375px)
│
├─ 📄 High-Fidelity Mockups - Dark Theme
│  ├─ Desktop (1440px)
│  ├─ Tablet (768px)
│  └─ Mobile (375px)
│
└─ 📄 Interactive Prototype
   ├─ User Flows
   ├─ Linked screens
   └─ Micro-interactions
```

---

### 9.2 Component Setup

**Button Component Example:**
```
Component: Button
├─ Property: Variant
│  ├─ Primary
│  ├─ Secondary
│  ├─ Ghost
│  └─ Icon
├─ Property: Size
│  ├─ Small
│  ├─ Medium
│  └─ Large
├─ Property: State
│  ├─ Default
│  ├─ Hover
│  ├─ Active
│  ├─ Disabled
│  └─ Loading
└─ Property: Icon Position
   ├─ Left
   ├─ Right
   └─ None
```

**Auto Layout:**
- Use Auto Layout for all components
- Responsive padding and spacing
- Minimum width/height constraints

---

### 9.3 Design Tokens (Styles)

**Color Styles:**
```
Light Theme/
├─ Background/Primary
├─ Background/Secondary
├─ Background/Tertiary
├─ Text/Primary
├─ Text/Secondary
├─ Text/Tertiary
├─ Border/Default
└─ Border/Hover

Dark Theme/
├─ Background/Primary
├─ ...
```

**Text Styles:**
```
Display
├─ Display/Regular
└─ Display/Bold

Heading/
├─ H1
├─ H2
└─ H3

Body/
├─ Body Large
├─ Body
└─ Body Small

Caption
```

**Effect Styles (Shadows):**
```
Shadow/
├─ Small
├─ Medium
└─ Large
```

---

### 9.4 Prototyping Interactions

**Key Flows to Prototype:**

1. **Browse Memories Flow**
   ```
   Homepage → Click Marker → View Memory → Close → Return to Map
   ```

2. **Submit Memory Flow**
   ```
   Homepage → Share Memory → Choose Auth → Enter Details → 
   Select Location → Upload Photos → Submit → View Published
   ```

3. **Theme Toggle Flow**
   ```
   Any Page → Click Theme Toggle → Smooth transition → 
   All colors update
   ```

4. **Search Flow**
   ```
   Homepage → Open Search → Enter Query → Filter → View Results → 
   Select Memory
   ```

**Interaction Types:**
- **On Click**: Navigate to screen, Open modal, Change variant
- **On Hover**: Change state (button hover, marker scale)
- **While Scrolling**: Fixed header, Parallax effects (minimal)
- **After Delay**: Auto-close notifications (3s)

**Transitions:**
- **Instant**: Theme changes, Modal overlays
- **Dissolve**: Screen transitions
- **Smart Animate**: Component state changes
- **Slide In**: Sidebar modals

---

### 9.5 Responsive Frames

**Artboard Sizes:**
```
Desktop:
- 1440 × 900 (standard desktop)
- 1920 × 1080 (large desktop)

Tablet:
- 768 × 1024 (iPad portrait)
- 1024 × 768 (iPad landscape)

Mobile:
- 375 × 812 (iPhone 12/13/14)
- 390 × 844 (iPhone 14 Pro)
- 393 × 852 (Pixel 7)
```

**Constraints:**
- Use "Constraints" for responsive behavior
- Test resizing between breakpoints
- Ensure text doesn't overflow
- Images scale proportionally

---

### 9.6 Handoff to Development

**Developer Mode Features:**
- Inspect spacing, typography, colors
- Export assets (SVG icons, images)
- Copy CSS styles
- Download component specs

**Export Settings:**
```
Images:
- Format: WebP (with PNG fallback)
- Scale: 1×, 2×, 3× (for retina)

Icons:
- Format: SVG
- Optimize: Remove unnecessary attributes

Fonts:
- Include: Roboto Mono (all weights)
- Format: WOFF2 (for web)
```

**Annotations:**
- Add notes for complex interactions
- Document hover states
- Explain animation timing
- Note accessibility requirements

---

## NEXT STEPS

### Phase 1.3 Deliverables - TO CREATE

- [ ] **Design Tokens** in Figma (colors, typography, spacing)
- [ ] **Component Library** (20+ components)
- [ ] **Wireframes** (7 key screens × 3 devices = 21 frames)
- [ ] **High-Fidelity Mockups** (Light + Dark themes, 3 devices = 42 frames)
- [ ] **Interactive Prototype** (linked screens with interactions)
- [ ] **Map Style Configuration** (Mapbox/Leaflet custom style)
- [ ] **Accessibility Checklist** (WCAG compliance verification)
- [ ] **Design Handoff Document** (for developers)

## CONFIRMED DESIGN DECISIONS

All design questions have been answered:

1. **Color Usage** ✅
   - Minimal colors only for navigation and clarity
   - Subtle accent colors: Blue (#2D5A7A) for selected states, Green/Red for success/error
   - Primary interface remains black & white

2. **Map Configuration** ✅
   - **Mapbox GL JS** with **Globe projection** (spheric world map)
   - **Monochrome grayscale** styling
   - Custom light/dark theme map styles
   - Forget Leaflet - using Mapbox exclusively

3. **Photo Treatment** ✅
   - User-uploaded photos remain in **full color**
   - NOT converted to grayscale
   - Creates beautiful contrast against monochrome interface
   - Color photos are the visual highlight

4. **About Marcos Page** ✅
   - **No separate "About" page**
   - Everyone knows Marcos
   - Photos of him only appear in people's contributed memories
   - Navigation simplified (no About link)

5. **Emotional Tone** ✅
   - **Celebratory, not somber**
   - Happy memories, smiles, and laughter
   - Reflective but joyful
   - Honoring life, not mourning death
   - UI copy: "Celebrating memories" not "Exploring memories"

---

## DESIGN SUMMARY

**Visual Identity:**
- Minimalistic black & white interface
- Roboto Mono typography throughout
- Light & Dark themes
- Color photos pop against monochrome UI
- Globe map view with grayscale styling

**Core Experience:**
- Full-viewport map as hero
- Immediate memory browsing (no barriers)
- Easy contribution (Google or anonymous)
- Celebratory tone in all copy
- Clean, distraction-free interface

**Technical Choices:**
- Mapbox GL JS (Globe projection)
- React + Vite
- Supabase backend
- Figma for design
- WebP images, aggressive compression

---

**Document Owner:** Design Lead  
**Last Updated:** December 26, 2025  
**Status:** Phase 1.3 Complete - Ready for Design Implementation  
**Next Phase:** Phase 2 - Infrastructure Setup (after design approval)
