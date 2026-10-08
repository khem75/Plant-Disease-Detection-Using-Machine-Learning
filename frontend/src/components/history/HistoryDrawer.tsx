"use client";

import { useHistory } from "../../hooks/useHistory";
import { HistoryItemCard } from "./HistoryItemCard";
import type { HistoryItem, PredictionResult } from "../../types/analysis";
import { getLocalDiseaseMetadata } from "../../lib/diseaseData";

interface HistoryDrawerProps {
  onSelectResult: (result: PredictionResult) => void;
  onNavigateToAnalysis: () => void;
}

export function HistoryDrawer({
  onSelectResult,
  onNavigateToAnalysis,
}: HistoryDrawerProps) {
  const {
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
    deleteItem,
    clearAll,
  } = useHistory();

  const handleSelectItem = (item: HistoryItem) => {
    // Construct PredictionResult from history record
    const diseaseMeta = getLocalDiseaseMetadata(`${item.plant}___${item.disease.replace(/ /g, "_")}`);
    const fullResult: PredictionResult = {
      id: item.id,
      plant: item.plant,
      disease: item.disease,
      pathogen: diseaseMeta.pathogen,
      confidence: item.confidence,
      confidence_level: item.confidence_level,
      class_name: `${item.plant}___${item.disease.replace(/ /g, "_")}`,
      image_url: item.image_url,
      gradcam_image: item.gradcam_image || "",
      heatmap_image: item.gradcam_image || "",
      disease_info: diseaseMeta,
      analyzed_at: item.timestamp,
    };
    onSelectResult(fullResult);
  };

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E8E8E2] pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#111827]">
            Analysis History
          </h2>
          <p className="text-xs text-[#52525B]">
            Review, filter, and inspect your previous plant diagnoses
          </p>
        </div>

        {filteredHistory.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your diagnostic history?")) {
                clearAll();
              }
            }}
            className="text-xs text-[#71717A] hover:text-rose-600 self-start sm:self-auto transition-colors"
          >
            Clear all history
          </button>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plant, disease..."
            className="w-full rounded-lg border border-[#D6D6CE] bg-white px-3 py-1.5 text-xs text-[#111827] placeholder-[#A1A1AA] focus:border-emerald-700 focus:outline-hidden"
          />
        </div>

        {/* Plant Filter */}
        <div>
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className="w-full rounded-lg border border-[#D6D6CE] bg-white px-3 py-1.5 text-xs text-[#111827] focus:border-emerald-700 focus:outline-hidden"
            aria-label="Filter by plant"
          >
            <option value="all">All Crops ({availablePlants.length})</option>
            {availablePlants.map((plant) => (
              <option key={plant} value={plant}>
                {plant}
              </option>
            ))}
          </select>
        </div>

        {/* Confidence Filter */}
        <div>
          <select
            value={selectedConfidence}
            onChange={(e) => setSelectedConfidence(e.target.value as any)}
            className="w-full rounded-lg border border-[#D6D6CE] bg-white px-3 py-1.5 text-xs text-[#111827] focus:border-emerald-700 focus:outline-hidden"
            aria-label="Filter by confidence"
          >
            <option value="all">All Confidence Levels</option>
            <option value="high">High Confidence (≥ 80%)</option>
            <option value="medium">Moderate Confidence (50–79%)</option>
            <option value="low">Low Confidence (&lt; 50%)</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full rounded-lg border border-[#D6D6CE] bg-white px-3 py-1.5 text-xs text-[#111827] focus:border-emerald-700 focus:outline-hidden"
            aria-label="Sort order"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="conf_desc">Highest confidence</option>
            <option value="conf_asc">Lowest confidence</option>
          </select>
        </div>
      </div>

      {/* History Items List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#71717A]">
          Loading records...
        </div>
      ) : filteredHistory.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D6D6CE] bg-[#FAFBF9] py-16 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[#1B4332] mb-3">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-[#111827]">
            {searchQuery || selectedPlant !== "all" || selectedConfidence !== "all"
              ? "No matching analyses found"
              : "No analyses yet"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-[#52525B]">
            {searchQuery || selectedPlant !== "all" || selectedConfidence !== "all"
              ? "Try adjusting your search query or relaxing your active filters."
              : "Upload your first leaf image to start building your diagnostic history."}
          </p>

          <button
            type="button"
            onClick={onNavigateToAnalysis}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[#1B4332] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#143326]"
          >
            <span>Analyze a leaf</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {filteredHistory.map((item) => (
            <HistoryItemCard
              key={item.id}
              item={item}
              onSelect={handleSelectItem}
              onDelete={deleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
