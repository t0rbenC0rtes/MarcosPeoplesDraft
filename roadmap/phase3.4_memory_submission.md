# Phase 3.4: Memory Submission Form

## marcospeoples.com - Share Your Memories

**Date Created:** December 28, 2025  
**Status:** Planning  
**Dependencies:** Phase 3.1 (Authentication), Phase 3.2 (Styling), Phase 3.3 (Interactive Map)  
**Primary Component:** ShareMemoryPage.jsx

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Form Structure](#form-structure)
3. [Location Selection](#location-selection)
4. [Photo Upload](#photo-upload)
5. [Form Validation](#form-validation)
6. [Submission Flow](#submission-flow)
7. [User Experience](#user-experience)
8. [Implementation Tasks](#implementation-tasks)

---

## OVERVIEW

### Purpose

Allow authenticated users (Google OAuth or anonymous) to submit memories with photos, stories, and location data. All submissions are immediately published (post-moderation approach).

### Key Features

- Multi-field form with rich text story input
- Interactive location picker (map click or search)
- Multi-photo upload with drag-and-drop
- Real-time photo preview and reordering
- Client-side image compression
- Immediate publication on submit
- Auto-detection of language and time period
- Mobile-friendly interface

### User Flow

1. User navigates to `/share` (authentication required)
2. Fills in form fields (title, story, year, location)
3. Uploads photos (optional, max 10)
4. Reviews preview
5. Submits → Memory published immediately
6. Redirects to map showing new memory marker

---

## FORM STRUCTURE

### Required Fields

**1. Location** _(REQUIRED)_

- Input: Map picker OR address search
- Captured data: location_name, latitude, longitude
- Validation: Must have valid coordinates
- UI: Map modal or autocomplete search

**2. Story** _(REQUIRED)_

- Input: Textarea (multiline)
- Max length: 10,000 characters
- Min length: 10 characters
- Language: Auto-detected from text
- Validation: Cannot be empty or only whitespace

### Optional Fields

**3. Title**

- Input: Text input (single line)
- Max length: 500 characters
- Default: "Untitled Memory" if left empty
- Placeholder: "Give this memory a title..."

**4. Year**

- Input: Number input or year picker
- Range: 1972 - 2025 (Marcos's lifetime)
- Default: Empty (user can leave blank)
- Auto-calculates: time_period (e.g., "2010s")

**5. Photos**

- Input: File upload (drag-and-drop + click)
- Formats: JPEG, PNG, HEIC
- Max size per photo: 10MB
- Max photos: 10 per memory
- Auto-generates thumbnails
- User can reorder photos

**6. Tags**

- Input: Tag input (comma-separated or chips)
- Max tags: 10
- Max length per tag: 30 characters
- Auto-suggest: Common tags from existing memories
- Examples: "family", "brussels", "birthday", "travel"

### Hidden/Auto Fields

**7. User ID**

- Automatically captured from AuthContext
- Links memory to current user

**8. Language**

- Auto-detected from story text
- Fallback: User's browser language or 'en'
- Supported: en, fr, es, nl, pt

**9. Time Period**

- Auto-calculated from year
- Format: "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"

**10. Photo Count**

- Auto-calculated from uploaded photos array

---

## LOCATION SELECTION

### Option 1: Map Picker (Recommended)

**Implementation:**

```jsx
// LocationPicker component
import { useState } from "react";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import mapboxgl from "mapbox-gl";

const LocationPicker = ({ onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Map click handler
  const handleMapClick = async (e) => {
    const { lng, lat } = e.lngLat;

    // Reverse geocode to get address
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`
    );
    const data = await response.json();
    const place = data.features[0];

    const location = {
      location_name: place.place_name,
      latitude: lat,
      longitude: lng,
    };

    setSelectedLocation(location);
    onLocationSelect(location);
  };

  return (
    <div className="location-picker">
      <div ref={mapRef} className="picker-map" onClick={handleMapClick} />
      {selectedLocation && (
        <p className="selected-location">{selectedLocation.location_name}</p>
      )}
    </div>
  );
};
```

**Features:**

- Click map to select location
- Pin appears at clicked point
- Reverse geocoding gets address automatically
- User can adjust pin position
- Shows selected address below map

### Option 2: Search Autocomplete

**Implementation:**

```jsx
// Using Mapbox Geocoding API
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const LocationSearch = ({ onLocationSelect }) => {
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    types: "place,address,poi",
    placeholder: "Search for a location...",
  });

  geocoder.on("result", (e) => {
    const { place_name, center } = e.result;
    onLocationSelect({
      location_name: place_name,
      latitude: center[1],
      longitude: center[0],
    });
  });

  return <div ref={geocoderContainer} />;
};
```

**Features:**

- Type to search locations
- Autocomplete suggestions
- Supports addresses, cities, landmarks
- Returns coordinates automatically

### Hybrid Approach (Best UX)

**Recommended Implementation:**

1. Default: Map picker with pin
2. Alternative: Search bar above map
3. User can search OR click
4. Search result centers map and places pin
5. User can fine-tune pin position by clicking

---

## PHOTO UPLOAD

### Upload Interface

**Features:**

- Drag-and-drop zone
- Click to browse files
- Multi-select support
- Preview thumbnails immediately
- Show upload progress per photo
- Reorder photos with drag-and-drop
- Delete individual photos
- Set cover photo (first photo)

### Implementation Structure

```jsx
const PhotoUpload = ({ photos, setPhotos }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (files) => {
    setUploading(true);

    for (const file of files) {
      // Validate file
      if (!validatePhoto(file)) continue;

      // Compress image
      const compressed = await compressImage(file);

      // Generate thumbnail
      const thumbnail = await generateThumbnail(compressed);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("memories-photos")
        .upload(`${userId}/${Date.now()}-${file.name}`, compressed);

      if (data) {
        const photoUrl = supabase.storage
          .from("memories-photos")
          .getPublicUrl(data.path).data.publicUrl;

        setPhotos((prev) => [
          ...prev,
          {
            file_url: photoUrl,
            thumbnail_url: thumbnail,
            display_order: prev.length,
          },
        ]);
      }
    }

    setUploading(false);
  };

  return (
    <div className="photo-upload">
      <div className="dropzone" onDrop={handleDrop} onDragOver={handleDragOver}>
        {photos.length === 0 ? (
          <>
            <p>Drag photos here or click to browse</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </>
        ) : (
          <PhotoGrid photos={photos} setPhotos={setPhotos} />
        )}
      </div>
      {uploading && <progress />}
    </div>
  );
};
```

### Image Processing

**Client-Side Compression:**

```javascript
// Using browser-image-compression library
import imageCompression from "browser-image-compression";

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 2, // Max 2MB per photo
    maxWidthOrHeight: 1920, // Max dimension
    useWebWorker: true,
    fileType: "image/jpeg", // Convert all to JPEG
  };

  try {
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch (error) {
    console.error("Compression error:", error);
    return file; // Return original if compression fails
  }
};
```

**Thumbnail Generation:**

```javascript
const generateThumbnail = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Thumbnail size: 300x300
        const size = 300;
        canvas.width = size;
        canvas.height = size;

        // Center crop
        const aspect = img.width / img.height;
        let sx, sy, sw, sh;

        if (aspect > 1) {
          // Landscape
          sw = img.height;
          sh = img.height;
          sx = (img.width - sw) / 2;
          sy = 0;
        } else {
          // Portrait
          sw = img.width;
          sh = img.width;
          sx = 0;
          sy = (img.height - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
```

### Photo Reordering

**Drag and Drop Implementation:**

```jsx
// Using react-beautiful-dnd or native drag events
const PhotoGrid = ({ photos, setPhotos }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(photos);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    // Update display_order
    const updated = items.map((photo, index) => ({
      ...photo,
      display_order: index,
    }));

    setPhotos(updated);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="photos" direction="horizontal">
        {(provided) => (
          <div
            className="photo-grid"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {photos.map((photo, index) => (
              <Draggable
                key={photo.file_url}
                draggableId={photo.file_url}
                index={index}
              >
                {(provided) => (
                  <div
                    className="photo-item"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <img src={photo.thumbnail_url || photo.file_url} alt="" />
                    <button onClick={() => removePhoto(index)}>×</button>
                    {index === 0 && <span className="cover-badge">Cover</span>}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
```

---

## FORM VALIDATION

### Client-Side Validation Rules

**Story Field:**

```javascript
const validateStory = (story) => {
  const errors = [];

  if (!story || story.trim().length === 0) {
    errors.push("Story cannot be empty");
  }

  if (story.length < 10) {
    errors.push("Story must be at least 10 characters");
  }

  if (story.length > 10000) {
    errors.push("Story cannot exceed 10,000 characters");
  }

  return errors;
};
```

**Location Field:**

```javascript
const validateLocation = (location) => {
  if (!location) {
    return ["Please select a location on the map"];
  }

  if (!location.latitude || !location.longitude) {
    return ["Invalid location coordinates"];
  }

  if (Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) {
    return ["Invalid coordinates range"];
  }

  return [];
};
```

**Year Field:**

```javascript
const validateYear = (year) => {
  if (!year) return []; // Optional field

  const errors = [];
  const numYear = parseInt(year);

  if (isNaN(numYear)) {
    errors.push("Year must be a number");
  }

  if (numYear < 1972 || numYear > 2025) {
    errors.push("Year must be between 1972 and 2025 (Marcos's lifetime)");
  }

  return errors;
};
```

**Photos Validation:**

```javascript
const validatePhoto = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ["image/jpeg", "image/png", "image/heic", "image/jpg"];

  if (file.size > maxSize) {
    alert("Photo too large. Maximum size is 10MB.");
    return false;
  }

  if (!allowedTypes.includes(file.type)) {
    alert("Invalid file type. Please upload JPEG, PNG, or HEIC.");
    return false;
  }

  return true;
};
```

### Real-Time Validation

**Character Count Display:**

```jsx
<div className="form-field">
  <label>Story *</label>
  <textarea
    value={story}
    onChange={(e) => setStory(e.target.value)}
    maxLength={10000}
    placeholder="Share your memory of Marcos..."
  />
  <span className="char-count">{story.length} / 10,000 characters</span>
  {story.length < 10 && (
    <span className="error">Minimum 10 characters required</span>
  )}
</div>
```

**Visual Feedback:**

```css
.form-field.error input,
.form-field.error textarea {
  border-color: #d32f2f;
}

.form-field.success input,
.form-field.success textarea {
  border-color: #388e3c;
}

.form-field .error {
  color: #d32f2f;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
```

---

## SUBMISSION FLOW

### Form Submission Process

**1. Validate All Fields:**

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate all fields
  const storyErrors = validateStory(story);
  const locationErrors = validateLocation(location);
  const yearErrors = validateYear(year);

  if (
    storyErrors.length > 0 ||
    locationErrors.length > 0 ||
    yearErrors.length > 0
  ) {
    setErrors({
      story: storyErrors,
      location: locationErrors,
      year: yearErrors,
    });
    return;
  }

  // Continue with submission
  submitMemory();
};
```

**2. Prepare Memory Data:**

```javascript
const submitMemory = async () => {
  setSubmitting(true);

  // Auto-detect language from story
  const detectedLanguage = detectLanguage(story) || "en";

  // Calculate time period from year
  const timePeriod = year ? `${Math.floor(year / 10) * 10}s` : null;

  // Prepare memory object
  const memoryData = {
    user_id: user.id,
    title: title.trim() || "Untitled Memory",
    story: story.trim(),
    language: detectedLanguage,
    location_name: location.location_name,
    latitude: location.latitude,
    longitude: location.longitude,
    coordinates: `POINT(${location.longitude} ${location.latitude})`,
    year: year || null,
    time_period: timePeriod,
    tags: tags,
    photo_count: photos.length,
    is_hidden: false,
    is_deleted: false,
  };

  // Insert memory
  const { data: memory, error } = await supabase
    .from("memories")
    .insert(memoryData)
    .select()
    .single();

  if (error) {
    setError("Failed to create memory. Please try again.");
    setSubmitting(false);
    return;
  }

  // Insert photos if any
  if (photos.length > 0) {
    await insertPhotos(memory.id);
  }

  // Success!
  navigate(`/memory/${memory.id}`);
};
```

**3. Insert Photos:**

```javascript
const insertPhotos = async (memoryId) => {
  const photoInserts = photos.map((photo) => ({
    memory_id: memoryId,
    file_url: photo.file_url,
    thumbnail_url: photo.thumbnail_url,
    display_order: photo.display_order,
  }));

  const { error } = await supabase.from("media").insert(photoInserts);

  if (error) {
    console.error("Error inserting photos:", error);
  }
};
```

**4. Post-Submission:**

- Show success message
- Navigate to new memory detail page
- Memory appears immediately on map
- User can share or edit

### Language Auto-Detection

**Using franc library:**

```bash
npm install franc
```

```javascript
import { franc } from "franc";

const detectLanguage = (text) => {
  const langMap = {
    eng: "en",
    fra: "fr",
    spa: "es",
    nld: "nl",
    por: "pt",
  };

  const detected = franc(text, { minLength: 10 });
  return langMap[detected] || "en";
};
```

---

## USER EXPERIENCE

### Form Layout

**Desktop (Wide Screen):**

```
┌─────────────────────────────────────┐
│  Share Your Memory                   │
├─────────────────────────────────────┤
│                                      │
│  [Title Input]                       │
│                                      │
│  [Story Textarea - Large]            │
│  Character count: 0 / 10,000         │
│                                      │
│  [Year Picker]                       │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  [Location Map Picker]         │ │
│  │  Click to select location      │ │
│  └────────────────────────────────┘ │
│  Selected: Brussels, Belgium         │
│                                      │
│  [Photo Upload Zone]                 │
│  ┌──┐ ┌──┐ ┌──┐                     │
│  │  │ │  │ │  │  + Add More         │
│  └──┘ └──┘ └──┘                     │
│                                      │
│  [Tags Input]                        │
│  brussels, coffee, friends           │
│                                      │
│  [Cancel] [Submit Memory]            │
│                                      │
└─────────────────────────────────────┘
```

**Mobile (Narrow Screen):**

- Stack fields vertically
- Smaller map picker (collapsible)
- Single column photo grid
- Fixed submit button at bottom

### Progress Indicators

**Upload Progress:**

```jsx
{
  uploading && (
    <div className="upload-progress">
      <progress value={uploadedCount} max={totalFiles} />
      <p>
        Uploading {uploadedCount} of {totalFiles} photos...
      </p>
    </div>
  );
}
```

**Submission Loading:**

```jsx
<button type="submit" disabled={submitting} className="btn-primary">
  {submitting ? "Publishing..." : "Share Memory"}
</button>
```

### Error Handling

**Network Error:**

```jsx
{
  submitError && (
    <div className="alert alert-error">
      <p>{submitError}</p>
      <button onClick={retrySubmit}>Try Again</button>
    </div>
  );
}
```

**Photo Upload Error:**

```jsx
{
  photoErrors.map((error) => (
    <div key={error.filename} className="photo-error">
      <p>
        {error.filename}: {error.message}
      </p>
    </div>
  ));
}
```

---

## IMPLEMENTATION TASKS

### Task 1: Form Structure & State

**Estimated Time:** 3 hours

- [ ] Create ShareMemoryPage.jsx basic structure
- [ ] Set up form state with useState/useReducer
- [ ] Create form field components (input, textarea, select)
- [ ] Implement controlled inputs with two-way binding
- [ ] Add form reset functionality
- [ ] Style form with black/white theme

### Task 2: Location Picker

**Estimated Time:** 5 hours

- [ ] Install Mapbox Geocoder: `npm install @mapbox/mapbox-gl-geocoder`
- [ ] Create LocationPicker component
- [ ] Integrate Mapbox map with click handler
- [ ] Add reverse geocoding for clicked location
- [ ] Create search autocomplete alternative
- [ ] Display selected location below map
- [ ] Add "Change Location" button to reopen picker
- [ ] Mobile-responsive map size

### Task 3: Photo Upload

**Estimated Time:** 6 hours

- [ ] Install compression library: `npm install browser-image-compression`
- [ ] Create PhotoUpload component with drag-and-drop
- [ ] Implement file selection and validation
- [ ] Add client-side image compression
- [ ] Generate thumbnails for preview
- [ ] Upload to Supabase Storage (memories-photos bucket)
- [ ] Display upload progress per photo
- [ ] Create photo grid with preview
- [ ] Implement photo deletion
- [ ] Add photo reordering (drag-and-drop)

### Task 4: Form Validation

**Estimated Time:** 3 hours

- [ ] Create validation functions for each field
- [ ] Add real-time validation on input change
- [ ] Display error messages below fields
- [ ] Add visual feedback (red border, checkmarks)
- [ ] Implement character counters
- [ ] Validate on form submit before sending
- [ ] Prevent double-submission

### Task 5: Language Detection

**Estimated Time:** 2 hours

- [ ] Install franc: `npm install franc`
- [ ] Create detectLanguage utility function
- [ ] Auto-detect language from story text
- [ ] Map franc codes to app language codes (en/fr/es/nl/pt)
- [ ] Add language override option (optional)
- [ ] Test with multi-language samples

### Task 6: Submission Flow

**Estimated Time:** 4 hours

- [ ] Create useCreateMemory hook (may already exist)
- [ ] Implement memory data preparation
- [ ] Calculate time_period from year
- [ ] Insert memory to Supabase memories table
- [ ] Insert photos to media table with memory_id FK
- [ ] Handle errors with user-friendly messages
- [ ] Show loading state during submission
- [ ] Navigate to memory detail page on success
- [ ] Update map to show new marker immediately

### Task 7: Tags Input

**Estimated Time:** 3 hours

- [ ] Create TagsInput component
- [ ] Allow comma-separated or Enter key to add tags
- [ ] Display tags as chips with delete button
- [ ] Limit to 10 tags max
- [ ] Fetch and suggest common tags from DB
- [ ] Style tag chips with black/white theme
- [ ] Mobile-friendly tag input

### Task 8: Year Picker

**Estimated Time:** 2 hours

- [ ] Create year input (number or dropdown)
- [ ] Restrict range: 1972-2025
- [ ] Add increment/decrement buttons
- [ ] Make field optional
- [ ] Auto-calculate time_period on change
- [ ] Style with minimalist design

### Task 9: Form Polish & UX

**Estimated Time:** 3 hours

- [ ] Add autosave to localStorage (draft recovery)
- [ ] Implement unsaved changes warning
- [ ] Add "Preview" button to see before submit
- [ ] Create success confirmation modal
- [ ] Add cancel button with confirmation
- [ ] Optimize mobile layout (stack fields)
- [ ] Add helpful tooltips/hints
- [ ] Test accessibility (keyboard nav, screen readers)

### Task 10: Testing & Edge Cases

**Estimated Time:** 3 hours

- [ ] Test with all field combinations
- [ ] Test with 0 photos, 1 photo, 10 photos
- [ ] Test with very long story (10k chars)
- [ ] Test with special characters in title/story
- [ ] Test location picker in different regions
- [ ] Test upload failure scenarios
- [ ] Test network disconnection during submit
- [ ] Test on mobile devices (iOS/Android)
- [ ] Test with different user types (Google/anonymous)
- [ ] Fix all bugs found

---

## TOTAL ESTIMATED TIME: 34 hours (4-5 days)

---

## COMPONENT STRUCTURE

```
src/
├── pages/
│   └── ShareMemoryPage.jsx        # Main form page
├── components/
│   └── share/
│       ├── LocationPicker.jsx     # Map-based location selector
│       ├── PhotoUpload.jsx        # Drag-and-drop photo upload
│       ├── PhotoGrid.jsx          # Photo preview grid
│       ├── TagsInput.jsx          # Tag chips input
│       ├── YearPicker.jsx         # Year selection
│       └── FormPreview.jsx        # Preview before submit
├── hooks/
│   ├── useCreateMemory.js         # Memory creation hook (may exist)
│   └── useImageUpload.js          # Photo upload logic
└── utils/
    ├── imageCompression.js        # Image processing utilities
    ├── languageDetection.js       # Franc integration
    └── validation.js              # Form validation functions
```

---

## CSS SPECIFICATIONS

```css
/* Share Memory Form */
.share-page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.share-page h2 {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-lg);
  font-weight: 500;
}

.form-field {
  margin-bottom: var(--spacing-lg);
}

.form-field label {
  display: block;
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
  font-size: 0.875rem;
}

.form-field input,
.form-field textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 2px solid var(--color-black);
  font-family: var(--font-family);
  font-size: 0.875rem;
  background: var(--color-white);
  transition: var(--transition);
}

.form-field textarea {
  min-height: 200px;
  resize: vertical;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  background: var(--color-gray-light);
}

.form-field.error input,
.form-field.error textarea {
  border-color: #d32f2f;
}

.form-field .error-message {
  color: #d32f2f;
  font-size: 0.75rem;
  margin-top: var(--spacing-xs);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 0.75rem;
  color: var(--color-gray-dark);
  margin-top: var(--spacing-xs);
}

/* Location Picker */
.location-picker {
  border: 2px solid var(--color-black);
  padding: var(--spacing-sm);
  min-height: 300px;
  margin-bottom: var(--spacing-sm);
}

.picker-map {
  width: 100%;
  height: 250px;
  cursor: crosshair;
}

.selected-location {
  margin-top: var(--spacing-sm);
  font-size: 0.875rem;
  font-weight: 500;
}

/* Photo Upload */
.photo-upload {
  border: 2px dashed var(--color-black);
  padding: var(--spacing-lg);
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
}

.photo-upload:hover {
  background: var(--color-gray-light);
}

.photo-upload input[type="file"] {
  display: none;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border: 2px solid var(--color-black);
  overflow: hidden;
  cursor: move;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-item button {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--color-black);
  color: var(--color-white);
  border: none;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.cover-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: var(--color-black);
  color: var(--color-white);
  padding: 2px 6px;
  font-size: 0.625rem;
  font-weight: 500;
}

/* Tags Input */
.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border: 2px solid var(--color-black);
  min-height: 44px;
}

.tag-chip {
  background: var(--color-black);
  color: var(--color-white);
  padding: 4px 8px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag-chip button {
  background: none;
  border: none;
  color: var(--color-white);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.tags-input input {
  border: none;
  flex: 1;
  min-width: 120px;
  font-family: var(--font-family);
  font-size: 0.875rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
}

.btn-cancel {
  background: var(--color-white);
  border: 2px solid var(--color-black);
  color: var(--color-black);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-family: var(--font-family);
  cursor: pointer;
  transition: var(--transition);
}

.btn-cancel:hover {
  background: var(--color-gray-light);
}

.btn-submit {
  background: var(--color-black);
  border: 2px solid var(--color-black);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-family: var(--font-family);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.btn-submit:hover {
  background: #333;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .share-page {
    padding: var(--spacing-md);
  }

  .photo-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
```

---

## SUCCESS CRITERIA

✅ Form is intuitive and easy to complete  
✅ Location can be selected via map OR search  
✅ Photos upload successfully with compression  
✅ Real-time validation prevents invalid submissions  
✅ Language auto-detection works accurately  
✅ Memory publishes immediately after submit  
✅ Mobile experience is smooth and responsive  
✅ No data loss on accidental navigation away  
✅ Error messages are clear and actionable  
✅ Form works for both Google and anonymous users

---

**Status:** Ready for implementation  
**Next Phase:** Phase 3.5 - Search and Filter Functionality
