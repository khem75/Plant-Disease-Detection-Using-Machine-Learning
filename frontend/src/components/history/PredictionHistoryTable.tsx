"use client";

import React, { useState } from "react";
import { Clock, Eye, MoreVertical, Trash2, ArrowRight } from "lucide-react";
import type { HistoryItem, PredictionResult } from "../../types/analysis";
import { formatTimestamp, getFullImageUrl } from "../../lib/utils";
import { getLocalDiseaseMetadata } from "../../lib/diseaseData";

interface PredictionHistoryTableProps {
  history: HistoryItem[];
  onSelectResult: (result: PredictionResult) => void;
  onViewAll?: () => void;
  onDeleteItem?: (id: number) => void;
  onClearAll?: () => void;
  isFullPage?: boolean;
}

export function PredictionHistoryTable({
  history,
  onSelectResult,
  onViewAll,
  onDeleteItem,
  onClearAll,
  isFullPage = false,
}: PredictionHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInspect = (item: HistoryItem) => {
    if (item.payload && (item.payload.disease || item.payload.prediction)) {
      onSelectResult(item.payload);
      return;
    }
    const meta = getLocalDiseaseMetadata(
      item.class_name || `${item.plant}___${item.disease.replace(/ /g, "_")}`
    );
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
  };

  const filtered = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.plant.toLowerCase().includes(q) ||
      item.disease.toLowerCase().includes(q) ||
      item.filename.toLowerCase().includes(q)
    );
  });

  const displayList = isFullPage ? filtered : filtered.slice(0, 10);

  return (
    <div className="rounded-2xl border border-[#DFE7DF] bg-white p-5 shadow-xs space-y-4">
      {/* Table Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EBF0EB]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F3E8] text-[#176B3A] shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#17261E]">Prediction History</h3>
            <p className="text-[11px] text-[#65746A]">
              Your recent analysis results
            </p>
          </div>
        </div>

        {/* Header Right Action */}
        <div className="flex items-center gap-2">
          {isFullPage && history.length > 0 && (
            <input
              type="text"
              placeholder="Search crop or disease..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-[#DFE7DF] px-3 py-1 text-xs text-[#17261E] placeholder-[#92A096] focus:border-[#176B3A] focus:outline-none"
            />
          )}

          {!isFullPage && onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFE7DF] bg-white px-3 py-1.5 text-xs font-semibold text-[#17261E] hover:bg-[#F2F6F2] transition"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}

          {isFullPage && onClearAll && history.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-1 text-xs font-semibold text-[#DC4545] hover:bg-[#FEE2E2] transition"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Table Body */}
      {displayList.length === 0 ? (
        <div className="py-10 text-center text-xs text-[#65746A]">
          {searchQuery ? "No matching records found." : "No prediction history recorded yet."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DFE7DF] text-[#65746A] bg-[#F2F6F2]/60 text-[11px]">
                <th className="py-2.5 px-3 font-semibold w-10">#</th>
                <th className="py-2.5 px-3 font-semibold w-16">Image</th>
                <th className="py-2.5 px-3 font-semibold">Plant</th>
                <th className="py-2.5 px-3 font-semibold">Predicted Disease</th>
                <th className="py-2.5 px-3 font-semibold">Confidence</th>
                <th className="py-2.5 px-3 font-semibold">Date &amp; Time</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBF0EB]">
              {displayList.map((item, index) => {
                const imgUrl = getFullImageUrl(item.image_url || item.gradcam_image);
                const isHealthy = item.disease.toLowerCase().includes("healthy");

                return (
                  <tr
                    key={item.id}
                    onClick={() => handleInspect(item)}
                    className="hover:bg-[#F2F6F2]/70 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 text-[#65746A] font-medium">{index + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="h-9 w-9 rounded-lg overflow-hidden border border-[#DFE7DF] bg-black/5 flex items-center justify-center">
                        {imgUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={imgUrl}
                            alt={item.disease}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] text-[#92A096]">Leaf</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#17261E]">
                      {item.plant}
                    </td>
                    <td className={`py-2.5 px-3 font-semibold ${isHealthy ? "text-[#25834A]" : "text-[#17261E]"}`}>
                      {item.disease}
                    </td>
                    <td className="py-2.5 px-3 text-[#17261E] font-semibold tabular-nums">
                      {item.confidence.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-[#65746A]">
                      {formatTimestamp(item.timestamp)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspect(item);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#DFE7DF] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#17261E] hover:bg-[#E8F3E8] hover:text-[#176B3A] transition"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>

                        {onDeleteItem ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteItem(item.id);
                            }}
                            title="Delete record"
                            className="p-1 rounded text-[#92A096] hover:text-[#DC4545] transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="p-1 text-[#92A096]">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
