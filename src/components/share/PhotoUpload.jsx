import { useState } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "../../lib/supabase";
import "./PhotoUpload.css";

export default function PhotoUpload({ photos, setPhotos, userId }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validatePhoto = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/heic"];

    if (file.size > maxSize) {
      alert(`${file.name} is too large. Maximum size is 10MB.`);
      return false;
    }

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert(`${file.name} is not a valid image type. Use JPEG, PNG, or HEIC.`);
      return false;
    }

    return true;
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/jpeg",
    };

    try {
      const compressed = await imageCompression(file, options);
      return compressed;
    } catch (error) {
      console.error("Compression error:", error);
      return file;
    }
  };

  const generateThumbnail = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const size = 300;
          canvas.width = size;
          canvas.height = size;

          const aspect = img.width / img.height;
          let sx, sy, sw, sh;

          if (aspect > 1) {
            sw = img.height;
            sh = img.height;
            sx = (img.width - sw) / 2;
            sy = 0;
          } else {
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

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);

    if (photos.length + fileArray.length > 10) {
      alert("Maximum 10 photos allowed");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      if (!validatePhoto(file)) continue;

      try {
        // Compress
        const compressed = await compressImage(file);

        // Generate thumbnail
        const thumbnail = await generateThumbnail(compressed);

        // Sanitize filename - remove special characters, keep only alphanumeric, dots, hyphens
        const sanitizedName = file.name
          .replace(/[^a-zA-Z0-9.-]/g, "_")
          .replace(/_{2,}/g, "_")
          .replace(/^_|_$/g, "");

        // Upload to Supabase
        const fileName = `${userId}/${Date.now()}_${sanitizedName}`;
        const { data, error } = await supabase.storage
          .from("memories-photos")
          .upload(fileName, compressed);

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("memories-photos")
          .getPublicUrl(fileName);

        setPhotos((prev) => [
          ...prev,
          {
            file_url: urlData.publicUrl,
            thumbnail_url: thumbnail,
            display_order: prev.length,
          },
        ]);

        setUploadProgress(((i + 1) / fileArray.length) * 100);
      } catch (error) {
        console.error("Upload error:", error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const removePhoto = (index) => {
    const updated = photos
      .filter((_, i) => i !== index)
      .map((photo, i) => ({ ...photo, display_order: i }));
    setPhotos(updated);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="photo-upload">
      {photos.length === 0 ? (
        <div
          className="dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <p>📷 Drag photos here or click to browse</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() =>
              document.querySelector('.dropzone input[type="file"]').click()
            }
            className="btn-browse"
            disabled={uploading}
          >
            Browse Files
          </button>
        </div>
      ) : (
        <>
          <div className="photo-grid">
            {photos.map((photo, index) => (
              <div key={index} className="photo-item">
                <img
                  src={photo.thumbnail_url || photo.file_url}
                  alt={`Photo ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="btn-remove"
                  aria-label="Remove photo"
                >
                  ×
                </button>
                {index === 0 && <span className="cover-badge">Cover</span>}
              </div>
            ))}
          </div>
          {photos.length < 10 && (
            <div className="add-more">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={uploading}
                id="add-more-input"
              />
              <button
                type="button"
                onClick={() =>
                  document.getElementById("add-more-input").click()
                }
                className="btn-add-more"
                disabled={uploading}
              >
                + Add More Photos
              </button>
            </div>
          )}
        </>
      )}

      {uploading && (
        <div className="upload-progress">
          <progress value={uploadProgress} max={100} />
          <p>Uploading... {Math.round(uploadProgress)}%</p>
        </div>
      )}
    </div>
  );
}
