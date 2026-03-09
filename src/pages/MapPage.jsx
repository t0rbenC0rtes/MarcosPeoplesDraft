import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapContainer from "../components/map/MapContainer";
import { useMapMemories } from "../hooks/useMapMemories";
import { useSearch } from "../contexts/SearchContext";

export default function MapPage() {
  const navigate = useNavigate();
  const { searchTerm } = useSearch();
  const { memories, loading, error } = useMapMemories(searchTerm);
  const [selectedMemory, setSelectedMemory] = useState(null);

  const handleMarkerClick = (memory) => {
    setSelectedMemory(memory);
    // Navigate to memory detail page
    navigate(`/memory/${memory.id}`);
  };

  if (loading) {
    return (
      <div className="map-page loading">
        <p>Loading memories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-page error">
        <p>Error loading memories: {error}</p>
      </div>
    );
  }

  return (
    <div className="map-page">
      <MapContainer memories={memories} onMarkerClick={handleMarkerClick} />
    </div>
  );
}
