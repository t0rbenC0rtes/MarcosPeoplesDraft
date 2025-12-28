import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import LocationPicker from "../components/share/LocationPicker";
import PhotoUpload from "../components/share/PhotoUpload";
import TagsInput from "../components/share/TagsInput";
import { detectLanguage } from "../utils/languageDetection";
import "./ShareMemoryPage.css";

export default function ShareMemoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form state
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [year, setYear] = useState("");
  const [location, setLocation] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [tags, setTags] = useState([]);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation
  const validateForm = () => {
    const newErrors = {};

    // Story validation
    if (!story || story.trim().length < 10) {
      newErrors.story = "Story must be at least 10 characters";
    }
    if (story.length > 10000) {
      newErrors.story = "Story cannot exceed 10,000 characters";
    }

    // Location validation
    if (!location) {
      newErrors.location = "Please select a location";
    }

    // Year validation
    if (year) {
      const numYear = parseInt(year);
      if (isNaN(numYear) || numYear < 1972 || numYear > 2025) {
        newErrors.year = "Year must be between 1972 and 2025";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Auto-detect language
      const language = detectLanguage(story) || "en";

      // Calculate time period
      const timePeriod = year
        ? `${Math.floor(parseInt(year) / 10) * 10}s`
        : null;

      // Prepare memory data
      const memoryData = {
        user_id: user.id,
        title: title.trim() || "Untitled Memory",
        story: story.trim(),
        language,
        location_name: location.location_name,
        latitude: location.latitude,
        longitude: location.longitude,
        coordinates: `POINT(${location.longitude} ${location.latitude})`,
        year: year ? parseInt(year) : null,
        time_period: timePeriod,
        tags,
        photo_count: photos.length,
        is_hidden: false,
        is_deleted: false,
      };

      // Insert memory
      const { data: memory, error: memoryError } = await supabase
        .from("memories")
        .insert(memoryData)
        .select()
        .single();

      if (memoryError) throw memoryError;

      // Insert photos if any
      if (photos.length > 0) {
        const photoInserts = photos.map((photo) => ({
          memory_id: memory.id,
          file_url: photo.file_url,
          thumbnail_url: photo.thumbnail_url,
          display_order: photo.display_order,
        }));

        const { error: photosError } = await supabase
          .from("media")
          .insert(photoInserts);

        if (photosError) {
          console.error("Error inserting photos:", photosError);
        }
      }

      // Success! Navigate to the new memory
      navigate(`/memory/${memory.id}`);
    } catch (error) {
      console.error("Error submitting memory:", error);
      setErrors({ submit: "Failed to create memory. Please try again." });
      setSubmitting(false);
    }
  };

  return (
    <div className="share-page">
      <h2>Share Your Memory</h2>
      <p className="share-intro">
        Share a special moment, story, or memory of Marcos Peebles.
      </p>

      <form onSubmit={handleSubmit} className="share-form">
        {/* Title (Optional) */}
        <div className="form-field">
          <label htmlFor="title">Title (Optional)</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this memory a title..."
            maxLength={500}
          />
        </div>

        {/* Story (Required) */}
        <div className={`form-field ${errors.story ? "error" : ""}`}>
          <label htmlFor="story">
            Story <span className="required">*</span>
          </label>
          <textarea
            id="story"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Share your memory of Marcos..."
            maxLength={10000}
            rows={8}
            required
          />
          <div className="field-footer">
            <span className="char-count">
              {story.length} / 10,000 characters
            </span>
            {story.length > 0 && story.length < 10 && (
              <span className="error-hint">Minimum 10 characters</span>
            )}
          </div>
          {errors.story && <p className="error-message">{errors.story}</p>}
        </div>

        {/* Year (Optional) */}
        <div className={`form-field ${errors.year ? "error" : ""}`}>
          <label htmlFor="year">Year (Optional)</label>
          <input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g., 2015"
            min={1972}
            max={2025}
          />
          <p className="field-hint">Between 1972 and 2025</p>
          {errors.year && <p className="error-message">{errors.year}</p>}
        </div>

        {/* Location (Required) */}
        <div className={`form-field ${errors.location ? "error" : ""}`}>
          <label>
            Location <span className="required">*</span>
          </label>
          <LocationPicker location={location} setLocation={setLocation} />
          {errors.location && (
            <p className="error-message">{errors.location}</p>
          )}
        </div>

        {/* Photos (Optional) */}
        <div className="form-field">
          <label>Photos (Optional)</label>
          <PhotoUpload photos={photos} setPhotos={setPhotos} userId={user.id} />
          <p className="field-hint">
            Max 10 photos, 10MB each. JPEG, PNG, or HEIC.
          </p>
        </div>

        {/* Tags (Optional) */}
        <div className="form-field">
          <label htmlFor="tags">Tags (Optional)</label>
          <TagsInput tags={tags} setTags={setTags} />
          <p className="field-hint">
            Add keywords to help others find this memory (max 10)
          </p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="alert alert-error">{errors.submit}</div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn-cancel"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={submitting || !story || !location}
          >
            {submitting ? "Publishing..." : "Share Memory"}
          </button>
        </div>
      </form>
    </div>
  );
}
