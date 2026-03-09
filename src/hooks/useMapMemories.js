import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";

export const useMapMemories = (searchTerm = "") => {
  const [memories, setMemories] = useState([]);
  const [allMemories, setAllMemories] = useState([]);
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
          tags,
          user:users (
            name
          ),
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

      setAllMemories(geoJsonPoints);
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

  // Filter memories based on search term
  const filteredMemories = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === "") {
      return allMemories;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const searchWords = searchLower.split(/\s+/);

    return allMemories.filter((point) => {
      const memory = point.properties.memory;
      const searchableText = [
        memory.title || "",
        memory.user?.name || "",
        memory.location_name || "",
        memory.year?.toString() || "",
        ...(memory.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      // Check if all search words are present in the searchable text
      return searchWords.every((word) => searchableText.includes(word));
    });
  }, [allMemories, searchTerm]);

  useEffect(() => {
    setMemories(filteredMemories);
  }, [filteredMemories]);

  const refresh = () => fetchMemories();

  return { memories, loading, error, refresh };
};
