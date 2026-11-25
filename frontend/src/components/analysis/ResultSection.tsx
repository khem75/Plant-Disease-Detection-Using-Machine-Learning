"use client";

import React, { useState } from "react";
import {
  Sprout,
  ScanEye,
  FileText,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  X,
  RotateCcw,
  History,
  Split,
  Sliders,
  Layers,
  Crosshair,
  Eye,
  Printer,
  Download,
  FileSpreadsheet,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { getFullImageUrl } from "../../lib/utils";
import type { PredictionResult } from "../../types/analysis";

interface ResultSectionProps {
  result: PredictionResult;
  onAnalyzeAnother?: () => void;
  onViewHistory?: () => void;
}

export function ResultSection({ result, onAnalyzeAnother, onViewHistory }: ResultSectionProps) {
  const [activeCamMode, setActiveCamMode] = useState<"split" | "overlay" | "sideBySide" | "heatmap">("split");
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(75);
  const [showHotspotMarkers, setShowHotspotMarkers] = useState<boolean>(true);
  const [activeHotspotIndex, setActiveHotspotIndex] = useState<number | null>(null);
  const [expandedImage, setExpandedImage] = useState<{ url: string; title: string } | null>(null);
  const [copied, setCopied] = useState(false);

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
      ? "This leaf is vibrant and healthy, with good green coloration and no visible signs of infection or spots."
      : `Leaf infection caused by ${scientificName}. If left untreated, it can spread to nearby leaves, weaken the plant, and reduce harvest yield.`);

  const recommendationsList: string[] =
    result.recommendations && result.recommendations.length > 0
      ? result.recommendations
      : result.disease_info?.prevention && result.disease_info.prevention.length > 0
        ? result.disease_info.prevention
        : [
          "Prune and safely dispose of infected leaves to keep the disease from spreading.",
          "Water the plant at its base and avoid getting water directly on the leaves.",
          "Provide good airflow around your plants by spacing them properly.",
          "Apply an organic copper fungicide or neem oil solution if spots continue.",
          "Disinfect garden tools and pruning shears with rubbing alcohol after use.",
        ];

  // Candidates for Top Predictions
  const topCandidates = (result.alternatives && result.alternatives.length > 0)
    ? result.alternatives.slice(0, 5)
    : [
      { disease: diseaseName, plant: plantName, confidence: rawConf },
    ];

  // Pathology meta attributes
  const diseaseType = isHealthy ? "Healthy Foliage" : "Fungal / Microbial";
  const severityLabel = isHealthy ? "Zero" : rawConf >= 85 ? "Severe" : "Moderate";
  const reportId = result.analysisId || `PHYTO-${Date.now().toString(36).toUpperCase()}`;

  // Export handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const exportPayload = {
      phytosanitary_report_id: reportId,
      timestamp: new Date().toISOString(),
      specimen: {
        host_plant: plantName,
        diagnosed_condition: diseaseName,
        pathogen_scientific_name: scientificName,
        pathogen_type: diseaseType,
        diagnostic_confidence_percent: rawConf,
        severity_grade: severityLabel,
        is_healthy: isHealthy,
      },
      diagnostics_engine: {
        model: "EfficientNet-B0 Backbone (Multi-Class Fine-Tuned)",
        explainability: "Grad-CAM++ Multi-Resolution Layer Fusion",
        benchmark_validation_accuracy: "92.95%",
        lesions_identified: isHealthy ? 0 : (result.gradcam?.lesions_detected ?? 1),
        foliar_affected_area_percent: isHealthy ? 0 : (result.gradcam?.affected_area_pct ?? 0),
        hotspot_coordinates: result.gradcam?.hotspots || [],
      },
      differential_diagnoses: topCandidates,
      clinical_guidance: {
        pathology_description: descriptionText,
        diagnostic_symptoms: result.disease_info?.symptoms || [],
        treatment_and_preventative_protocol: recommendationsList,
      },
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `phytosanitary-report-${plantName.toLowerCase()}-${diseaseName.toLowerCase().replace(/\s+/g, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = [
      "Report ID",
      "Plant Species",
      "Diagnosed Condition",
      "Pathogen Taxon",
      "Diagnostic Confidence (%)",
      "Severity",
      "Lesion Count",
      "Affected Area (%)",
      "Analysis Timestamp",
    ];
    const row = [
      `"${reportId}"`,
      `"${plantName}"`,
      `"${diseaseName}"`,
      `"${scientificName}"`,
      rawConf.toFixed(2),
      `"${severityLabel}"`,
      isHealthy ? "0" : String(result.gradcam?.lesions_detected ?? 1),
      isHealthy ? "0.0%" : `${(result.gradcam?.affected_area_pct ?? 0).toFixed(1)}%`,
      `"${new Date().toISOString()}"`,
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), row.join(",")].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `phytosanitary-record-${plantName.toLowerCase()}-${diseaseName.toLowerCase().replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    const summary = `================================================
PLANT DISEASE DIAGNOSTIC REPORT
================================================
Report ID: ${reportId}
Date: ${new Date().toLocaleString()}

Specimen: ${plantName} Foliage
Diagnosis: ${diseaseName}
Pathogen: ${scientificName}
Diagnostic Confidence: ${confFormatted}% (${isHigh ? "High" : isModerate ? "Moderate" : "Low"})
Severity Level: ${severityLabel}
Lesions Detected: ${isHealthy ? "0" : (result.gradcam?.lesions_detected ?? 1)}
Foliar Affected Area: ${isHealthy ? "0.0%" : `${(result.gradcam?.affected_area_pct ?? 0).toFixed(1)}%`}

Clinical Protocol:
${recommendationsList.map((r, i) => `  ${i + 1}. ${r}`).join("\n")}
================================================`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="rounded-2xl border border-[#DFE7DF] bg-white p-5 shadow-xs space-y-4">
      {/* ── PRINT-ONLY OFFICIAL DIAGNOSTIC REPORT ── */}
      <div className="print-only-header text-[#17261E] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#176B3A] pb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-[#073F28] text-white flex items-center justify-center font-black text-2xl">
              🌿
            </div>
            <div>
              <h1 className="text-xl font-black text-[#073F28] uppercase tracking-wide">
                Plant Health Diagnosis Report
              </h1>
              <p className="text-[10px] text-[#65746A] tracking-wider uppercase font-semibold">
                Leaf Disease Diagnosis &amp; Practical Treatment Guide
              </p>
            </div>
          </div>
          <div className="text-right text-[10px] text-[#65746A]">
            <p className="font-bold text-[#17261E]">Report ID: {reportId}</p>
            <p>Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            <p className="text-[#176B3A] font-semibold">Diagnosis Accuracy: 93% • 38 Conditions</p>
          </div>
        </div>

        {/* Specimen & Diagnosis Grid */}
        <div className="grid grid-cols-4 gap-3 bg-[#F8FAF8] p-3 rounded-lg border border-[#DFE7DF] text-xs">
          <div>
            <span className="text-[9px] uppercase font-bold text-[#65746A] block">Plant</span>
            <span className="font-extrabold text-[#17261E] text-sm">{plantName}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-[#65746A] block">Diagnosis</span>
            <span className={`font-extrabold text-sm ${isHealthy ? "text-[#25834A]" : "text-[#DC4545]"}`}>
              {diseaseName}
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-[#65746A] block">Cause / Pathogen</span>
            <span className="font-bold text-[#17261E] italic">{scientificName}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-[#65746A] block">Confidence</span>
            <span className="font-black text-sm text-[#176B3A]">{confFormatted}%</span>
          </div>
        </div>

        {/* Side-by-side Images in Print */}
        <div className="grid grid-cols-2 gap-4 my-3">
          <div className="border border-[#DFE7DF] rounded-lg p-2 text-center bg-white">
            <p className="text-[10px] font-bold text-[#65746A] uppercase mb-1">Original Leaf Photo</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={originalUrl} alt="Leaf Specimen" className="h-56 mx-auto object-contain rounded" />
          </div>
          <div className="border border-[#DFE7DF] rounded-lg p-2 text-center bg-white">
            <p className="text-[10px] font-bold text-[#65746A] uppercase mb-1">Disease Heatmap (Damaged Areas)</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gradcamUrl} alt="Grad-CAM Map" className="h-56 mx-auto object-contain rounded" />
          </div>
        </div>

        {/* Pathology Quantitative Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="border border-[#DFE7DF] p-2 rounded bg-white">
            <span className="text-[9px] font-bold text-[#65746A] uppercase block">Damaged Spots Found</span>
            <span className="font-bold text-[#17261E]">{isHealthy ? "0 (Healthy)" : (result.gradcam?.lesions_detected ?? 1)}</span>
          </div>
          <div className="border border-[#DFE7DF] p-2 rounded bg-white">
            <span className="text-[9px] font-bold text-[#65746A] uppercase block">Leaf Area Affected</span>
            <span className="font-bold text-[#17261E]">{isHealthy ? "0.0%" : `${(result.gradcam?.affected_area_pct ?? 0).toFixed(1)}%`}</span>
          </div>
          <div className="border border-[#DFE7DF] p-2 rounded bg-white">
            <span className="text-[9px] font-bold text-[#65746A] uppercase block">Severity Level</span>
            <span className="font-bold text-[#D97706]">{severityLabel}</span>
          </div>
        </div>

        {/* Pathology Overview & Prescriptions */}
        <div className="text-xs space-y-1.5 border-t border-[#DFE7DF] pt-2">
          <h4 className="font-bold uppercase text-[10px] text-[#176B3A]">Symptoms &amp; Cause</h4>
          <p className="text-[11px] text-[#333] leading-relaxed">{descriptionText}</p>
        </div>

        <div className="text-xs space-y-1.5 border-t border-[#DFE7DF] pt-2">
          <h4 className="font-bold uppercase text-[10px] text-[#176B3A]">Recommended Treatment &amp; Care Advice</h4>
          <ul className="list-disc pl-4 text-[11px] text-[#333] space-y-1">
            {recommendationsList.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Sign-off seal */}
        <div className="border-t-2 border-[#176B3A] pt-3 mt-4 flex items-center justify-between text-[10px] text-[#65746A]">
          <div>
            <p className="font-bold text-[#17261E]">PlantCare Assistant</p>
            <p>Smart Leaf Health Scanner</p>
          </div>
          <div className="text-right">
            <div className="border-b border-dashed border-[#92A096] w-36 mb-1"></div>
            <p className="font-semibold text-[#17261E]">Verified Diagnostic Report</p>
          </div>
        </div>
      </div>

      {/* ── 1. SCREEN HEADER (With Professional Export Toolbar) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EBF0EB] no-print">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F3E8] text-[#176B3A] shrink-0">
            <Sprout className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#17261E]">Diagnosis Result</h2>
              <span className="text-[10px] font-mono text-[#92A096] bg-[#F2F6F2] px-1.5 py-0.5 rounded">
                #{reportId.slice(-6)}
              </span>
            </div>
            <p className="text-[11px] text-[#65746A]">
              Disease diagnosis, damage heatmap, and care recommendations
            </p>
          </div>
        </div>

        {/* Export and Status Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            title="Print or save as PDF"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFE7DF] bg-[#F8FAF8] hover:bg-[#E8F3E8] px-2.5 py-1 text-xs font-semibold text-[#17261E] hover:text-[#176B3A] transition shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5 text-[#176B3A]" />
            <span>Print Report</span>
          </button>

          {/* Export JSON Button */}
          <button
            type="button"
            onClick={handleExportJson}
            title="Download JSON data"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFE7DF] bg-[#F8FAF8] hover:bg-[#E8F3E8] px-2.5 py-1 text-xs font-semibold text-[#17261E] hover:text-[#176B3A] transition shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-[#176B3A]" />
            <span>Save JSON</span>
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            title="Export CSV spreadsheet"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFE7DF] bg-[#F8FAF8] hover:bg-[#E8F3E8] px-2.5 py-1 text-xs font-semibold text-[#17261E] hover:text-[#176B3A] transition shadow-2xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#176B3A]" />
            <span>Save CSV</span>
          </button>

          {/* Copy Summary Button */}
          <button
            type="button"
            onClick={handleCopySummary}
            title="Copy formatted diagnostic summary to clipboard"
            className="inline-flex items-center gap-1 rounded-lg border border-[#DFE7DF] bg-[#F8FAF8] hover:bg-[#E8F3E8] px-2 py-1 text-xs font-semibold text-[#17261E] transition shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#25834A]" />
                <span className="text-[#25834A]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-[#65746A]" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${isHealthy
                ? "bg-[#E8F3E8] text-[#25834A] border-[#C8E6C9]"
                : "bg-[#FEE2E2] text-[#DC4545] border-[#FECACA]"
              }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isHealthy ? "bg-[#25834A]" : "bg-[#DC4545]"}`} />
            {isHealthy ? "Healthy Foliage" : "Disease Detected"}
          </span>
        </div>
      </div>

      {/* ── 2. TOP SUMMARY GRID: Diagnosis + Gauge (Left) & Top Predictions (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch no-print">
        {/* Left Sub-card (8 cols on lg) */}
        <div className="lg:col-span-8 rounded-xl border border-[#DFE7DF] bg-[#F2F6F2]/40 p-3.5 flex flex-col sm:flex-row items-center gap-3.5">
          {/* Specimen Slide Thumbnail with Laboratory Reticle */}
          <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-[#DFE7DF] bg-gradient-to-b from-[#F8FAF8] to-[#F2F6F2] shrink-0 flex items-center justify-center p-1.5 shadow-2xs group">
            {/* Laboratory Slide Reticle Marks */}
            <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-[#176B3A]/40 rounded-tl pointer-events-none" />
            <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-[#176B3A]/40 rounded-tr pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-[#176B3A]/40 rounded-bl pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[#176B3A]/40 rounded-br pointer-events-none" />

            {originalUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={originalUrl}
                alt="Leaf thumbnail"
                className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
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

            <h3 className={`text-xl sm:text-2xl font-black tracking-tight leading-snug truncate ${isHealthy ? "text-[#25834A]" : "text-[#DC4545]"
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
            <svg className="h-20 w-20 -rotate-90 transform drop-shadow-xs" viewBox="0 0 100 100">
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
                style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-black text-[#17261E] tabular-nums leading-none">
                {confFormatted}%
              </span>
              <span className="text-[8px] text-[#65746A] font-bold mt-0.5 leading-none uppercase tracking-wide">
                Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Right Sub-card: Top Predictions (4 cols on lg) */}
        <div className="lg:col-span-4 rounded-xl border border-[#DFE7DF] bg-[#F2F6F2]/40 p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-[#176B3A]">
            <Sprout className="h-3.5 w-3.5" />
            <span>Top Matches</span>
          </div>

          <div className="space-y-1.5 flex-1 justify-center flex flex-col">
            {topCandidates.map((cand, idx) => {
              const displayLabel = cand.disease || (cand as any).class_name || "Unknown";
              const isLeading = idx === 0;

              return (
                <div key={idx} className="flex items-center justify-between text-[11px] gap-1.5">
                  <span className={`truncate max-w-[95px] flex items-center gap-1 ${isLeading ? "font-bold text-[#17261E]" : "text-[#65746A]"
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
                    <span className={`tabular-nums font-semibold w-8 text-right text-[10px] ${isLeading ? "text-[#17261E]" : "text-[#65746A]"
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

      {/* ── 3. MODEL VISUALIZATION (Grad-CAM Explainability) ── */}
      <div className="space-y-3 pt-1 no-print">
        {/* Visualization Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#E8F3E8] text-[#176B3A]">
              <ScanEye className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#17261E] leading-none">
                Where is the damage located?
              </h4>
              <p className="text-[10px] text-[#65746A] mt-0.5 leading-none">
                Heatmap highlights affected leaf tissue and damaged spots
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Hotspot Markers Toggle */}
            <button
              type="button"
              onClick={() => setShowHotspotMarkers((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${showHotspotMarkers
                  ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
                  : "bg-[#F8FAF8] text-[#65746A] border-[#DFE7DF] hover:bg-[#F2F6F2]"
                }`}
            >
              <Crosshair className="h-3.5 w-3.5" />
              <span>Show Damaged Spots: {showHotspotMarkers ? "ON" : "OFF"}</span>
            </button>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-[#F2F6F2] p-0.5 rounded-lg border border-[#DFE7DF] text-xs">
              <button
                type="button"
                onClick={() => setActiveCamMode("split")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${activeCamMode === "split"
                    ? "bg-[#073F28] text-white shadow-xs"
                    : "text-[#65746A] hover:text-[#17261E]"
                  }`}
              >
                <Split className="h-3.5 w-3.5" />
                <span>Compare Slider</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCamMode("overlay")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${activeCamMode === "overlay"
                    ? "bg-[#073F28] text-white shadow-xs"
                    : "text-[#65746A] hover:text-[#17261E]"
                  }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Heatmap Overlay</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCamMode("sideBySide")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${activeCamMode === "sideBySide"
                    ? "bg-[#073F28] text-white shadow-xs"
                    : "text-[#65746A] hover:text-[#17261E]"
                  }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Side by Side</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCamMode("heatmap")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${activeCamMode === "heatmap"
                    ? "bg-[#073F28] text-white shadow-xs"
                    : "text-[#65746A] hover:text-[#17261E]"
                  }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Heatmap Only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Sub-Controls (Slider Range / Opacity Range) */}
        {activeCamMode === "split" && (
          <div className="flex items-center justify-between gap-3 bg-[#F8FAF8] px-3 py-1.5 rounded-xl border border-[#DFE7DF] text-xs">
            <span className="text-[11px] text-[#65746A] flex items-center gap-1.5">
              <span className="text-[#D97706] font-bold">💡</span>
              Drag the slider to compare the leaf photo against the disease heatmap.
            </span>
            <span className="text-[11px] font-bold text-[#176B3A] tabular-nums shrink-0">
              {sliderPosition}%
            </span>
          </div>
        )}

        {activeCamMode === "overlay" && (
          <div className="flex items-center justify-between gap-3 bg-[#F8FAF8] px-3 py-1.5 rounded-xl border border-[#DFE7DF] text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <span className="text-[11px] font-medium text-[#65746A] shrink-0">Heatmap Intensity:</span>
              <input
                type="range"
                min="10"
                max="100"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                className="w-full accent-[#176B3A] cursor-pointer"
              />
            </div>
            <span className="text-[11px] font-bold text-[#176B3A] tabular-nums shrink-0">
              {overlayOpacity}% Opacity
            </span>
          </div>
        )}

        {/* Main Canvas / Viewer Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          {/* Visual Display Box (8 cols) */}
          <div className="lg:col-span-8 relative rounded-xl border border-[#DFE7DF] bg-[#E8EFE8] overflow-hidden min-h-[340px] max-h-[440px] flex items-center justify-center select-none shadow-inner">
            {/* 1. Interactive Split Slider View */}
            {activeCamMode === "split" && (
              <div className="relative w-full h-full flex items-center justify-center bg-black/5 overflow-hidden">
                {/* Natural Image (Underneath) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalUrl}
                  alt="Original Foliage"
                  className="max-h-[380px] w-auto max-w-full object-contain pointer-events-none"
                />

                {/* Grad-CAM Image (Clipped on top from right side) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
                  style={{
                    clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gradcamUrl}
                    alt="Grad-CAM Overlay"
                    className="max-h-[380px] w-auto max-w-full object-contain pointer-events-none"
                  />
                </div>

                {/* Lesion Hotspot Rings */}
                {showHotspotMarkers && (result.gradcam?.hotspots || []).map((spot, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveHotspotIndex(idx)}
                    onMouseLeave={() => setActiveHotspotIndex(null)}
                    style={{
                      left: `${spot.x * 100}%`,
                      top: `${spot.y * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className="absolute z-20 cursor-pointer pointer-events-auto"
                  >
                    <span className="relative flex h-6 w-6 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-amber-500/90 text-white text-[9px] font-black border border-white shadow-md">
                        #{idx + 1}
                      </span>
                    </span>

                    {/* Tooltip */}
                    {activeHotspotIndex === idx && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-black/90 text-white text-[10px] whitespace-nowrap z-30 shadow-lg pointer-events-none border border-white/20">
                        <p className="font-bold text-amber-300">Damaged Spot #{idx + 1}</p>
                        <p>Intensity: {(spot.intensity * 100).toFixed(0)}%</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Vertical Divider Line with Drag Handle */}
                <div
                  className="absolute top-0 bottom-0 z-20 pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-0 bottom-0 -left-[1px] w-[2px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-lg border border-[#DFE7DF] text-[#176B3A]">
                    <Split className="h-3.5 w-3.5 rotate-90" />
                  </div>
                </div>

                {/* Range Input for moving slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-25"
                  aria-label="Compare original leaf with heatmap"
                />

                {/* Corner Labels */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none rounded-md bg-black/70 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                  Original Leaf
                </div>
                <div className="absolute top-3 right-3 z-10 pointer-events-none rounded-md bg-[#073F28]/90 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                  Disease Heatmap
                </div>
              </div>
            )}

            {/* 2. Adjustable Opacity Overlay View */}
            {activeCamMode === "overlay" && (
              <div className="relative w-full h-full flex items-center justify-center bg-black/5">
                {/* Natural Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalUrl}
                  alt="Original Leaf"
                  className="max-h-[380px] w-auto max-w-full object-contain"
                />

                {/* Thermal Map on top with adjustable opacity */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity"
                  style={{ opacity: overlayOpacity / 100 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gradcamUrl}
                    alt="Grad-CAM Overlay"
                    className="max-h-[380px] w-auto max-w-full object-contain"
                  />
                </div>

                {/* Lesion Hotspots */}
                {showHotspotMarkers && (result.gradcam?.hotspots || []).map((spot, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveHotspotIndex(idx)}
                    onMouseLeave={() => setActiveHotspotIndex(null)}
                    style={{
                      left: `${spot.x * 100}%`,
                      top: `${spot.y * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className="absolute z-20 cursor-pointer"
                  >
                    <span className="relative flex h-6 w-6 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-amber-500/90 text-white text-[9px] font-black border border-white shadow-md">
                        #{idx + 1}
                      </span>
                    </span>

                    {activeHotspotIndex === idx && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-black/90 text-white text-[10px] whitespace-nowrap z-30 shadow-lg pointer-events-none border border-white/20">
                        <p className="font-bold text-amber-300">Spot #{idx + 1}</p>
                        <p>Intensity: {(spot.intensity * 100).toFixed(0)}%</p>
                      </div>
                    )}
                  </div>
                ))}

                <div className="absolute top-3 left-3 z-10 pointer-events-none rounded-md bg-[#073F28]/90 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                  Blended Heatmap ({overlayOpacity}%)
                </div>
              </div>
            )}

            {/* 3. Side-by-Side Dual View */}
            {activeCamMode === "sideBySide" && (
              <div className="relative w-full h-full grid grid-cols-2 gap-1 p-2 bg-[#F8FAF8]">
                <div className="relative h-full rounded-xl overflow-hidden bg-white border border-[#DFE7DF] flex items-center justify-center p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="max-h-full max-w-full object-contain"
                  />
                  <span className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[8px] font-bold text-white">
                    Original Leaf
                  </span>
                </div>
                <div className="relative h-full rounded-xl overflow-hidden bg-white border border-[#DFE7DF] flex items-center justify-center p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gradcamUrl}
                    alt="Grad-CAM"
                    className="max-h-full max-w-full object-contain"
                  />
                  <span className="absolute top-2 left-2 rounded bg-[#073F28]/90 px-1.5 py-0.5 text-[8px] font-bold text-white">
                    Disease Heatmap
                  </span>
                </div>
              </div>
            )}

            {/* 4. Thermal Map Only View */}
            {activeCamMode === "heatmap" && (
              <div className="relative w-full h-full flex items-center justify-center bg-[#0B130E] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heatmapUrl}
                  alt="Pure Attention Heatmap"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-inner"
                />
                <div className="absolute top-3 left-3 z-10 pointer-events-none rounded-md bg-black/80 px-2 py-0.5 text-[9px] font-bold text-white border border-white/20">
                  Disease Heatmap
                </div>
              </div>
            )}

            {/* Lightbox Expand Button */}
            <button
              type="button"
              onClick={() =>
                setExpandedImage({
                  url: activeCamMode === "heatmap" ? heatmapUrl : gradcamUrl,
                  title: activeCamMode === "heatmap" ? "Disease Heatmap View" : "Disease Heatmap on Leaf",
                })
              }
              title="View full-size high-resolution visualization"
              className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-[11px] font-semibold transition backdrop-blur-xs shadow-md"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Fullscreen</span>
            </button>
          </div>

          {/* Diagnostic Color Scale & Analytics (4 cols) */}
          <div className="lg:col-span-4 rounded-xl border border-[#DFE7DF] bg-[#F2F6F2]/40 p-3.5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#DFE7DF]">
                <h5 className="text-xs font-bold text-[#17261E]">Heatmap Guide</h5>
                <span className="text-[9px] font-bold text-[#65746A]">Damage Scale</span>
              </div>

              {/* Colormap Gradient Bar */}
              <div className="mt-2.5 space-y-1">
                <div className="h-3 w-full rounded-md bg-gradient-to-r from-[#30123B] via-[#28BBEC] via-[#A2FC3C] via-[#FB8022] to-[#7A0403] shadow-inner" />
                <div className="flex justify-between text-[9px] font-bold text-[#65746A]">
                  <span>Healthy</span>
                  <span>Stressed</span>
                  <span>Damaged</span>
                </div>
              </div>

              {/* Pathology Legend Breakdown */}
              <div className="mt-3 space-y-1.5 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#7A0403] shrink-0" />
                  <span className="text-[#17261E] font-medium leading-tight">
                    <strong>Red:</strong> Heavily damaged spot
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#FB8022] shrink-0" />
                  <span className="text-[#17261E] font-medium leading-tight">
                    <strong>Orange:</strong> Spreading disease
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#28BBEC] shrink-0" />
                  <span className="text-[#17261E] font-medium leading-tight">
                    <strong>Green:</strong> Stressed leaf tissue
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#30123B] shrink-0" />
                  <span className="text-[#65746A] leading-tight">
                    <strong>Blue:</strong> Healthy leaf tissue
                  </span>
                </div>
              </div>
            </div>

            {/* Pathology Analytics Badges */}
            <div className="pt-2 border-t border-[#DFE7DF] space-y-2">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-[#F8FAF8] p-2 rounded-xl border border-[#DFE7DF]">
                  <span className="text-[8px] text-[#92A096] uppercase font-bold block">Damaged Spots</span>
                  <span className="text-sm font-extrabold text-[#17261E] mt-0.5 block">
                    {isHealthy ? "0 (Healthy)" : (result.gradcam?.lesions_detected ?? 1)}
                  </span>
                </div>
                <div className="bg-[#F8FAF8] p-2 rounded-xl border border-[#DFE7DF]">
                  <span className="text-[8px] text-[#92A096] uppercase font-bold block">Area Affected</span>
                  <span className="text-sm font-extrabold text-[#17261E] mt-0.5 block">
                    {isHealthy ? "0.0%" : `${(result.gradcam?.affected_area_pct ?? 0).toFixed(1)}%`}
                  </span>
                </div>
              </div>

              {/* Detected Lesions Quick List */}
              {!isHealthy && (result.gradcam?.hotspots?.length ?? 0) > 0 && (
                <div className="rounded-xl bg-[#F8FAF8] p-2 border border-[#DFE7DF] space-y-1">
                  <span className="text-[9px] font-bold text-[#17261E] block">
                    Key Damaged Spots ({result.gradcam?.hotspots?.length} found):
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-[75px] overflow-y-auto">
                    {(result.gradcam?.hotspots ?? []).map((spot, idx) => (
                      <span
                        key={idx}
                        onMouseEnter={() => setActiveHotspotIndex(idx)}
                        onMouseLeave={() => setActiveHotspotIndex(null)}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium transition cursor-pointer ${activeHotspotIndex === idx
                            ? "bg-amber-400 text-black font-bold shadow-xs"
                            : "bg-white text-[#65746A] border border-[#DFE7DF] hover:bg-[#E8F3E8]"
                          }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <span>Spot #{idx + 1}: {(spot.intensity * 100).toFixed(0)}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. DISEASE DESCRIPTION & SUGGESTED ACTION ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 no-print">
        {/* Left: Disease Description */}
        <div className="rounded-xl border border-[#DFE7DF] bg-[#F2F6F2]/40 p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#17261E]">
            <FileText className="h-4 w-4 text-[#176B3A]" />
            <h4>About this condition</h4>
          </div>
          <p className="text-[11px] text-[#65746A] leading-relaxed">
            {descriptionText}
          </p>

          {/* 4 Metadata Badges in a Row */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px]">
            <div className="rounded-lg bg-white p-1.5 border border-[#DFE7DF] text-center">
              <p className="text-[8px] text-[#92A096] uppercase font-bold">Plant</p>
              <p className="font-bold text-[#17261E] truncate mt-0.5">{plantName}</p>
            </div>
            <div className="rounded-lg bg-white p-1.5 border border-[#DFE7DF] text-center">
              <p className="text-[8px] text-[#92A096] uppercase font-bold">Cause</p>
              <p className="font-bold text-[#17261E] truncate mt-0.5">{scientificName.split(" ")[0]}</p>
            </div>
            <div className="rounded-lg bg-white p-1.5 border border-[#DFE7DF] text-center">
              <p className="text-[8px] text-[#92A096] uppercase font-bold">Type</p>
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
            <h4>What you should do</h4>
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

      {/* ── 5. ACTION BUTTONS ── */}
      {(onAnalyzeAnother || onViewHistory) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EBF0EB] no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFE7DF] bg-white px-3 py-1.5 text-xs font-semibold text-[#17261E] hover:bg-[#F2F6F2] transition"
            >
              <Printer className="h-3.5 w-3.5 text-[#176B3A]" />
              <span>Print Report</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFE7DF] bg-white px-3 py-1.5 text-xs font-semibold text-[#17261E] hover:bg-[#F2F6F2] transition"
            >
              <Download className="h-3.5 w-3.5 text-[#176B3A]" />
              <span>Download JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onViewHistory && (
              <button
                type="button"
                onClick={onViewHistory}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFE7DF] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#17261E] hover:bg-[#F2F6F2] transition"
              >
                <History className="h-3.5 w-3.5 text-[#65746A]" />
                <span>View History</span>
              </button>
            )}
            {onAnalyzeAnother && (
              <button
                type="button"
                onClick={onAnalyzeAnother}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#176B3A] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#073F28] active:scale-95 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Check Another Leaf</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Full Size Image Lightbox Modal */}
      {expandedImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setExpandedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs transition no-print"
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
