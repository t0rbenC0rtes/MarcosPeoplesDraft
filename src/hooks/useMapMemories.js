import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const useMapMemories = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("memories")
        .select(
          `
          id,
          title,
          location_name,
          latitude,
          longitude,
          year,
          time_period,
          photo_count,
          media (
            thumbnail_url,
            file_url
          )
        `
        )
        .eq("is_hidden", false)
        .eq("is_deleted", false)
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (error) throw error;

      // Transform to GeoJSON format for Supercluster
      const geoJsonPoints = (data || []).map((memory) => ({
        type: "Feature",
        properties: {
          memory,
          cluster: false,
        },
        geometry: {
          type: "Point",
          coordinates: [
            memory.longitude, // longitude first (GeoJSON standard)
            memory.latitude, // latitude second
          ],
        },
      }));

      setMemories(geoJsonPoints);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching memories for map:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const refresh = () => fetchMemories();

  return { memories, loading, error, refresh };
};
