import { useParams } from "react-router-dom";
import { useMemory } from "../hooks/useMemories";

export default function MemoryDetailPage() {
  const { memoryId } = useParams();
  const { memory, loading, error } = useMemory(memoryId);

  if (loading) return <div>Loading memory...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!memory) return <div>Memory not found</div>;

  return (
    <div className="memory-detail">
      <h2>{memory.title || "Untitled Memory"}</h2>

      <div className="memory-meta">
        <p>By {memory.user.name}</p>
        <p>{memory.location_name}</p>
        {memory.year && <p>{memory.year}</p>}
      </div>

      {memory.story && (
        <div className="memory-story">
          <p>{memory.story}</p>
        </div>
      )}

      {memory.media && memory.media.length > 0 && (
        <div className="memory-gallery">
          {memory.media
            .sort((a, b) => a.display_order - b.display_order)
            .map((photo) => (
              <img
                key={photo.id}
                src={photo.file_url}
                alt="Memory"
                className="memory-photo"
              />
            ))}
        </div>
      )}
    </div>
  );
}
