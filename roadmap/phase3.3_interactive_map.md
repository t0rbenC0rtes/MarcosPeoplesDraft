# Phase 3.3: Interactive Map Development

## marcospeoples.com - Mapbox GL Integration

**Date Created:** December 28, 2025  
**Status:** Planning  
**Dependencies:** Phase 3.1 (Frontend Foundation), Phase 3.2 (Authentication UI)  
**Map Library:** Mapbox GL JS v3.x

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Map Configuration](#map-configuration)
3. [Marker System](#marker-system)
4. [Clustering Logic](#clustering-logic)
5. [User Interactions](#user-interactions)
6. [Performance Optimization](#performance-optimization)
7. [Data Integration](#data-integration)
8. [Implementation Tasks](#implementation-tasks)

---

## OVERVIEW

### Purpose

Create an interactive global map as the main interface for exploring memories of Marcos Peebles. The map shows geographic locations of memories with clustering at low zoom levels and individual markers at high zoom levels.

### Key Geographic Regions

- **Brussels, Belgium** - Primary location
- **London, UK** - Secondary location
- **Santiago, Chile** - Secondary location
- **Other locations** - Memories may be added globally

### Technical Approach

- Use Mapbox GL JS for high-performance rendering
- Implement geographic clustering for scalability
- Progressive detail loading based on zoom level
- Smooth animations and transitions
- Mobile-responsive touch controls

---

## MAP CONFIGURATION

### Initial Map Setup

```javascript
// Map initialization in MapPage.jsx
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const map = new mapboxgl.Map({
  container: "map-container",
  style: "mapbox://styles/mapbox/light-v11", // Clean, minimal style
  center: [4.3517, 50.8503], // Brussels (default center)
  zoom: 5, // Europe-wide view
  minZoom: 2, // World view
  maxZoom: 18, // Street level
  projection: "globe", // 3D globe at low zoom levels
});
```

### Map Styles Options

**Option 1: Mapbox Light (Recommended)**

- Clean, minimal design
- Good contrast for black markers
- Memorial-appropriate aesthetic
- Low visual noise

**Option 2: Mapbox Dark**

- High contrast
- Modern feel
- Better for night viewing
- Consider for toggle option

**Option 3: Custom Style**

- Monochrome black/white theme
- Match website design system
- May require Mapbox Studio configuration

### Environment Variables

```env
# .env
VITE_MAPBOX_ACCESS_TOKEN=pk.ey...
```

### Map Controls

```javascript
// Add navigation controls (zoom +/-, compass)
map.addControl(new mapboxgl.NavigationControl(), "top-right");

// Add geolocation control (optional)
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: false,
  }),
  "top-right"
);

// Disable map rotation (simplify UX)
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();
```

---

## MARKER SYSTEM

### Memory Marker Design

**Visual Specifications:**

- **Shape:** Circle (consistent with memorial aesthetic)
- **Color:** Black (#000000) - primary theme
- **Size:**
  - Default: 32px diameter
  - Hover: 40px diameter (scale animation)
  - Selected: 48px diameter
- **Border:** 2px white outline for contrast
- **Content:**
  - Single memory: Small photo thumbnail
  - Cluster: Number of memories

### Marker States

1. **Default State**

   - Black circle with white border
   - Subtle drop shadow
   - Slightly transparent (0.85 opacity)

2. **Hover State**

   - Scale to 1.25x
   - Full opacity (1.0)
   - Show tooltip with memory title
   - Animate transition (0.2s ease)

3. **Selected State**
   - Scale to 1.5x
   - Pulsing animation
   - Connected line to detail panel
   - Highlighted border

### Marker Implementation

```javascript
// Custom marker HTML
const createMarkerElement = (memory, count = 1) => {
  const el = document.createElement("div");
  el.className = "memory-marker";

  if (count === 1) {
    // Single memory marker
    el.innerHTML = `
      <div class="marker-content">
        ${
          memory.photo_url
            ? `<img src="${memory.photo_url}" alt="${memory.title}" />`
            : `<div class="marker-icon">📍</div>`
        }
      </div>
    `;
  } else {
    // Cluster marker
    el.innerHTML = `
      <div class="marker-cluster">
        <span class="cluster-count">${count}</span>
      </div>
    `;
  }

  return el;
};

// Add marker to map
const marker = new mapboxgl.Marker({
  element: createMarkerElement(memory),
  anchor: "bottom",
})
  .setLngLat([memory.coordinates.longitude, memory.coordinates.latitude])
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${memory.title}</h3><p>${memory.location_name}</p>`
    )
  )
  .addTo(map);
```

---

## CLUSTERING LOGIC

### Clustering Strategy

**Use Mapbox's supercluster library for client-side clustering:**

```bash
npm install supercluster
```

### Cluster Configuration

```javascript
import Supercluster from "supercluster";

const cluster = new Supercluster({
  radius: 60, // Cluster radius in pixels
  maxZoom: 14, // Don't cluster at zoom levels above 14
  minZoom: 0,
  minPoints: 2, // Minimum memories to form a cluster
});

// Load memory points into cluster
const points = memories.map((memory) => ({
  type: "Feature",
  properties: {
    memory: memory,
    cluster: false,
  },
  geometry: {
    type: "Point",
    coordinates: [memory.coordinates.longitude, memory.coordinates.latitude],
  },
}));

cluster.load(points);
```

### Dynamic Cluster Updates

```javascript
// Update clusters based on zoom level
const updateClusters = () => {
  const zoom = map.getZoom();
  const bounds = map.getBounds();

  const bbox = [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth(),
  ];

  const clusters = cluster.getClusters(bbox, Math.floor(zoom));

  // Clear existing markers
  markers.forEach((m) => m.remove());
  markers = [];

  // Add new markers/clusters
  clusters.forEach((cluster) => {
    const [lng, lat] = cluster.geometry.coordinates;
    const properties = cluster.properties;

    if (properties.cluster) {
      // Create cluster marker
      const count = properties.point_count;
      const marker = new mapboxgl.Marker({
        element: createClusterMarker(count),
      })
        .setLngLat([lng, lat])
        .addTo(map);

      // Click to zoom into cluster
      marker.getElement().addEventListener("click", () => {
        const clusterId = properties.cluster_id;
        const zoom = cluster.getClusterExpansionZoom(clusterId);
        map.easeTo({ center: [lng, lat], zoom });
      });

      markers.push(marker);
    } else {
      // Create individual memory marker
      const memory = properties.memory;
      const marker = createMemoryMarker(memory);
      markers.push(marker);
    }
  });
};

// Listen to zoom/move events
map.on("moveend", updateClusters);
map.on("zoomend", updateClusters);
```

### Zoom-Based Behavior

| Zoom Level | Behavior                                         | Detail Level |
| ---------- | ------------------------------------------------ | ------------ |
| 2-4        | Global view, all memories clustered by continent | Very low     |
| 5-8        | Regional view, clustered by city/country         | Low          |
| 9-12       | City view, clustered by neighborhood             | Medium       |
| 13-14      | Neighborhood view, some individual markers       | High         |
| 15+        | Street level, all individual markers visible     | Full         |

---

## USER INTERACTIONS

### Click Events

**1. Cluster Click:**

- Zoom into cluster center
- Smooth animation (1 second)
- Expand to show individual memories

**2. Memory Marker Click:**

- Open memory detail view (modal or side panel)
- Highlight marker
- Load full memory data (story, photos, author)
- Show "Close" button to return to map

**3. Map Click (Empty Area):**

- Close any open memory detail
- Deselect any selected marker
- Return to browse mode

### Hover Effects

```javascript
// Add hover tooltip
const showHoverTooltip = (memory, lngLat) => {
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 15,
  })
    .setLngLat(lngLat)
    .setHTML(
      `
      <div class="memory-hover-tooltip">
        <h4>${memory.title || "Untitled Memory"}</h4>
        <p>${memory.location_name}</p>
        <span class="memory-year">${memory.year || "Unknown date"}</span>
      </div>
    `
    )
    .addTo(map);

  return popup;
};
```

### Touch Gestures (Mobile)

- **Single tap:** Select marker
- **Double tap:** Zoom in
- **Pinch:** Zoom in/out
- **Two-finger drag:** Pan
- **Long press:** Show marker details

---

## PERFORMANCE OPTIMIZATION

### Memory Loading Strategy

**1. Viewport-Based Loading:**

```javascript
const fetchVisibleMemories = async () => {
  const bounds = map.getBounds();
  const { data, error } = await supabase.rpc("get_memories_in_bounds", {
    min_lat: bounds.getSouth(),
    max_lat: bounds.getNorth(),
    min_lng: bounds.getWest(),
    max_lng: bounds.getEast(),
  });

  return data;
};
```

**2. Debounced Updates:**

```javascript
import { debounce } from "lodash";

const debouncedUpdate = debounce(() => {
  updateClusters();
}, 300); // Wait 300ms after user stops panning

map.on("move", debouncedUpdate);
```

**3. Marker Pooling:**

- Reuse marker DOM elements instead of creating new ones
- Remove markers outside viewport bounds
- Keep pool of ~100 markers maximum

### Image Optimization

```javascript
// Use thumbnail URLs for map markers
const markerImageUrl =
  memory.media?.[0]?.thumbnail_url || memory.media?.[0]?.file_url;

// Lazy load full images only when memory detail is opened
```

### WebGL Acceleration

- Mapbox GL JS uses WebGL by default
- Hardware-accelerated rendering
- Smooth 60fps animations
- Efficient for 100s of markers

---

## DATA INTEGRATION

### Supabase Query for Map Data

```javascript
// Fetch memories with geographic data
const fetchMemoriesForMap = async () => {
  const { data, error } = await supabase
    .from("memories")
    .select(
      `
      id,
      title,
      location_name,
      coordinates,
      year,
      time_period,
      photo_count,
      media (
        thumbnail_url
      )
    `
    )
    .eq("is_hidden", false)
    .eq("is_deleted", false)
    .not("coordinates", "is", null); // Only memories with location

  if (error) throw error;
  return data;
};
```

### Geographic Database Functions

Already created in `001_initial_schema.sql`:

**1. get_memories_in_bounds(min_lat, max_lat, min_lng, max_lng)**

- Returns memories within bounding box
- Uses PostGIS spatial index
- Optimized for viewport queries

**2. get_memories_nearby(lat, lng, radius_km)**

- Returns memories within radius
- For "Memories near you" feature
- Distance calculated in kilometers

### Real-Time Updates

```javascript
// Subscribe to new memories
const subscription = supabase
  .channel("memories-changes")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "memories",
      filter: "is_hidden=eq.false",
    },
    (payload) => {
      // Add new memory marker to map
      const newMemory = payload.new;
      if (newMemory.coordinates) {
        addMemoryMarker(newMemory);
      }
    }
  )
  .subscribe();
```

---

## IMPLEMENTATION TASKS

### Task 1: Setup Mapbox

**Estimated Time:** 2 hours

- [ ] Create Mapbox account
- [ ] Generate access token
- [ ] Add token to `.env` and Vercel environment variables
- [ ] Install dependencies: `npm install mapbox-gl supercluster`
- [ ] Test basic map rendering

### Task 2: Map Container Component

**Estimated Time:** 3 hours

- [ ] Create `MapPage.jsx` component
- [ ] Initialize Mapbox GL map instance
- [ ] Configure map styles and controls
- [ ] Handle window resize
- [ ] Add loading state
- [ ] Create map CSS (full viewport height minus header)

### Task 3: Fetch and Display Memories

**Estimated Time:** 4 hours

- [ ] Create `useMapMemories` custom hook
- [ ] Fetch memories with coordinates from Supabase
- [ ] Transform data to GeoJSON format
- [ ] Display individual markers (no clustering first)
- [ ] Add click handlers to open memory detail
- [ ] Test with real database data

### Task 4: Implement Clustering

**Estimated Time:** 5 hours

- [ ] Integrate Supercluster library
- [ ] Create cluster marker component
- [ ] Implement zoom-based cluster updates
- [ ] Add cluster click to zoom behavior
- [ ] Style cluster markers (count display)
- [ ] Test clustering with 50+ memories

### Task 5: Memory Markers Styling

**Estimated Time:** 4 hours

- [ ] Create custom marker HTML elements
- [ ] Style markers (black circles with white border)
- [ ] Add hover effects and animations
- [ ] Display thumbnail images in markers
- [ ] Implement selected state styling
- [ ] Add CSS animations (scale, pulse)

### Task 6: Marker Interactions

**Estimated Time:** 5 hours

- [ ] Implement hover tooltips
- [ ] Add click to open memory detail
- [ ] Create memory detail modal/panel
- [ ] Connect to `useMemory` hook for full data
- [ ] Add close button to return to map
- [ ] Handle URL updates (e.g., `/memory/:id`)

### Task 7: Performance Optimization

**Estimated Time:** 3 hours

- [ ] Implement viewport-based loading
- [ ] Add debouncing to map move events
- [ ] Optimize marker rendering (remove off-screen)
- [ ] Lazy load memory detail data
- [ ] Test with 100+ memories
- [ ] Measure and optimize FPS

### Task 8: Mobile Responsiveness

**Estimated Time:** 3 hours

- [ ] Test touch gestures (pinch, pan)
- [ ] Adjust marker sizes for mobile
- [ ] Optimize tooltip positioning
- [ ] Handle smaller viewports
- [ ] Test on iOS and Android
- [ ] Adjust map controls placement

### Task 9: Map Filters Integration

**Estimated Time:** 4 hours

- [ ] Connect to search/filter state (Phase 3.5)
- [ ] Filter markers by year range
- [ ] Filter by language
- [ ] Filter by tags
- [ ] Update clusters when filters change
- [ ] Show "No results" state

### Task 10: Edge Cases & Polish

**Estimated Time:** 3 hours

- [ ] Handle memories without coordinates
- [ ] Handle map load errors
- [ ] Add fallback for WebGL unsupported browsers
- [ ] Smooth transitions between zoom levels
- [ ] Add keyboard navigation support
- [ ] Final visual polish

---

## TOTAL ESTIMATED TIME: 36 hours (4-5 days)

---

## MAP COMPONENT STRUCTURE

```
src/
├── pages/
│   └── MapPage.jsx           # Main map page component
├── components/
│   └── map/
│       ├── MapContainer.jsx       # Mapbox GL wrapper
│       ├── MemoryMarker.jsx       # Individual marker component
│       ├── ClusterMarker.jsx      # Cluster marker component
│       ├── MemoryPopup.jsx        # Hover tooltip
│       ├── MemoryDetail.jsx       # Selected memory panel
│       └── MapControls.jsx        # Custom map controls
├── hooks/
│   ├── useMapMemories.js     # Fetch memories for map
│   └── useMapClustering.js   # Clustering logic
└── styles/
    └── map.css               # Map-specific styles
```

---

## CSS SPECIFICATIONS

```css
/* Map container */
.map-container {
  width: 100%;
  height: calc(100vh - 80px); /* Full height minus header */
  position: relative;
}

/* Memory marker */
.memory-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #000;
  border: 2px solid #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.memory-marker:hover {
  transform: scale(1.25);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.memory-marker.selected {
  transform: scale(1.5);
  border-color: #666;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Cluster marker */
.marker-cluster {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #000;
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.marker-cluster:hover {
  transform: scale(1.15);
  background: #333;
}

.cluster-count {
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  font-family: "Roboto Mono", monospace;
}

/* Hover tooltip */
.memory-hover-tooltip {
  padding: 0.5rem;
  min-width: 150px;
}

.memory-hover-tooltip h4 {
  margin: 0 0 0.25rem 0;
  font-size: 14px;
  font-weight: 500;
}

.memory-hover-tooltip p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.memory-year {
  font-size: 11px;
  color: #999;
}
```

---

## NOTES & CONSIDERATIONS

### Accessibility

- Add ARIA labels to markers
- Keyboard navigation for marker selection
- Screen reader announcements for map updates
- High contrast mode support

### SEO

- Map page should have semantic HTML structure
- Memory titles in meta tags when selected
- Server-side rendering consideration for detail pages

### Future Enhancements

- Heat map overlay for memory density
- Time-based animation (show memories chronologically)
- 3D terrain view option
- Route/path visualization (Marcos's travels)
- Custom map style matching website theme

---

## SUCCESS CRITERIA

✅ Map loads within 2 seconds  
✅ Smooth 60fps performance with 100+ markers  
✅ Clustering works correctly at all zoom levels  
✅ Markers are clickable and show correct memory details  
✅ Mobile touch gestures work naturally  
✅ Map integrates with existing auth and data systems  
✅ Viewport-based loading reduces initial data fetch  
✅ Visual design matches memorial aesthetic (black/white/minimal)

---

**Status:** Ready for implementation  
**Next Phase:** Phase 3.4 - Memory Submission Form
