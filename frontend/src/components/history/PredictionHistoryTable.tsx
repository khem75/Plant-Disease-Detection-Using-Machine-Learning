"use client";

import React, { useState } from "react";
import { Clock, Eye, Trash2, ArrowRight, Download, FileSpreadsheet } from "lucide-react";
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

  const handleExportAllCsv = () => {
    if (history.length === 0) return;
    const headers = [
      "ID",
      "Plant Species",
      "Diagnosed Disease",
      "Confidence (%)",
      "Confidence Grade",
      "Filename",
      "Timestamp",
    ];
    const rows = history.map((item) => [
      item.id,
      `"${item.plant}"`,
      `"${item.disease}"`,
      item.confidence.toFixed(2),
      `"${item.confidence_level}"`,
      `"${item.filename}"`,
      `"${item.timestamp}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `plant-disease-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EBF0EB]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F3E8] text-[#176B3A] shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#17261E]">Past Leaf Scans</h3>
            <p className="text-[11px] text-[#65746A]">
              Record of your previous leaf checks and diagnoses ({history.length} total)
            </p>
          </div>
        </div>

        {/* Header Right Action */}
        <div className="flex flex-wrap items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleExportAllCsv}
              title="Export all history to CSV spreadsheet"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFE7DF] bg-[#F8FAF8] hover:bg-[#E8F3E8] px-2.5 py-1 text-xs font-semibold text-[#17261E] hover:text-[#176B3A] transition shadow-2xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#176B3A]" />
              <span>Export CSV</span>
            </button>
          )}

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
          {searchQuery ? "No matching records found." : "No leaf checks recorded yet. Upload a leaf photo to get started!"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DFE7DF] text-[#65746A] bg-[#F2F6F2]/60 text-[11px]">
                <th className="py-2.5 px-3 font-semibold w-10">#</th>
                <th className="py-2.5 px-3 font-semibold w-16">Leaf</th>
                <th className="py-2.5 px-3 font-semibold">Plant</th>
                <th className="py-2.5 px-3 font-semibold">Diagnosis</th>
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
                    className="hover:bg-[#F8FAF8] transition-colors group cursor-pointer"
                    onClick={() => handleInspect(item)}
                  >
                    <td className="py-2.5 px-3 text-[#92A096] font-mono text-[11px]">
                      {index + 1}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="h-9 w-9 rounded-lg overflow-hidden border border-[#DFE7DF] bg-[#F2F6F2] flex items-center justify-center shrink-0">
                        {imgUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={imgUrl}
                            alt={item.plant}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] text-[#92A096]">N/A</span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-[#17261E]">
                      {item.plant}
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isHealthy
                            ? "bg-[#E8F3E8] text-[#25834A] border-[#C8E6C9]"
                            : "bg-[#FEE2E2] text-[#DC4545] border-[#FECACA]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isHealthy ? "bg-[#25834A]" : "bg-[#DC4545]"
                          }`}
                        />
                        {item.disease}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#E8F0EA] h-1.5 rounded-full overflow-hidden shrink-0">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.confidence >= 85
                                ? "bg-[#176B3A]"
                                : item.confidence >= 65
                                ? "bg-[#D97706]"
                                : "bg-[#DC4545]"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(item.confidence, 5))}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[#17261E] text-[11px] tabular-nums">
                          {item.confidence.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-[#65746A] text-[11px] whitespace-nowrap">
                      {formatTimestamp(item.timestamp)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleInspect(item)}
                          className="p-1 rounded-md text-[#176B3A] hover:bg-[#E8F3E8] transition"
                          title="View analysis & Grad-CAM"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {onDeleteItem && (
                          <button
                            type="button"
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1 rounded-md text-[#DC4545] hover:bg-[#FEE2E2] transition opacity-60 group-hover:opacity-100"
                            title="Delete record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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
