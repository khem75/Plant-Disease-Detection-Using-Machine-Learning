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
  const gradcamFocusClass = result.gradcam?.targetClass || diseaseName;
  const explanationText = result.explanation || result.disease_info?.description || "";
  const recommendations = (result.recommendations && result.recommendations.length > 0)
    ? result.recommendations
    : (result.disease_info?.prevention || []);
  const topCandidates = result.alternatives && result.alternatives.length > 0 ? result.alternatives : [];
  const severityLabel = result.severity?.label || "Estimated";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs print:p-0 print:bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl print:max-h-none print:shadow-none sm:p-8">
        {/* Top actions (hidden in print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <h2 id="report-modal-title" className="text-base font-semibold text-slate-900">
            Plant Health Diagnostic Report
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B4332] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#143326]"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9V2h12v7" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M6 14h12v8H6z" />
              </svg>
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close report modal"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="mt-6 space-y-6 text-slate-800">
          {/* Academic / Laboratory Diagnostic Header */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 print:border-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Foliar Pathology Screening &amp; AI Diagnostic Laboratory Report
                </span>
                <h3 className="text-sm font-bold text-slate-950">
                  Explainable Foliar Pathology Diagnostic Record
                </h3>
              </div>
              <div className="text-left sm:text-right text-[11px] text-slate-600">
                <div>Model: <span className="font-semibold text-slate-900">EfficientNet-B0 (38 Classes)</span></div>
                <div>Attention: <span className="font-semibold text-slate-900">Grad-CAM (top_conv)</span></div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Plant Health AI · Diagnostic Summary
                </p>
                <h1 className="mt-1 text-2xl font-bold text-slate-950">
                  {diseaseName}
                </h1>
                <p className="text-sm font-medium text-slate-600">
                  Host Crop: <strong className="text-slate-900">{plantName}</strong>
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p className="font-semibold text-slate-900">Analysis Date</p>
                <p>{formatTimestamp(result.analyzed_at)}</p>
                <p className="mt-1 font-mono text-[11px]">Analysis ID: {result.analysisId || result.id || "N/A"}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900">
                Confidence: {confPct.toFixed(2)}% ({confLevelStr})
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                Pathogen: <span className="font-semibold">{scientificName}</span>
              </span>
              <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs text-amber-900 border border-amber-200">
                Severity: {severityLabel} (Estimated)
              </span>
              {result.telemetry && (
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs text-blue-900 border border-blue-200 font-mono">
                  Latency: {result.telemetry.total_latency_ms}ms (Infer: {result.telemetry.inference_time_ms}ms)
                </span>
              )}
            </div>
          </div>

          {/* Visual Pair */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Original Input Leaf
              </p>
              <div className="aspect-4/3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={originalUrl} alt={`Original Leaf: ${plantName}`} className="h-full w-full object-contain p-1" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1.5">
                Grad-CAM Focus: {gradcamFocusClass}
              </p>
              <div className="aspect-4/3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gradcamUrl} alt={`Grad-CAM Focus: ${gradcamFocusClass}`} className="h-full w-full object-contain p-1" />
              </div>
            </div>
          </div>

          {/* Top Model Candidates */}
          {topCandidates.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Top Model Classification Candidates
              </h3>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Rank</th>
                      <th className="px-3 py-2 font-semibold">Crop</th>
                      <th className="px-3 py-2 font-semibold">Diagnosed Condition</th>
                      <th className="px-3 py-2 font-semibold text-right">Probability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {topCandidates.slice(0, 4).map((cand, idx) => (
                      <tr key={idx} className={idx === 0 ? "bg-emerald-50/50 font-bold" : ""}>
                        <td className="px-3 py-1.5 text-slate-500">#{idx + 1}</td>
                        <td className="px-3 py-1.5">{cand.plant}</td>
                        <td className="px-3 py-1.5">{cand.disease}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-emerald-800">{cand.confidence.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Description */}
          {explanationText && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Agronomic Diagnostic Explanation
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
                {explanationText}
              </p>
            </div>
          )}

          {/* Symptoms and Next Steps */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Typical Reference Symptoms
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                {(result.disease_info?.symptoms || [
                  "Foliar discoloration or necrotic lesion formation.",
                  "Stunted or chlorotic leaf margins.",
                ]).map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Recommended Actions &amp; IPM
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                {recommendations.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span>✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Agronomic Verification & Review Sign-off block */}
          <div className="rounded-xl border border-slate-300 p-4 bg-slate-50/60 print:block">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Agronomic Verification &amp; Laboratory Review
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
              <div>
                <span className="block text-[11px] text-slate-500 font-medium">Sample Collection ID:</span>
                <div className="mt-1.5 border-b border-slate-400 pb-1 font-mono text-slate-900">
                  _______________________
                </div>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-medium">Reviewing Agronomist / Specialist:</span>
                <div className="mt-1.5 border-b border-slate-400 pb-1 font-mono text-slate-900">
                  _______________________
                </div>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-medium">Field Recommendation Status:</span>
                <div className="mt-1.5 border-b border-slate-400 pb-1 font-mono text-slate-900">
                  _______________________
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 leading-relaxed">
            Report generated by Plant Health AI Platform (EfficientNetB0 · Grad-CAM). This diagnostic screening document was synthesized for academic presentation and research evaluation.
          </div>
        </div>
      </div>
    </div>
  );
}
