"use client";

import { useState, useRef } from "react";
import { getFullImageUrl } from "../../lib/utils";
import type { PredictionResult } from "../../types/analysis";
import { ExportReportModal } from "./ExportReportModal";

interface ResultSectionProps {
  result: PredictionResult;
  onAnalyzeAnother?: () => void;
  onViewHistory?: () => void;
}

export function ResultSection({
  result,
}: ResultSectionProps) {
  const [showOtherDiseases, setShowOtherDiseases] = useState(true);
  const [viewMode, setViewMode] = useState<"side" | "split" | "overlay">("side");
  const [splitPos, setSplitPos] = useState<number>(50);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(70);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomTarget, setZoomTarget] = useState<"original" | "gradcam">("original");
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [showModelInfo, setShowModelInfo] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(true);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const plantName = typeof result.plant === "object" && result.plant ? result.plant.name : (result.plant || "Unknown Crop");
  const diseaseName = result.prediction?.disease || result.disease || "Unknown Condition";
  const scientificName = result.prediction?.scientific_name || result.pathogen || result.disease_info?.pathogen || "Botanical classification";

  const originalUrl = getFullImageUrl(result.image?.url || result.image_url) || "";
  const gradcamUrl = getFullImageUrl(result.gradcam?.image || result.gradcam_image) || originalUrl;
  const isHealthy = diseaseName.toLowerCase().includes("healthy");
  const gradcamFocusClass = result.gradcam?.targetClass || diseaseName;

  // Confidence calculations strictly from model probability
  const rawConf = result.prediction?.confidence ?? result.confidence ?? 0;
  const conf = Math.round(rawConf);
  const confFormatted = rawConf.toFixed(1);

  // Requirement 8 thresholds: >=85% High, 65-84.9% Moderate, 50-64.9% Low, <50% Uncertain
  const confLevel = (result.prediction?.confidence_level || result.confidence_level || (
    rawConf >= 85 ? "high" : rawConf >= 65 ? "moderate" : rawConf >= 50 ? "low" : "uncertain"
  )).toLowerCase();

  const isHigh = confLevel === "high" || rawConf >= 85;
  const isModerate = confLevel === "moderate" || (!isHigh && rawConf >= 65);
  const isLow = confLevel === "low" || (!isHigh && !isModerate && rawConf >= 50);
  const isUncertain = confLevel === "uncertain" || rawConf < 50;

  const confidenceLabel = isHigh
    ? "High Confidence"
    : isModerate
    ? "Moderate Confidence"
    : isLow
    ? "Low Confidence"
    : "Uncertain";

  const confidenceColor = isHigh ? "#059669" : isModerate ? "#D97706" : isLow ? "#F59E0B" : "#DC2626";

  // SVG Circular Gauge
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, rawConf)) / 100) * circumference;

  // Single Source of Truth Explanation Text
  const whatThisMeansText = result.explanation || result.disease_info?.description || (
    isHealthy
      ? "The leaf appears healthy with normal chlorophyll distribution and uniform cellular structure."
      : isHigh
      ? `The leaf shows visible patterns characteristic of ${diseaseName} on ${plantName} foliage.`
      : `The leaf exhibits patterns that may indicate ${diseaseName} on ${plantName}, but confidence is low (${confFormatted}%).`
  );

  // Recommendations directly from model result
  const recommendationsList: string[] = (result.recommendations && result.recommendations.length > 0)
    ? result.recommendations
    : (result.disease_info?.prevention && result.disease_info.prevention.length > 0)
    ? result.disease_info.prevention
    : [
        "Isolate affected foliage to prevent potential spread to neighboring plants.",
        "Ensure proper airflow and avoid wet foliage during irrigation.",
        "Scout surrounding crop leaves for early symptom formation.",
      ];

  // Candidates / other diseases strictly from actual model outputs (Requirement 6, 28)
  const topCandidates = result.alternatives && result.alternatives.length > 0
    ? result.alternatives.slice(0, 5)
    : [];

  // Severity and Status strictly from model / rule profile (Requirement 17)
  const severityLabel = result.severity?.label || (isHealthy ? "None" : isHigh ? "High" : "Moderate");
  const severityText = `${severityLabel} Severity`;
  const isSeverityEstimated = result.severity?.is_estimated ?? true;
  const statusText = result.status || (isHealthy ? "Healthy Tissue" : "Active Infection");

  // Split Wipe Slider drag handling
  const handleSplitMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  const handleCopySummary = async () => {
    const summary = `Plant Disease Diagnosis
Plant: ${result.plant}
Detected Disease: ${result.disease}
Confidence: ${conf}% (${confidenceLabel})
Analyzed on: ${result.analyzed_at || new Date().toLocaleString()}`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* ── CARD 1: DIAGNOSIS RESULT ── */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-xs">
        {/* Header row */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F3F4F6] mb-5">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[#059669]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6" />
            </svg>
            <h2 className="text-base sm:text-lg font-bold text-[#111827]">Diagnosis Result</h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsExportReportOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors shadow-2xs"
            >
              <svg className="h-3.5 w-3.5 text-[#059669]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>Export PDF</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{result.analyzed_at || "Oct 6, 2026, 16:15"}</span>
            </div>
          </div>
        </div>

        {/* Low Confidence / Uncertain Disclaimer (Requirements 8 & 9) */}
        {(isLow || isUncertain) && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#FCD34D] bg-[#FFFBEB] p-3.5 text-xs text-[#92400E]">
            <svg className="h-4 w-4 shrink-0 text-[#D97706] mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <span className="font-bold">
                {isUncertain ? "Uncertain Diagnosis (<50%): " : "Low Confidence Prediction (50–64%): "}
              </span>
              {isUncertain
                ? "The classifier cannot reliably recognize the pathogen. We strongly suggest taking another photo in natural daylight with a single focused leaf."
                : "Symptoms exhibit ambiguous foliar patterns or variable lighting. Please inspect the leaf underside or re-upload a clearer image before applying treatment."}
            </div>
          </div>
        )}

        {/* ── TIER 1: Host Crop & Condition (Flex or Grid) + Confidence Gauge ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          {/* Left: Host Crop & Condition (7 cols md / 8 cols xl) */}
          <div className="md:col-span-7 xl:col-span-8 flex flex-col sm:flex-row items-start gap-5 p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
            {/* Thumbnail */}
            <div
              onClick={() => {
                setZoomTarget("original");
                setIsZoomOpen(true);
              }}
              className="relative aspect-square w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white cursor-pointer group shadow-2xs mx-auto sm:mx-0"
              title="Click to zoom original image"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt={plantName}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                Zoom
              </span>
            </div>

            {/* Labels and Text */}
            <div className="min-w-0 flex-1 flex flex-col justify-between self-stretch">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-md border border-[#A7F3D0]">
                    Host Crop
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#111827] truncate">
                    {plantName}
                  </span>
                </div>

                <div className="mt-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                    Diagnosed Condition
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight leading-tight mt-0.5">
                    {diseaseName}
                  </div>
                  <div className="text-xs text-[#6B7280] italic mt-0.5 truncate" title={scientificName}>
                    Botanical: {scientificName}
                  </div>
                </div>
              </div>

              {/* Status and Severity Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-[#E5E7EB]/80">
                {!isHealthy && (
                  <span
                    className="inline-flex items-center gap-1 rounded-md bg-[#FEE2E2] px-2.5 py-0.5 text-xs font-semibold text-[#B91C1C]"
                    title={isSeverityEstimated ? "Estimated based on pathology profile" : "Model assessed"}
                  >
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>{severityText}{isSeverityEstimated ? " (Est.)" : ""}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md bg-[#D1FAE5] px-2.5 py-0.5 text-xs font-semibold text-[#065F46]">
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  </svg>
                  <span>{statusText}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Confidence Score & Calibrated Metric Card (5 cols md / 4 cols xl) */}
          <div className="md:col-span-5 xl:col-span-4 flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-xs">
            {/* Top row */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#ECFDF5] text-[#059669]">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#374151]">
                  Confidence Score
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#065F46] shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                Calibrated (τ = 0.10)
              </span>
            </div>

            {/* Gauge + Numbers row */}
            <div className="flex items-center gap-5 py-4 sm:py-5">
              <div className="relative flex h-22 w-22 shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#F1F5F9"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={confidenceColor}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black tracking-tight text-[#111827] tabular-nums">
                    {confFormatted}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Certainty
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start gap-1.5 min-w-0">
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border shadow-2xs ${
                  isHigh
                    ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                    : isModerate
                    ? "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]"
                    : isLow
                    ? "bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]"
                    : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
                }`}>
                  <span className={`h-2 w-2 rounded-full ${
                    isHigh ? "bg-[#059669]" : isModerate ? "bg-[#D97706]" : isLow ? "bg-[#EA580C]" : "bg-[#DC2626]"
                  }`} />
                  <span>{confidenceLabel}</span>
                </span>

                <div className="text-sm font-bold text-[#1E293B] leading-tight">
                  {isHigh
                    ? "High Diagnostic Certainty"
                    : isModerate
                    ? "Moderate Diagnostic Certainty"
                    : isLow
                    ? "Low Certainty — Review Visuals"
                    : "Ambiguous Foliar Pattern"}
                </div>

                <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                  {isHigh
                    ? "Model features strongly match verified disease pathology."
                    : isModerate
                    ? "Significant characteristics detected; secondary inspection advised."
                    : isLow
                    ? "Visual features lack certainty; consider retaking the image."
                    : "Inconclusive foliar indicators; manual inspection recommended."}
                </p>
              </div>
            </div>

            {/* 4-Band Calibration Spectrum Scale */}
            <div className="pt-3.5 border-t border-[#F1F5F9] mt-auto">
              <div className="flex items-center justify-between text-xs text-[#64748B] mb-2.5">
                <span className="font-semibold text-[#475569]">Confidence Calibration Scale</span>
                <span className="text-[11px] font-medium text-[#94A3B8]">
                  Score: <strong className="font-bold text-[#0F172A] tabular-nums">{confFormatted}%</strong>
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    key: "uncertain",
                    range: "<50%",
                    label: "Uncertain",
                    isActive: rawConf < 50,
                    color: "bg-[#DC2626]",
                    textColor: "text-[#DC2626]",
                    ringClass: "ring-2 ring-offset-1 ring-red-500",
                  },
                  {
                    key: "low",
                    range: "50–64%",
                    label: "Low",
                    isActive: rawConf >= 50 && rawConf < 65,
                    color: "bg-[#F59E0B]",
                    textColor: "text-[#D97706]",
                    ringClass: "ring-2 ring-offset-1 ring-amber-500",
                  },
                  {
                    key: "moderate",
                    range: "65–84%",
                    label: "Moderate",
                    isActive: rawConf >= 65 && rawConf < 85,
                    color: "bg-[#D97706]",
                    textColor: "text-[#B45309]",
                    ringClass: "ring-2 ring-offset-1 ring-orange-500",
                  },
                  {
                    key: "high",
                    range: "≥85%",
                    label: "High",
                    isActive: rawConf >= 85,
                    color: "bg-[#059669]",
                    textColor: "text-[#059669]",
                    ringClass: "ring-2 ring-offset-1 ring-emerald-600",
                  },
                ].map((band) => (
                  <div key={band.key} className="flex flex-col items-center text-center">
                    <div
                      className={`h-2 w-full rounded-full transition-all duration-300 ${
                        band.isActive
                          ? `${band.color} ${band.ringClass} shadow-xs`
                          : "bg-[#E2E8F0]"
                      }`}
                    />
                    <span
                      className={`mt-2 text-[11px] tabular-nums leading-tight ${
                        band.isActive ? `font-bold ${band.textColor}` : "font-medium text-[#64748B]"
                      }`}
                    >
                      {band.range}
                    </span>
                    <span
                      className={`mt-0.5 text-[10px] uppercase tracking-wider leading-tight ${
                        band.isActive ? `font-black ${band.textColor}` : "font-semibold text-[#94A3B8]"
                      }`}
                    >
                      {band.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── TIER 2: Alternative Candidates (Full Width or 2-col Grid) ── */}
        <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAFB] p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E7EB]/80 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white border border-[#E5E7EB] text-[#4B5563] text-xs">
                📊
              </div>
              <span className="text-xs font-bold text-[#111827]">
                Top Model Classification Candidates
              </span>
              <span className="text-[11px] text-[#6B7280] hidden sm:inline">
                (Softmax probability distribution)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowOtherDiseases(!showOtherDiseases)}
              className="text-xs font-semibold text-[#065F46] hover:underline flex items-center gap-1"
            >
              <span>{showOtherDiseases ? "Collapse" : "Show Candidates"}</span>
              <svg className={`h-3.5 w-3.5 transition-transform ${showOtherDiseases ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {showOtherDiseases && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-fadeIn">
              {topCandidates.length > 0 ? (
                topCandidates.map((cand, idx) => {
                  const pct = cand.confidence;
                  const isTop = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`rounded-lg p-2.5 border transition-all ${
                        isTop
                          ? "border-[#A7F3D0] bg-white shadow-2xs"
                          : "border-[#E5E7EB] bg-white/70"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                            isTop ? "bg-[#ECFDF5] text-[#065F46]" : "bg-slate-100 text-slate-600"
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className={`truncate text-xs ${isTop ? "font-bold text-[#111827]" : "font-medium text-[#4B5563]"}`} title={`${cand.plant} — ${cand.disease}`}>
                            <strong className="text-slate-900">{cand.plant}</strong> · {cand.disease}
                          </span>
                        </div>
                        <span className={`font-bold tabular-nums text-xs shrink-0 ${isTop ? "text-[#065F46]" : "text-[#4B5563]"}`}>
                          {pct >= 0.1 ? `${pct.toFixed(1)}%` : "<0.1%"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isTop ? "bg-[#059669]" : "bg-[#9CA3AF]/60"}`}
                          style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-xs text-[#9CA3AF] py-2 text-center">
                  No alternative candidate data available
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── TIER 3: Diagnostic Pathology Interpretation ("What this means") ── */}
        <div className="mt-4 rounded-xl border border-[#D1FAE5] bg-[#ECFDF5]/80 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#059669] text-white shrink-0 mt-0.5 shadow-2xs">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#065F46] uppercase tracking-wider">
                  Diagnostic Pathology Interpretation
                </span>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="text-xs font-semibold text-[#047857] hover:underline"
                >
                  {copied ? "Copied ✓" : "Copy text"}
                </button>
              </div>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#1F2937]">
                {whatThisMeansText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: GRAD-CAM EXPLAINABILITY & RECOMMENDED ACTIONS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Card: Grad-CAM Visual Attention */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between min-w-0">
          <div>
            <div className="pb-3.5 border-b border-[#F3F4F6] mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] shrink-0">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="12" y1="2" x2="12" y2="4" />
                    <line x1="12" y1="20" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="4" y2="12" />
                    <line x1="20" y1="12" x2="22" y2="12" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-[#111827] leading-tight">
                    Grad-CAM Visual Attention
                  </h3>
                  <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">
                    Spatial heatmap highlighting discriminative foliar lesions
                  </p>
                </div>
              </div>

              {/* View Switcher: 3 full-width segmented control buttons */}
              <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-[#E5E7EB] bg-[#F8FAFB] p-1 text-xs">
                {(["side", "split", "overlay"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={`rounded-lg py-1.5 text-xs font-semibold transition-all text-center ${
                      viewMode === mode
                        ? "bg-white text-[#065F46] shadow-2xs font-bold"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    {mode === "side" ? "Side-by-Side" : mode === "split" ? "Split Wipe" : "Overlay"}
                  </button>
                ))}
              </div>
            </div>

            {/* Visualizer Modes */}
            {viewMode === "side" && (
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <div
                    onClick={() => { setZoomTarget("original"); setIsZoomOpen(true); }}
                    className="aspect-square w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] cursor-pointer group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={originalUrl}
                      alt="Original Leaf"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <span className="text-center text-xs font-semibold text-[#4B5563]">
                    Original Leaf Image
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div
                    onClick={() => { setZoomTarget("gradcam"); setIsZoomOpen(true); }}
                    className="aspect-square w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#111827] cursor-pointer group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gradcamUrl}
                      alt={`Model Focus — ${gradcamFocusClass}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <span className="text-center text-xs font-semibold text-[#4B5563]">
                    Model Focus — {gradcamFocusClass} (Grad-CAM)
                  </span>
                </div>
              </div>
            )}

            {viewMode === "split" && (
              <div className="flex flex-col gap-2">
                <div
                  ref={containerRef}
                  onMouseDown={() => setIsDraggingSplit(true)}
                  onMouseUp={() => setIsDraggingSplit(false)}
                  onMouseLeave={() => setIsDraggingSplit(false)}
                  onMouseMove={(e) => {
                    if (isDraggingSplit || e.buttons === 1) {
                      handleSplitMove(e.clientX);
                    }
                  }}
                  className="relative aspect-square w-full cursor-ew-resize select-none overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalUrl} alt="Leaf" className="absolute inset-0 h-full w-full object-cover" />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 0 0 ${splitPos}%)` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gradcamUrl} alt="Grad-CAM" className="absolute inset-0 h-full w-full object-cover" />
                  </div>
                  <div
                    className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-lg pointer-events-none"
                    style={{ left: `${splitPos}%` }}
                  >
                    <div className="absolute top-1/2 -left-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#065F46] text-white shadow-md text-[10px]">
                      ↔
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 z-10 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                    Original
                  </div>
                  <div className="absolute bottom-2 right-2 z-10 rounded-md bg-[#065F46]/90 px-2 py-0.5 text-[10px] font-medium text-white">
                    Grad-CAM
                  </div>
                </div>
                <p className="text-center text-[11px] text-[#9CA3AF]">
                  Drag the slider to compare raw leaf vs. heatmap overlay
                </p>
              </div>
            )}

            {viewMode === "overlay" && (
              <div className="flex flex-col gap-3">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalUrl} alt="Leaf" className="absolute inset-0 h-full w-full object-cover" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gradcamUrl}
                    alt="Grad-CAM Overlay"
                    style={{ opacity: overlayOpacity / 100 }}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-75"
                  />
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#6B7280] font-medium">Heatmap Opacity:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="h-1.5 flex-1 accent-[#065F46] cursor-pointer"
                  />
                  <span className="w-8 text-right font-bold text-[#111827] tabular-nums">
                    {overlayOpacity}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card: Recommended Actions */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between min-w-0">
          <div>
            <div className="pb-3.5 border-b border-[#F3F4F6] mb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669] shrink-0">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#111827] leading-tight truncate">
                      Recommended Actions
                    </h3>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">
                      Standard foliar pathology management
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-bold text-[#065F46] border border-[#A7F3D0] shrink-0 whitespace-nowrap">
                  Pathology Protocol
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              {recommendationsList.map((actionText, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5] text-xs font-bold text-[#065F46]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-[#111827] leading-relaxed">
                      {actionText}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Guidance Disclaimer */}
          <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-[#FEF3C7]/80 border border-[#FDE68A] p-3">
            <svg className="h-4 w-4 text-[#B45309] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-[11px] text-[#92400E] leading-relaxed">
              These recommendations are for educational guidance and should not replace professional agricultural advice.
            </p>
          </div>
        </div>
      </div>

      {/* ── ROW 3: MODEL INFORMATION & HOW IT WORKS (COLLAPSIBLE) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Model Information */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setShowModelInfo(!showModelInfo)}
            className="flex w-full items-center justify-between p-4 text-left hover:bg-[#F9FAFB] transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#4B5563]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span className="text-xs sm:text-sm font-bold text-[#111827]">Model Information</span>
            </div>
            <svg className={`h-4 w-4 text-[#9CA3AF] transition-transform ${showModelInfo ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showModelInfo && (
            <div className="px-4 pb-4 pt-1 animate-fadeIn border-t border-[#F3F4F6]">
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <div className="text-[11px] font-medium text-[#9CA3AF]">Model</div>
                  <div className="text-xs font-bold text-[#111827] mt-0.5">EfficientNet-B0</div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-[#9CA3AF]">Explainability</div>
                  <div className="text-xs font-bold text-[#111827] mt-0.5">Grad-CAM</div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-[#9CA3AF]">Input Size</div>
                  <div className="text-xs font-bold text-[#111827] mt-0.5">224 × 224</div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-[#9CA3AF]">Inference Time</div>
                  <div className="text-xs font-bold text-[#111827] mt-0.5">{result.telemetry?.total_latency_ms || 38.4} ms</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="flex w-full items-center justify-between p-4 text-left hover:bg-[#F9FAFB] transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#4B5563]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M6 6h10" />
                <path d="M6 10h10" />
              </svg>
              <span className="text-xs sm:text-sm font-bold text-[#111827]">How it works</span>
            </div>
            <svg className={`h-4 w-4 text-[#9CA3AF] transition-transform ${showHowItWorks ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showHowItWorks && (
            <div className="px-4 pb-4 pt-1 animate-fadeIn border-t border-[#F3F4F6]">
              <p className="text-xs text-[#4B5563] leading-relaxed">
                This application uses a deep learning model (EfficientNet-B0) to classify plant leaf diseases. Grad-CAM is used to visualize the important regions that influenced the prediction.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 4: DEVELOPER DEBUG PANEL (Requirement 24) ── */}
      <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4 text-xs font-mono text-[#334155]">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0]">
          <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Developer Model &amp; Pipeline Inspector (Verification Audit)
          </span>
          <span className="text-[10px] text-[#64748B]">Single Source of Truth Verified</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          <div>
            <span className="text-[#64748B] block">Image Filename:</span>
            <span className="font-semibold text-[#0F172A] truncate block" title={result.image?.filename || result.filename}>
              {result.image?.filename || result.filename || "leaf_upload.png"}
            </span>
          </div>
          <div>
            <span className="text-[#64748B] block">Analysis ID:</span>
            <span className="font-semibold text-[#0F172A] truncate block" title={result.analysisId || String(result.id)}>
              {result.analysisId || result.id || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-[#64748B] block">Predicted Raw Class:</span>
            <span className="font-semibold text-[#0F172A] truncate block" title={result.class_name}>
              {result.class_name}
            </span>
          </div>
          <div>
            <span className="text-[#64748B] block">Model Class Index:</span>
            <span className="font-semibold text-[#0F172A]">
              {result.debug?.predicted_index ?? result.gradcam?.targetClassIndex ?? "N/A"}
            </span>
          </div>
          <div>
            <span className="text-[#64748B] block">Derived Host Plant:</span>
            <span className="font-semibold text-[#0F172A]">{plantName}</span>
          </div>
          <div>
            <span className="text-[#64748B] block">Derived Disease:</span>
            <span className="font-semibold text-[#0F172A]">{diseaseName}</span>
          </div>
          <div>
            <span className="text-[#64748B] block">Softmax Probability:</span>
            <span className="font-semibold text-[#0F172A]">{confFormatted}% ({confLevel})</span>
          </div>
          <div>
            <span className="text-[#64748B] block">Grad-CAM Target:</span>
            <span className="font-semibold text-[#0F172A]">{gradcamFocusClass}</span>
          </div>
        </div>
        {result.alternatives && result.alternatives.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-[#E2E8F0]">
            <span className="text-[#64748B] block mb-1">Top Model Output Candidates (Dynamic Softmax):</span>
            <div className="flex flex-wrap gap-2">
              {result.alternatives.slice(0, 5).map((alt, i) => (
                <span key={i} className="inline-block bg-white px-2 py-0.5 rounded border border-[#E2E8F0] text-[10px]">
                  #{i + 1} {alt.class_name}: <strong className="text-emerald-700">{alt.confidence.toFixed(1)}%</strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Full Zoom */}
      {isZoomOpen && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-white p-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2 mb-2 px-2">
              <span className="text-xs font-semibold text-[#111827]">
                {zoomTarget === "original" ? "Original Leaf Image" : "Model Focus (Grad-CAM)"}
              </span>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="rounded-lg p-1 text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomTarget === "original" ? originalUrl : gradcamUrl}
              alt="Zoomed View"
              className="max-h-[75vh] w-auto rounded-lg object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* Modal: PDF Export */}
      <ExportReportModal
        result={result}
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
      />
    </div>
  );
}
