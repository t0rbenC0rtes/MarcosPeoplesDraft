import { useState } from "react";
import "./PhotoGallery.css";

export default function PhotoGallery({ photos }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  const sortedPhotos = [...photos].sort(
    (a, b) => a.display_order - b.display_order
  );

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedPhotos.length);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + sortedPhotos.length) % sortedPhotos.length
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "ArrowLeft") goToPrevious();
  };

  return (
    <>
      <div className="photo-grid">
        {sortedPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="photo-grid-item"
            onClick={() => openLightbox(index)}
          >
            <img
              src={photo.thumbnail_url || photo.file_url}
              alt={`Photo ${index + 1}`}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {lightboxOpen && (
        <div
          className="lightbox"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ×
          </button>

          {sortedPhotos.length > 1 && (
            <>
              <button
                className="lightbox-nav lightbox-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                className="lightbox-nav lightbox-next"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="Next"
              >
                ›
              </button>
            </>
          )}

          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={sortedPhotos[currentIndex].file_url}
              alt={`Photo ${currentIndex + 1}`}
            />
          </div>

          {sortedPhotos.length > 1 && (
            <div className="lightbox-counter">
              {currentIndex + 1} / {sortedPhotos.length}
            </div>
          )}

          {sortedPhotos.length > 1 && (
            <div className="lightbox-thumbnails">
              {sortedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`lightbox-thumbnail ${
                    index === currentIndex ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                >
                  <img
                    src={photo.thumbnail_url || photo.file_url}
                    alt={`Thumbnail ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
