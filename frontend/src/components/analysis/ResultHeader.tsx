"use client";

import { ConfidenceBadge } from "./ConfidenceBadge";
import type { PredictionResult } from "../../types/analysis";

interface ResultHeaderProps {
  result: PredictionResult;
  onNewAnalysis: () => void;
  onOpenReportModal: () => void;
}

export function ResultHeader({
  result,
  onNewAnalysis,
  onOpenReportModal,
}: ResultHeaderProps) {
  const isLowConfidence = result.confidence < 50.0;
  const isHealthy = result.disease.toLowerCase().includes("healthy");
  const plantName = typeof result.plant === "object" && result.plant ? result.plant.name : result.plant;

  return (
    <div className="flex flex-col gap-4 border-b border-[#E2E2DC] pb-6">
      {/* Low confidence warning banner if applicable */}
      {isLowConfidence && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-300/80 bg-rose-50/70 p-4 text-xs text-rose-950 shadow-xs">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-800 font-bold text-[11px]">
            !
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-rose-900">
              Low Confidence Classification Notice
            </h4>
            <p className="leading-relaxed text-rose-800/95">
              The neural network returned a confidence of only{" "}
              <strong className="font-semibold tabular-nums">{result.confidence.toFixed(2)}%</strong>. This classification is highly uncertain. Please do not apply treatments based solely on this prediction. Consider retaking the photograph in clear, indirect lighting or consulting an agricultural extension expert.
            </p>
          </div>
        </div>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <span>Diagnostic Result</span>
            <span aria-hidden="true">·</span>
            <span>{plantName}</span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
            {result.disease}
          </h1>

          {result.pathogen && result.pathogen !== "Unspecified" && (
            <p className="mt-0.5 text-xs italic text-[#52525B]">
              Associated pathogen: {result.pathogen}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <ConfidenceBadge confidence={result.confidence} size="md" />

            <span className="text-xs text-[#71717A] tabular-nums">
              Classified as <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono text-slate-800">{result.class_name}</code>
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6D6CE] bg-white px-3 py-2 text-xs font-medium text-[#111827] shadow-xs hover:bg-[#F9F9F7] active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-700/60"
          >
            <svg
              className="h-3.5 w-3.5 text-[#52525B]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <path d="M6 14h12v8H6z" />
            </svg>
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B4332] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#143326] active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-700/60"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Analyze another</span>
          </button>
        </div>
      </div>
    </div>
  );
}
