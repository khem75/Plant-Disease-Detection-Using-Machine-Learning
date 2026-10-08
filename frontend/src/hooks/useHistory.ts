"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { APP_CONFIG } from "../lib/config";
import type { HistoryItem, ConfidenceLevel } from "../types/analysis";

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlant, setSelectedPlant] = useState<string>("all");
  const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "conf_desc" | "conf_asc">("newest");

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${APP_CONFIG.apiUrl}/history?limit=100`);
      if (!response.ok) throw new Error();
      const data: HistoryItem[] = await response.json();
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const deleteItem = useCallback(async (id: number) => {
    try {
      const response = await fetch(`${APP_CONFIG.apiUrl}/history/${id}`, { method: "DELETE" });
      if (response.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete history item", err);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      const response = await fetch(`${APP_CONFIG.apiUrl}/history`, { method: "DELETE" });
      if (response.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  }, []);

  // Distinct plants for filter dropdown
  const availablePlants = useMemo(() => {
    const plants = new Set<string>();
    history.forEach((item) => {
      if (item.plant) plants.add(item.plant);
    });
    return Array.from(plants).sort();
  }, [history]);

  // Filtered and sorted items
  const filteredHistory = useMemo(() => {
    let result = [...history];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.plant.toLowerCase().includes(q) ||
          item.disease.toLowerCase().includes(q) ||
          item.filename.toLowerCase().includes(q)
      );
    }

    // Plant filter
    if (selectedPlant !== "all") {
      result = result.filter((item) => item.plant.toLowerCase() === selectedPlant.toLowerCase());
    }

    // Confidence filter
    if (selectedConfidence !== "all") {
      result = result.filter((item) => item.confidence_level === selectedConfidence);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortOrder === "oldest") {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sortOrder === "conf_desc") {
        return b.confidence - a.confidence;
      }
      if (sortOrder === "conf_asc") {
        return a.confidence - b.confidence;
      }
      return 0;
    });

    return result;
  }, [history, searchQuery, selectedPlant, selectedConfidence, sortOrder]);

  return {
    history,
    filteredHistory,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedPlant,
    setSelectedPlant,
    selectedConfidence,
    setSelectedConfidence,
    sortOrder,
    setSortOrder,
    availablePlants,
    loadHistory,
    deleteItem,
    clearAll,
  };
}
