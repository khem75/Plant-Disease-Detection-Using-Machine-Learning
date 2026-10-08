"use client";

import type { HistoryItem, PredictionResult } from "../../types/analysis";
import { getFullImageUrl, formatDateOnly } from "../../lib/utils";
import { getLocalDiseaseMetadata } from "../../lib/diseaseData";

interface HistoryViewProps {
  history: HistoryItem[];
  onSelectResult: (result: PredictionResult) => void;
  onBackToAnalyze: () => void;
  onDeleteItem: (id: number) => void;
  onClearAll: () => void;
}

export function HistoryView({
  history,
  onSelectResult,
  onBackToAnalyze,
  onDeleteItem,
  onClearAll,
}: HistoryViewProps) {
  const handleViewItem = (item: HistoryItem) => {
    if (item.payload && (item.payload.disease || item.payload.prediction)) {
      onSelectResult(item.payload);
      onBackToAnalyze();
      return;
    }
    const meta = getLocalDiseaseMetadata(item.class_name || `${item.plant}___${item.disease.replace(/ /g, "_")}`);
    const fullResult: PredictionResult = {
      id: item.id,
      analysisId: item.analysisId || String(item.id),
      plant: item.plant,
      disease: item.disease,
      pathogen: meta.pathogen,
      confidence: item.confidence,
      confidence_level: item.confidence_level,
      class_name: item.class_name || `${item.plant}___${item.disease.replace(/ /g, "_")}`,
      image_url: item.image_url,
      gradcam_image: item.gradcam_image || "",
      heatmap_image: item.heatmap_image || item.gradcam_image || "",
      disease_info: meta,
      analyzed_at: item.timestamp,
    };
    onSelectResult(fullResult);
    onBackToAnalyze();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">Analysis History</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {history.length > 0
              ? `${history.length} previous ${history.length === 1 ? "analysis" : "analyses"} recorded`
              : "No analyses recorded yet"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-sm font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            type="button"
            onClick={onBackToAnalyze}
            className="rounded-lg bg-[#065F46] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#064E3B] transition-colors"
          >
            ← New Analysis
          </button>
        </div>
      </div>

      {/* History Content */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E5E7EB] bg-white py-16 px-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F4F6] text-[#9CA3AF] mb-4">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#374151]">No history yet</h3>
          <p className="mt-1 text-sm text-[#9CA3AF] max-w-sm">
            Upload a leaf image and run your first analysis. All results will be saved here for review.
          </p>
          <button
            type="button"
            onClick={onBackToAnalyze}
            className="mt-4 rounded-lg bg-[#065F46] px-4 py-2 text-sm font-semibold text-white hover:bg-[#064E3B] transition-colors"
          >
            Start First Analysis
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-5 py-3 border-b border-[#F3F4F6] text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            <div className="col-span-4">Plant & Disease</div>
            <div className="col-span-2">Confidence</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#F3F4F6]">
            {history.map((item) => {
              const thumb = getFullImageUrl(item.image_url || item.gradcam_image) || "/samples/peach.jpg";
              const isHigh = item.confidence >= 75;
              const isMed = item.confidence >= 50 && item.confidence < 75;
              const statusLabel = isHigh ? "High" : isMed ? "Medium" : "Low";
              const statusColor = isHigh ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#FEF3C7] text-[#92400E]";

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:grid sm:grid-cols-12 gap-2.5 sm:gap-2 items-start sm:items-center px-4 sm:px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                  onClick={() => handleViewItem(item)}
                >
                  {/* Plant & Disease */}
                  <div className="w-full sm:w-auto sm:col-span-4 flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb} alt={item.plant} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[#111827] truncate">{item.plant}</div>
                      <div className="text-xs text-[#6B7280] truncate">{item.disease}</div>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-start w-full sm:w-auto">
                    <span className="sm:hidden text-xs text-[#6B7280]">Confidence:</span>
                    <span className="text-sm font-bold text-[#111827] tabular-nums">
                      {item.confidence.toFixed(1)}%
                    </span>
                  </div>

                  {/* Status */}
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-start w-full sm:w-auto">
                    <span className="sm:hidden text-xs text-[#6B7280]">Confidence Band:</span>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-start w-full sm:w-auto text-xs sm:text-sm text-[#6B7280] tabular-nums">
                    <span className="sm:hidden text-xs text-[#6B7280]">Analyzed:</span>
                    <span>{formatDateOnly(item.timestamp)}</span>
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-2 flex items-center justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F3F4F6]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewItem(item);
                      }}
                      className="text-xs sm:text-sm font-semibold text-[#065F46] hover:underline"
                    >
                      View Report →
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      className="rounded-lg p-1.5 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                      title="Delete record"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
