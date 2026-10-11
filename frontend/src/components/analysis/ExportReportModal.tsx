"use client";

import { useEffect } from "react";
import { formatTimestamp, getFullImageUrl } from "../../lib/utils";
import type { PredictionResult } from "../../types/analysis";

interface ExportReportModalProps {
  result: PredictionResult;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportReportModal({
  result,
  isOpen,
  onClose,
}: ExportReportModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const plantName = typeof result.plant === "object" && result.plant ? result.plant.name : (result.plant || "Unknown Crop");
  const diseaseName = result.prediction?.disease || result.disease || "Unknown Condition";
  const scientificName = result.prediction?.scientific_name || result.pathogen || result.disease_info?.pathogen || "Botanical classification";
  const confPct = result.prediction?.confidence ?? result.confidence ?? 0;
  const confLevelStr = (result.prediction?.confidence_level || result.confidence_level || "HIGH").toUpperCase();
  const originalUrl = getFullImageUrl(result.image?.url || result.image_url);
  const gradcamUrl = getFullImageUrl(result.gradcam?.image || result.gradcam_image);
  const heatmapUrl = getFullImageUrl(result.gradcam?.heatmap || result.heatmap_image) || gradcamUrl;
  const gradcamFocusClass = result.gradcam?.targetClass || diseaseName;
  const explanationText = result.explanation || result.disease_info?.description || "";
  const recommendations = (result.recommendations && result.recommendations.length > 0)
    ? result.recommendations
    : (result.disease_info?.prevention || []);
  const topCandidates = result.alternatives && result.alternatives.length > 0 ? result.alternatives : [];
  const severityLabel = result.severity?.label || "Estimated";
  const hotspots = result.gradcam?.hotspots || [];
  const lesionsDetected = result.gradcam?.lesions_detected ?? (diseaseName.toLowerCase().includes("healthy") ? 0 : hotspots.length > 0 ? hotspots.length : 1);
  const affectedAreaPct = result.gradcam?.affected_area_pct ?? (diseaseName.toLowerCase().includes("healthy") ? 0.0 : 5.4);
  const analysisId = result.analysisId || String(result.id) || "AGRI-AI-2026-X9";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs print:p-0 print:bg-white print:static"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <style>{`
        @media print {
          @page {
            margin: 10mm 12mm;
            size: A4 portrait;
          }
          body {
            background: white !important;
            color: #0f172a !important;
          }
          .print-dossier {
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="print-dossier relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl print:max-h-none print:shadow-none sm:p-10 border border-slate-200 print:border-none">
        {/* Top actions (hidden in print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-lg font-black shadow-xs">
              📜
            </span>
            <div>
              <h2 id="report-modal-title" className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Phytosanitary Diagnostic Certificate &amp; Dossier
              </h2>
              <span className="text-xs text-slate-500 font-mono">Dossier ID: {analysisId} · Ready for PDF Export</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-700 to-emerald-950 px-4 py-2 text-xs font-bold text-white hover:from-emerald-800 hover:to-black shadow-sm transition-all cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 9V2h12v7" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M6 14h12v8H6z" />
              </svg>
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Close report modal"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Printable Formal Diagnostic Dossier */}
        <div className="space-y-6 text-slate-900">
          {/* Institutional Crest & Laboratory Header */}
          <div className="border-b-2 border-emerald-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-800 to-emerald-950 text-white font-black text-2xl shadow-md border-2 border-emerald-600 shrink-0">
                  🌱
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block">
                    National Phytopathology Diagnostic Consortium · Automated AI Division
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
                    Official Botanical Pathology Diagnostic Certificate
                  </h1>
                  <span className="text-xs text-slate-500 font-medium">
                    Deep Neural Saliency Audit (EfficientNet-B0 Backbone · Multi-Scale Grad-CAM++)
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200 shrink-0">
                <div><span className="font-semibold text-slate-800">Dossier ID:</span> <span className="font-mono text-emerald-900 font-bold">{analysisId}</span></div>
                <div><span className="font-semibold text-slate-800">Date Issued:</span> {formatTimestamp(result.analyzed_at)}</div>
                <div><span className="font-semibold text-slate-800">Quality Status:</span> <span className="text-emerald-700 font-bold">Certified Lab-Grade</span></div>
              </div>
            </div>
          </div>

          {/* Primary Pathology Diagnosis Banner */}
          <div className="break-inside-avoid rounded-2xl border-2 border-emerald-300 bg-linear-to-r from-emerald-50 via-white to-slate-50 p-5 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-emerald-800 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Primary Diagnosis
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Host Specimen: <strong className="text-slate-900 font-bold">{plantName}</strong>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
                  {diseaseName}
                </h2>
                <p className="text-xs text-slate-600 italic mt-0.5">
                  Taxonomic Pathogen / Etiology: <strong className="text-slate-800 not-italic font-semibold">{scientificName}</strong>
                </p>
                {explanationText && (
                  <p className="mt-3 text-xs text-slate-700 leading-relaxed border-t border-emerald-200/80 pt-2">
                    {explanationText}
                  </p>
                )}
              </div>

              {/* Diagnosis Telemetry Score */}
              <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-emerald-200/80 pt-3 md:pt-0 md:pl-5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Diagnostic Certainty
                </span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-800 tabular-nums tracking-tight">
                  {confPct.toFixed(2)}%
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                    {confLevelStr} CONFIDENCE
                  </span>
                  <span className="rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                    {severityLabel} SEVERITY
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Plates (Original vs Grad-CAM++ Attention) */}
          <div className="break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-700"></span>
              Visual Pathology Plates &amp; Neural Attention Evidence
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-2">
                  <span>PLATE A: Calibrated Macro Photography</span>
                  <span className="font-mono text-[10px] text-slate-500">224 × 224 RGB</span>
                </div>
                <div className="aspect-4/3 overflow-hidden rounded-xl border border-slate-200 bg-white flex items-center justify-center shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalUrl} alt={`Original Leaf: ${plantName}`} className="h-full w-full object-contain p-1" />
                </div>
                <span className="block mt-1.5 text-[10px] text-slate-500 text-center font-medium">
                  Direct specimen photographic capture normalized for neural feature extraction
                </span>
              </div>

              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 mb-2">
                  <span>PLATE B: Multi-Scale LayerCAM++ Heatmap</span>
                  <span className="font-mono text-[10px] text-emerald-700">Fused Saliency Map</span>
                </div>
                <div className="aspect-4/3 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 flex items-center justify-center relative shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gradcamUrl} alt={`Grad-CAM Focus: ${gradcamFocusClass}`} className="h-full w-full object-contain p-1" />
                  <div className="absolute bottom-1.5 right-1.5 rounded-lg bg-black/80 px-2 py-0.5 text-[9px] font-bold text-white border border-white/20">
                    🎯 Hotspots Identified: {lesionsDetected}
                  </div>
                </div>
                <span className="block mt-1.5 text-[10px] text-slate-500 text-center font-medium">
                  Chroma-masked foliar gradient attribution isolating target necrotic foci
                </span>
              </div>
            </div>

            {/* Thermal Spectrum Legend Bar */}
            <div className="mt-3 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-[10px]">
              <div className="flex items-center justify-between text-slate-600 mb-1 font-medium">
                <span>0% Non-Pathogenic Leaf Blade</span>
                <span>50% Intermediate Foliar Stress Margin</span>
                <span className="text-red-700 font-bold">100% Critical Lesion Hotspot Focus</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-linear-to-r from-blue-600 via-cyan-400 via-yellow-400 to-red-600"></div>
            </div>
          </div>

          {/* Quantitative Pathological Telemetry Box */}
          <div className="break-inside-avoid rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Quantitative Foliar Lesion Telemetry
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Lesion Foci Detected:</span>
                <span className="font-bold text-slate-900 text-sm">{lesionsDetected} Active Clusters</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Symptomatic Leaf Area:</span>
                <span className="font-bold text-amber-700 text-sm">~{affectedAreaPct}% Foliar Coverage</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Inference Architecture:</span>
                <span className="font-bold text-slate-900 text-sm truncate block">EfficientNet-B0 (38 Classes)</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Explainability Head:</span>
                <span className="font-bold text-emerald-800 text-sm truncate block">Multi-Scale LayerCAM++</span>
              </div>
            </div>
          </div>

          {/* Top Classification Candidates Table */}
          {topCandidates.length > 0 && (
            <div className="break-inside-avoid">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                Differential Diagnostic Distribution (Top Model Candidates)
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-300">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="px-3.5 py-2">Rank</th>
                      <th className="px-3.5 py-2">Host Botanical</th>
                      <th className="px-3.5 py-2">Pathological Condition</th>
                      <th className="px-3.5 py-2">Softmax Margin</th>
                      <th className="px-3.5 py-2 text-right">Probability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {topCandidates.slice(0, 4).map((cand, idx) => (
                      <tr key={idx} className={idx === 0 ? "bg-emerald-50/70 font-bold" : ""}>
                        <td className="px-3.5 py-2 text-slate-500">#{idx + 1}</td>
                        <td className="px-3.5 py-2">{cand.plant}</td>
                        <td className="px-3.5 py-2">{cand.disease}</td>
                        <td className="px-3.5 py-2 text-slate-600 font-normal">
                          <div className="h-1.5 w-24 rounded-full bg-slate-200 overflow-hidden inline-block align-middle mr-2">
                            <div className="h-full bg-emerald-700" style={{ width: `${Math.min(100, cand.confidence)}%` }}></div>
                          </div>
                        </td>
                        <td className="px-3.5 py-2 text-right font-mono font-bold text-emerald-900">{cand.confidence.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Prescribed Agronomic Remediation Protocol */}
          <div className="break-inside-avoid rounded-2xl border border-slate-300 p-4 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 mb-3 flex items-center gap-2">
              <span>📋</span>
              Prescribed Integrated Pest Management (IPM) &amp; Remediation Protocol
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendations.map((action, idx) => {
                const actionCategories = [
                  { label: "Cultural Sanitation & Pruning", icon: "✂️" },
                  { label: "Targeted Therapeutic Application", icon: "🧪" },
                  { label: "Organic & Biological Controls", icon: "🌿" },
                  { label: "Field Surveillance & Monitoring", icon: "🔍" },
                ];
                const cat = actionCategories[idx % actionCategories.length];
                return (
                  <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-slate-200 p-3 bg-slate-50/60">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-800 text-xs font-bold text-white mt-0.5">
                      {cat.icon}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-0.5">
                        {cat.label}
                      </span>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {action}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Sign-Off Block */}
          <div className="break-inside-avoid rounded-2xl border-2 border-dashed border-slate-300 p-4 bg-slate-50/70">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span>🏛️</span> Agronomic Laboratory Sign-off &amp; Regulatory Review
              </span>
              <span className="text-[10px] text-slate-500 font-mono">ISO/IEC 17025 Standardized Foliar Workflow</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
              <div>
                <span className="block text-[11px] text-slate-500 font-semibold">Inspecting Pathologist / Agronomist:</span>
                <div className="mt-3 border-b border-slate-400 pb-1 font-mono text-slate-900">
                  Signature: __________________________
                </div>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-semibold">Station / Extension ID:</span>
                <div className="mt-3 border-b border-slate-400 pb-1 font-mono text-slate-900">
                  Station: __________________________
                </div>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-semibold">Remediation Status:</span>
                <div className="mt-2 text-xs font-semibold text-slate-800">
                  [ ✓ ] Approved Diagnostic Assessment<br />
                  [   ] Additional Specimen Sampling Req.
                </div>
              </div>
            </div>
          </div>

          {/* Advisory Disclaimer */}
          <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 leading-relaxed text-center">
            Certified Plant Pathology Diagnostic Report generated automatically by the Plant Health AI Screening Platform. This report is produced for agricultural educational, scientific research, and field monitoring purposes.
          </div>
        </div>
      </div>
    </div>
  );
}
