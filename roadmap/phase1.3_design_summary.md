# Phase 1.3 Design Decisions Summary
## marcospeoples.com - Final Confirmed Specifications

**Date:** December 26, 2025  
**Status:** All design questions answered ✅  
**Ready for:** Figma prototype creation

---

## FINAL DESIGN DECISIONS

### 1. Color Palette ✅

**Primary Interface:**
- **Black & White** minimalistic aesthetic
- Light theme: Pure white (#FFFFFF) background, black (#000000) text
- Dark theme: Near-black (#0A0A0A) background, white (#FFFFFF) text

**Accent Colors (Minimal, only for navigation/clarity):**
- Selected states: Subtle blue (#2D5A7A / #5D9AB3)
- Success: Subtle green (#2D7A2D / #5DB35D)
- Error: Subtle red (#7A2D2D / #B35D5D)
- Warning: Subtle yellow (#7A6A2D / #B3A05D)

**Key Principle:** Colors used sparingly, only where needed for usability

---

### 2. Photography Treatment ✅

**User-Uploaded Photos:**
- Remain in **FULL COLOR**
- NOT converted to grayscale
- Creates beautiful, vibrant contrast against monochrome interface
- Photos are the visual heroes of the site

**Rationale:** Color memories pop against the clean B&W UI, creating emotional impact and celebrating life

---

### 3. Map Configuration ✅

**Platform:** Mapbox GL JS (final choice, forget Leaflet)

**Projection:** Globe view (spheric world map)
- Gives global perspective
- Smooth 3D rotations
- Modern, polished aesthetic

**Styling:** Monochrome Grayscale
- **Light theme:** White background, light gray water/land, subtle borders
- **Dark theme:** Near-black background, dark gray water/land, subtle borders
- Custom Mapbox style configuration
- Minimal labels (Roboto Mono font)

**Key Features:**
- Globe projection for world view
- Zoom into flat projection at city level
- Smooth animations
- Optional subtle globe rotation when idle

---

### 4. Typography ✅

**Font Family:** Roboto Mono (exclusively)
- All text uses Roboto Mono
- Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)
- Technical, honest aesthetic
- Excellent readability at all sizes

**Type Scale:**
- Display: 48px (page titles)
- H1: 32px (section headers)
- H2: 24px (subsections)
- H3: 18px (card titles)
- Body Large: 16px (memory stories)
- Body: 14px (default text)
- Body Small: 12px (metadata)
- Caption: 10px (tiny text)

---

### 5. Navigation Structure ✅

**NO "About Marcos" Page**
- Everyone knows Marcos
- Photos of him only in contributed memories
- Simplified navigation

**Main Navigation:**
- Home / Map (default view)
- Search
- Language Selector (EN, FR, ES, NL, PT)
- Theme Toggle (Light/Dark)
- Share a Memory (CTA button)

**Footer:**
- How to Contribute
- Privacy Policy
- Terms of Use

---

### 6. Emotional Tone ✅

**Celebratory, NOT Somber**
- Happy memories, smiles, laughter
- Joyful reflection on life
- Honoring life, not mourning
- Warm, welcoming atmosphere

**Copy Adjustments:**
- "Celebrating 147 memories" (not "Exploring")
- "Celebrating the life of Marcos Peebles"
- Positive, uplifting language throughout
- Focus on joy and connection

---

### 7. Layout & Spacing ✅

**Grid System:**
- 8px base unit
- 12-column grid (desktop)
- Generous whitespace
- Breathing room around elements

**Responsive Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large: 1440px+

---

### 8. Component Style ✅

**Borders & Shadows:**
- Prefer borders over shadows
- 1px solid borders (#D0D0D0 light / #3A3A3A dark)
- Minimal shadows (only for modals)
- Sharp corners with subtle radius (2-4px)

**Interactive Elements:**
- Hover: Invert colors or thicken border
- Focus: 2px outline
- Active: Slightly darker shade
- Transitions: 150-350ms smooth

---

### 9. Map Markers ✅

**Single Memory Marker:**
- Filled circle (10px diameter)
- Black (light theme) / White (dark theme)
- Hover: Scale 1.2×
- Selected: Blue accent (#2D5A7A), pulse animation

**Cluster Marker:**
- Circle with count inside
- Scales with number of memories (16-48px)
- White/black border
- Hover: Border thickens

---

### 10. Photo Gallery ✅

**Display:**
- Full-width swipeable gallery
- Color photos (original colors)
- Thumbnails below main image
- Left/right navigation arrows
- Fullscreen mode available

**Loading:**
- Lazy load images
- Show thumbnails first
- Progressive enhancement
- Smooth transitions

---

## DESIGN DELIVERABLES CHECKLIST

### To Create in Figma:

- [x] **Design System**
  - Color tokens (light + dark)
  - Typography styles
  - Spacing system
  - Component styles

- [ ] **Components** (20+ variants)
  - Buttons (4 types × 3 sizes × 5 states)
  - Input fields
  - Cards (memory, info, feature)
  - Modals (sidebar, center, fullscreen)
  - Map markers
  - Navigation (header, footer)
  - Photo gallery

- [ ] **Wireframes**
  - Homepage/Map view (desktop, tablet, mobile)
  - Memory detail (desktop sidebar, mobile fullscreen)
  - Share memory form (3 steps)
  - Search & filters
  - Timeline view (optional)

- [ ] **High-Fidelity Mockups**
  - Light theme (all screens, all devices)
  - Dark theme (all screens, all devices)
  - Interactive states
  - Edge cases

- [ ] **Prototype**
  - Linked screens
  - Interactive flows
  - Animations
  - Theme toggle
  - Map interactions

- [ ] **Developer Handoff**
  - Export assets
  - CSS variables
  - Component specs
  - Interaction notes

---

## MAPBOX CONFIGURATION REFERENCE

```javascript
// Initialize Mapbox with Globe
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11', // Customize to monochrome
  projection: 'globe',
  center: [4.3517, 50.8503], // Brussels
  zoom: 1.5
});

// Apply custom monochrome styling
map.on('load', () => {
  // See full style config in Phase 1.3 doc
  map.setStyle(monochromeStyle);
});
```

---

## COLOR REFERENCE GUIDE

### Light Theme
```css
--bg-primary: #FFFFFF;
--bg-secondary: #F5F5F5;
--text-primary: #000000;
--text-secondary: #333333;
--text-tertiary: #666666;
--border: #D0D0D0;

--accent-blue: #2D5A7A;    /* Selected states */
--accent-green: #2D7A2D;   /* Success */
--accent-red: #7A2D2D;     /* Error */
```

### Dark Theme
```css
--bg-primary: #0A0A0A;
--bg-secondary: #1A1A1A;
--text-primary: #FFFFFF;
--text-secondary: #E0E0E0;
--text-tertiary: #A0A0A0;
--border: #3A3A3A;

--accent-blue: #5D9AB3;    /* Selected states */
--accent-green: #5DB35D;   /* Success */
--accent-red: #B35D5D;     /* Error */
```

---

## PHOTO SPECIFICATIONS

**Upload:**
- Max 10MB per photo
- Formats: JPG, PNG, WebP
- Up to 8 photos per memory

**Processing:**
- Compress to ~1.5MB (80-85% quality)
- Generate thumbnails (300×300)
- Store in WebP format
- NO grayscale conversion

**Display:**
- Show in full color
- Responsive sizing
- Lazy loading
- Progressive enhancement

---

## ACCESSIBILITY TARGETS

**WCAG 2.1 Level AA:**
- ✅ Color contrast: 4.5:1 minimum (text)
- ✅ Color contrast: 3:1 minimum (large text, UI)
- ✅ Keyboard navigation: Full site
- ✅ Screen reader: Proper ARIA labels
- ✅ Focus indicators: 2px visible outline
- ✅ Reduced motion: Respect preferences
- ✅ Alt text: All meaningful images

---

## NEXT STEPS

1. **Create Figma File** with structure:
   - Cover page
   - Design tokens
   - Components library
   - Wireframes
   - High-fidelity mockups (light + dark)
   - Interactive prototype

2. **Design Review** with stakeholders

3. **Proceed to Phase 2**: Infrastructure Setup
   - Initialize React + Vite
   - Set up Supabase
   - Configure Mapbox
   - Deploy to Vercel

---

**Document Owner:** Design Lead  
**Last Updated:** December 26, 2025  
**Status:** Phase 1.3 Complete ✅  
**Next:** Create Figma prototype OR begin Phase 2 development
