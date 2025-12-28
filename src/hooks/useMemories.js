import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";

export const useMemories = (filters = {}) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stabilize filters object to prevent infinite re-renders
  const stableFilters = useMemo(
    () => JSON.stringify(filters),
    [filters.yearStart, filters.yearEnd, filters.language, filters.tags]
  );

  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true);
      const parsedFilters = JSON.parse(stableFilters);
      let query = supabase
        .from("memories")
        .select(
          `
          *,
          user:users (
            id,
            name,
            profile_pic_url
          )
        `
        )
        .eq("is_hidden", false)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      // Apply filters
      if (parsedFilters.yearStart && parsedFilters.yearEnd) {
        query = query
          .gte("year", parsedFilters.yearStart)
          .lte("year", parsedFilters.yearEnd);
      }

      if (parsedFilters.language) {
        query = query.eq("language", parsedFilters.language);
      }

      if (parsedFilters.tags && parsedFilters.tags.length > 0) {
        query = query.overlaps("tags", parsedFilters.tags);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMemories(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching memories:", err);
    } finally {
      setLoading(false);
    }
  }, [stableFilters]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const refresh = () => fetchMemories();

  return { memories, loading, error, refresh };
};

export const useMemory = (memoryId) => {
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMemory = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("memories")
        .select(
          `
          *,
          user:users (
            id,
            name,
            profile_pic_url
          ),
          media:media (
            id,
            file_url,
            thumbnail_url,
            display_order
          )
        `
        )
        .eq("id", memoryId)
        .eq("is_hidden", false)
        .eq("is_deleted", false)
        .single();

      if (error) throw error;
      setMemory(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching memory:", err);
    } finally {
      setLoading(false);
    }
  }, [memoryId]);

  useEffect(() => {
    if (memoryId) {
      fetchMemory();
    }
  }, [memoryId, fetchMemory]);

  return { memory, loading, error };
};

export const useCreateMemory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createMemory = async (memoryData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("memories")
        .insert(memoryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Error creating memory:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createMemory, loading, error };
};

export const useUpdateMemory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateMemory = async (memoryId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("memories")
        .update(updates)
        .eq("id", memoryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Error updating memory:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateMemory, loading, error };
};

export const useDeleteMemory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteMemory = async (memoryId) => {
    try {
      setLoading(true);
      setError(null);

      // Soft delete
      const { error } = await supabase
        .from("memories")
        .update({ is_deleted: true })
        .eq("id", memoryId);

      if (error) throw error;
    } catch (err) {
      setError(err.message);
      console.error("Error deleting memory:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteMemory, loading, error };
};
