"use client";

import type { ModelHealthStatus } from "../../types/analysis";

interface ModelStatusBadgeProps {
  status: ModelHealthStatus | null;
  isAnalyzing?: boolean;
}

export function ModelStatusBadge({ status, isAnalyzing }: ModelStatusBadgeProps) {
  if (isAnalyzing) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-50/70 px-3 py-1 text-xs font-medium text-emerald-900 shadow-xs"
        role="status"
        aria-live="polite"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
        </span>
        <span>Analyzing leaf...</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
        role="status"
        aria-live="polite"
      >
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (status.model_available) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-800"
        role="status"
        aria-live="polite"
        title={`EfficientNetB0 model active · ${status.classes} botanical classes`}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="font-semibold text-emerald-900">Model ready</span>
        <span className="hidden text-emerald-700/80 sm:inline">({status.classes} classes)</span>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800"
      role="status"
      aria-live="polite"
      title="Model is initializing"
    >
      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
      <span>Model initializing</span>
    </div>
  );
}
