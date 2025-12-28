import { useParams, useNavigate } from "react-router-dom";
import { useMemory } from "../hooks/useMemories";
import PhotoGallery from "../components/memory/PhotoGallery";
import "./MemoryDetailPage.css";

export default function MemoryDetailPage() {
  const { memoryId } = useParams();
  const navigate = useNavigate();
  const { memory, loading, error } = useMemory(memoryId);

  if (loading) return <div className="loading">Loading memory...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!memory) return <div className="error">Memory not found</div>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getAuthBadge = (user) => {
    // Check if user has Google auth (profile_pic_url or email domain)
    if (user.profile_pic_url || user.email) {
      return { type: "Google", icon: "🔐" };
    }
    return { type: "Anonymous", icon: "👤" };
  };

  const authBadge = getAuthBadge(memory.user);

  return (
    <div className="memory-detail">
      <button onClick={() => navigate("/")} className="btn-back">
        ← Back to Map
      </button>

      <div className="memory-header">
        <div className="memory-author">
          <div className="author-avatar">
            {memory.user.profile_pic_url ? (
              <img src={memory.user.profile_pic_url} alt={memory.user.name} />
            ) : (
              <div className="avatar-placeholder">
                {memory.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="author-info">
            <h3>{memory.user.name}</h3>
            <div className="author-badge">
              <span className={`badge badge-${authBadge.type.toLowerCase()}`}>
                {authBadge.icon} {authBadge.type}
              </span>
            </div>
          </div>
        </div>

        <div className="memory-timestamp">
          <span>📅 {formatDate(memory.created_at)}</span>
        </div>
      </div>

      <h1 className="memory-title">{memory.title || "Untitled Memory"}</h1>

      <div className="memory-meta">
        <div className="meta-item">
          <span className="meta-icon">📍</span>
          <span>{memory.location_name}</span>
        </div>
        {memory.year && (
          <div className="meta-item">
            <span className="meta-icon">🗓️</span>
            <span>{memory.year}</span>
          </div>
        )}
        {memory.tags && memory.tags.length > 0 && (
          <div className="meta-tags">
            {memory.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {memory.story && (
        <div className="memory-story">
          <p>{memory.story}</p>
        </div>
      )}

      {memory.media && memory.media.length > 0 && (
        <PhotoGallery photos={memory.media} />
      )}
    </div>
  );
}
