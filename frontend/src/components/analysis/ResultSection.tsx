"use client";

import React, { useState } from "react";
import { Sprout, ScanEye, FileText, Lightbulb, CheckCircle2, AlertTriangle, Info, Maximize2, X } from "lucide-react";
import { getFullImageUrl } from "../../lib/utils";
import type { PredictionResult } from "../../types/analysis";

interface ResultSectionProps {
  result: PredictionResult;
  onAnalyzeAnother?: () => void;
  onViewHistory?: () => void;
}

export function ResultSection({ result }: ResultSectionProps) {
  const [activeCamMode, setActiveCamMode] = useState<"overlay" | "heatmap">("overlay");
  const [expandedImage, setExpandedImage] = useState<{ url: string; title: string } | null>(null);

  const plantName =
    typeof result.plant === "object" && result.plant ? result.plant.name : result.plant || "Unknown Plant";
  const diseaseName = result.prediction?.disease || result.disease || "Unknown Condition";
  const scientificName =
    result.prediction?.scientific_name || result.pathogen || result.disease_info?.pathogen || "Botanical pathogen";

  const originalUrl = getFullImageUrl(result.image?.url || result.image_url) || "";
  const gradcamUrl = getFullImageUrl(result.gradcam?.image || result.gradcam_image) || originalUrl;
  const heatmapUrl = getFullImageUrl(result.gradcam?.heatmap || result.heatmap_image) || gradcamUrl;

  const isHealthy = diseaseName.toLowerCase().includes("healthy");
  const rawConf = result.prediction?.confidence ?? result.confidence ?? 0;
  const confFormatted = rawConf.toFixed(1);

  // Requirement 8 thresholds: >=85% High, 65-84.9% Moderate, 50-64.9% Low, <50% Uncertain
  const isHigh = rawConf >= 85;
  const isModerate = rawConf >= 65 && rawConf < 85;

  // SVG circular gauge
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, rawConf)) / 100) * circumference;
  const strokeColor = isHigh ? "#176B3A" : isModerate ? "#D97706" : "#DC4545";

  const descriptionText =
    result.disease_info?.description ||
    result.explanation ||
    (isHealthy
      ? "The foliage shows healthy physiological characteristics with uniform chlorophyll and no signs of foliar pathogens."
      : `Early blight is a fungal disease caused by ${scientificName}. It usually appears as dark, concentric spots on older leaves. The spots can expand and cause yellowing, leading to reduced photosynthesis and lower plant yield.`);

  const recommendationsList: string[] =
    result.recommendations && result.recommendations.length > 0
      ? result.recommendations
      : result.disease_info?.prevention && result.disease_info.prevention.length > 0
      ? result.disease_info.prevention
      : [
          "Remove infected leaves and plant debris.",
          "Ensure proper air circulation.",
          "Use a suitable fungicide (e.g., mancozeb or chlorothalonil).",
          "Avoid overhead irrigation.",
          "Practice crop rotation.",
        ];

  // Candidates for Top Predictions
  const topCandidates = (result.alternatives && result.alternatives.length > 0)
    ? result.alternatives.slice(0, 5)
    : [
        { disease: diseaseName, plant: plantName, confidence: rawConf },
      ];

  // Pathology meta attributes
  const diseaseType = isHealthy ? "Healthy Tissue" : "Fungal";
  const severityLabel = isHealthy ? "None" : rawConf >= 85 ? "Medium" : "Low";

  return (
    <div className="rounded-2xl border border-[#DFE7DF] bg-white p-5 shadow-xs space-y-4">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EBF0EB]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F3E8] text-[#176B3A] shrink-0">
            <Sprout className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#17261E]">Prediction Result</h2>
            <p className="text-[11px] text-[#65746A]">
              Model prediction and visual explanation
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
            isHealthy
              ? "bg-[#E8F3E8] text-[#25834A] border-[#C8E6C9]"
              : "bg-[#FEE2E2] text-[#DC4545] border-[#FECACA]"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isHealthy ? "bg-[#25834A]" : "bg-[#DC4545]"}`} />
          {isHealthy ? "Healthy Foliage" : "Disease Detected"}
        </span>
      </div>

      {/* 2. Top Summary Grid: Diagnosis + Gauge (Left) & Top Predictions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left Sub-card (8 cols on lg) */}
        <div className="lg:col-span-8 rounded-xl border border-[#DFE7DF] bg-[#F2F6F2]/40 p-3.5 flex flex-col sm:flex-row items-center gap-3.5">
          {/* Thumbnail */}
          <div className="h-24 w-24 rounded-xl overflow-hidden border border-[#DFE7DF] bg-[#F8FAF8] shrink-0 flex items-center justify-center p-1">
            {originalUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={originalUrl}
                alt="Leaf thumbnail"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-xs text-[#92A096]">Leaf</span>
            )}
          </div>

          {/* Diagnosis Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#E8F3E8] px-2 py-0.5 text-[10px] font-bold text-[#176B3A]">
              <Sprout className="h-3 w-3" />
              <span>{plantName} Leaf</span>
            </div>

            <h3 className={`text-xl sm:text-2xl font-black tracking-tight leading-snug truncate ${
              isHealthy ? "text-[#25834A]" : "text-[#DC4545]"
            }`}>
              {diseaseName}
            </h3>

            <p className="text-[11px] text-[#65746A] italic font-normal">
              ({scientificName})
            </p>

            <p className="text-[10px] text-[#65746A] line-clamp-2 leading-relaxed bg-[#FFFFFF]/70 p-1.5 rounded-lg border border-[#DFE7DF]/60">
              {descriptionText}
            </p>
          </div>

          {/* Circular Confidence Gauge */}
          <div className="relative flex items-center justify-center shrink-0 pr-1">
            <svg className="h-20 w-20 -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-[#DFE7DF]"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={strokeColor}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-extrabold text-[#17261E] tabular-nums leading-none">
                {confFormatted}%
              </span>
              <span className="text-[8px] text-[#65746A] font-medium mt-0.5 leading-none">
                Model<br />Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Right Sub-card: Top Predictions (4 cols on lg) */}
        <div className="lg:col-span-4 rounded-xl border border-[#DFE7DF] bg-[#F2F6F2]/40 p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-[#176B3A]">
            <Sprout className="h-3.5 w-3.5" />
            <span>Top Predictions</span>
          </div>

          <div className="space-y-1.5 flex-1 justify-center flex flex-col">
            {topCandidates.map((cand, idx) => {
              const displayLabel = cand.disease || (cand as any).class_name || "Unknown";
              const isLeading = idx === 0;

              return (
                <div key={idx} className="flex items-center justify-between text-[11px] gap-1.5">
                  <span className={`truncate max-w-[95px] flex items-center gap-1 ${
                    isLeading ? "font-bold text-[#17261E]" : "text-[#65746A]"
                  }`}>
                    <span className="text-[9px] text-[#176B3A]">▸</span>
                    <span className="truncate">{displayLabel}</span>
                  </span>

                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <div className="w-14 bg-[#DFE7DF] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isLeading ? "bg-[#176B3A]" : "bg-[#65746A]"}`}
                        style={{ width: `${Math.min(100, Math.max(cand.confidence, 1))}%` }}
                      />
                    </div>
                    <span className={`tabular-nums font-semibold w-8 text-right text-[10px] ${
                      isLeading ? "text-[#17261E]" : "text-[#65746A]"
                    }`}>
                      {cand.confidence.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Model Visualization (Grad-CAM) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#E8F3E8] text-[#176B3A]">
              <ScanEye className="h-3.5 w-3.5" />
            </div>
            <h4 className="text-xs font-bold text-[#17261E]">Model Visualization (Grad-CAM)</h4>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#F2F6F2] p-0.5 rounded-lg border border-[#DFE7DF] text-[10px]">
            <button
              type="button"
              onClick={() => setActiveCamMode("overlay")}
              className={`px-2.5 py-0.5 rounded-md font-semibold transition ${
                activeCamMode === "overlay"
                  ? "bg-[#073F28] text-white"
                  : "text-[#65746A] hover:text-[#17261E]"
              }`}
            >
              Overlay
            </button>
            <button
              type="button"
              onClick={() => setActiveCamMode("heatmap")}
              className={`px-2.5 py-0.5 rounded-md font-semibold transition ${
                activeCamMode === "heatmap"
                  ? "bg-[#073F28] text-white"
                  : "text-[#65746A] hover:text-[#17261E]"
              }`}
            >
              Heatmap Only
            </button>
          </div>
        </div>

        {/* 3-Column Arrangement: Original | Grad-CAM + Colorbar | About Grad-CAM */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
          {/* Card 1: Original Image (4 cols) - Full Size / Uncropped */}
          <div className="md:col-span-4 flex flex-col">
            <div className="relative group w-full h-[280px] sm:h-[310px] rounded-xl overflow-hidden border border-[#DFE7DF] bg-[#F8FAF8] flex items-center justify-center p-2.5 transition">
              {originalUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalUrl}
                    alt="Original Leaf"
                    className="max-h-full max-w-full w-auto h-auto object-contain mx-auto rounded-lg shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setExpandedImage({ url: originalUrl, title: "Original Leaf Image" })}
                    title="View full-size image"
                    className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 hover:bg-black text-white text-[10px] opacity-0 group-hover:opacity-100 transition"
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>Expand</span>
                  </button>
                </>
              ) : (
                <span className="text-xs text-[#92A096]">Image unavailable</span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-[#65746A] text-center mt-1.5">
              Original Leaf Image (Full View)
            </span>
          </div>

          {/* Card 2: Grad-CAM Visualization + Vertical Colorbar (4 cols) - Full Size / Uncropped */}
          <div className="md:col-span-4 flex flex-col">
            <div className="flex gap-2 items-center w-full h-[280px] sm:h-[310px]">
              <div className="relative group flex-1 h-full rounded-xl overflow-hidden border border-[#DFE7DF] bg-[#F8FAF8] flex items-center justify-center p-2.5 transition">
                {activeCamMode === "overlay" ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={gradcamUrl}
                    alt="Grad-CAM Visualization"
                    className="max-h-full max-w-full w-auto h-auto object-contain mx-auto rounded-lg shadow-2xs"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={heatmapUrl}
                    alt="Grad-CAM Heatmap"
                    className="max-h-full max-w-full w-auto h-auto object-contain mx-auto rounded-lg shadow-2xs"
                  />
                )}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedImage({
                      url: activeCamMode === "overlay" ? gradcamUrl : heatmapUrl,
                      title: activeCamMode === "overlay" ? "Grad-CAM Visualization" : "Attention Heatmap",
                    })
                  }
                  title="View full-size visualization"
                  className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 hover:bg-black text-white text-[10px] opacity-0 group-hover:opacity-100 transition"
                >
                  <Maximize2 className="h-3 w-3" />
                  <span>Expand</span>
                </button>
              </div>

              {/* Vertical Colorbar */}
              <div className="flex flex-col items-center justify-between h-[160px] text-[8px] text-[#65746A] shrink-0">
                <span className="leading-none text-[7px] font-bold text-center">High<br />influence</span>
                <div className="w-2.5 h-28 rounded-full bg-gradient-to-b from-[#DC2626] via-[#F59E0B] via-[#10B981] to-[#2563EB]" />
                <span className="leading-none text-[7px] text-center">Low<br />influence</span>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-[#65746A] text-center mt-1.5">
              {activeCamMode === "overlay" ? "Grad-CAM Visualization (Full View)" : "Attention Heatmap (Full View)"}
            </span>
          </div>

          {/* Card 3: About Grad-CAM & Lesion Metrics (4 cols) */}
          <div className="md:col-span-4 h-[280px] sm:h-[310px] rounded-xl border border-[#DFE7DF] bg-[#F2F6F2]/60 p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#17261E]">
                <Info className="h-4 w-4 text-[#176B3A]" />
                <h5>About Grad-CAM</h5>
              </div>
              <p className="text-[10px] text-[#65746A] leading-relaxed">
                Grad-CAM computes gradients at the convolutional feature maps to visually highlight the foliar patterns that governed the model&apos;s prediction.
              </p>
              <div className="text-[10px] space-y-1.5 text-[#65746A] pt-1">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#DC2626] shrink-0" />
                  <span><strong>Warm Red / Yellow:</strong> High model influence</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0" />
                  <span><strong>Cool Cyan / Blue:</strong> Low influence / baseline</span>
                </div>
              </div>
            </div>

            {/* Pathology Summary Badges */}
            <div className="pt-2 border-t border-[#DFE7DF]/70 grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/90 p-2 rounded-lg border border-[#DFE7DF]/70 shadow-2xs">
                <span className="text-[8px] text-[#92A096] uppercase font-bold block">Lesions Detected</span>
                <span className="text-xs font-bold text-[#17261E] mt-0.5 block">
                  {isHealthy ? "0 (Healthy)" : (result.gradcam?.lesions_detected ?? 1)}
                </span>
              </div>
              <div className="bg-white/90 p-2 rounded-lg border border-[#DFE7DF]/70 shadow-2xs">
                <span className="text-[8px] text-[#92A096] uppercase font-bold block">Affected Area</span>
                <span className="text-xs font-bold text-[#17261E] mt-0.5 block">
                  {isHealthy ? "0.0%" : `${(result.gradcam?.affected_area_pct ?? 0).toFixed(1)}%`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Disease Description & Suggested Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Left: Disease Description */}
        <div className="rounded-xl border border-[#DFE7DF] bg-[#F2F6F2]/40 p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#17261E]">
            <FileText className="h-4 w-4 text-[#176B3A]" />
            <h4>Disease Description</h4>
          </div>
          <p className="text-[11px] text-[#65746A] leading-relaxed">
            {descriptionText}
          </p>

          {/* 4 Metadata Badges in a Row */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px]">
            <div className="rounded-lg bg-white p-1.5 border border-[#DFE7DF] text-center">
              <p className="text-[8px] text-[#92A096] uppercase font-bold">Affected Plant</p>
              <p className="font-bold text-[#17261E] truncate mt-0.5">{plantName}</p>
            </div>
            <div className="rounded-lg bg-white p-1.5 border border-[#DFE7DF] text-center">
              <p className="text-[8px] text-[#92A096] uppercase font-bold">Pathogen</p>
              <p className="font-bold text-[#17261E] truncate mt-0.5">{scientificName.split(" ")[0]}</p>
            </div>
            <div className="rounded-lg bg-white p-1.5 border border-[#DFE7DF] text-center">
              <p className="text-[8px] text-[#92A096] uppercase font-bold">Disease Type</p>
              <p className="font-bold text-[#17261E] truncate mt-0.5">{diseaseType}</p>
            </div>
            <div className="rounded-lg bg-white p-1.5 border border-[#DFE7DF] text-center">
              <p className="text-[8px] text-[#92A096] uppercase font-bold flex items-center justify-center gap-0.5">
                <AlertTriangle className="h-2 w-2 text-[#D97706]" />
                Severity
              </p>
              <p className="font-bold text-[#D97706] truncate mt-0.5">{severityLabel}</p>
            </div>
          </div>
        </div>

        {/* Right: Suggested Action */}
        <div className="rounded-xl border border-[#DFE7DF] bg-[#F2F6F2]/40 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#17261E]">
            <Lightbulb className="h-4 w-4 text-[#176B3A]" />
            <h4>Suggested Action</h4>
          </div>
          <ul className="space-y-1.5 text-[11px] text-[#65746A]">
            {recommendationsList.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#176B3A] shrink-0 mt-0.5" />
                <span className="leading-tight">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Full Size Image Lightbox Modal */}
      {expandedImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setExpandedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs transition"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] max-w-[92vw] rounded-2xl bg-white p-4 shadow-2xl flex flex-col items-center border border-[#DFE7DF]"
          >
            <div className="flex items-center justify-between w-full pb-2.5 mb-2.5 border-b border-[#DFE7DF]">
              <h4 className="text-xs font-bold text-[#17261E]">{expandedImage.title}</h4>
              <button
                type="button"
                onClick={() => setExpandedImage(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2F6F2] hover:bg-[#E8F0EA] text-[#17261E] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={expandedImage.url}
              alt={expandedImage.title}
              className="max-h-[78vh] max-w-[88vw] object-contain rounded-xl shadow-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
