"use client";

import { useRef, type ChangeEvent } from "react";
import { APP_CONFIG } from "../../lib/config";
import { formatFileSize, sanitizeFileName } from "../../lib/validation";
import type { ImageValidationResult } from "../../types/analysis";

interface ImagePreviewProps {
  file: File;
  previewUrl: string;
  validation: ImageValidationResult | null;
  isAnalyzing: boolean;
  modelReady: boolean;
  onReplace: (file: File) => void;
  onRemove: () => void;
  onAnalyze: () => void;
}

export function ImagePreview({
  file,
  previewUrl,
  validation,
  isAnalyzing,
  modelReady,
  onReplace,
  onRemove,
  onAnalyze,
}: ImagePreviewProps) {
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onReplace(e.target.files[0]);
    }
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
    }
  };

  const displayName = sanitizeFileName(file.name);
  const sizeFormatted = formatFileSize(file.size);
  const dimensionsFormatted = validation?.dimensions
    ? `${validation.dimensions.width} × ${validation.dimensions.height} px`
    : null;

  return (
    <div className="flex flex-col rounded-xl border border-[#E2E2DC] bg-white p-5 shadow-xs transition-all">
      {/* Top action bar: File info & Replace/Remove buttons */}
      <div className="flex items-center justify-between border-b border-[#F0F0EB] pb-3 text-xs">
        <div className="min-w-0 pr-2">
          <p className="truncate font-medium text-[#111827]" title={file.name}>
            {displayName}
          </p>
          <p className="text-[11px] text-[#71717A] tabular-nums">
            {sizeFormatted}
            {dimensionsFormatted && ` · ${dimensionsFormatted}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <input
            ref={replaceInputRef}
            type="file"
            accept={APP_CONFIG.supportedMimeTypes.join(",")}
            onChange={handleFileChange}
            disabled={isAnalyzing}
            className="sr-only"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => replaceInputRef.current?.click()}
            disabled={isAnalyzing}
            className="rounded px-2 py-1 text-xs font-medium text-[#52525B] hover:bg-slate-100 hover:text-[#111827] disabled:opacity-50"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={isAnalyzing}
            className="rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Image display container */}
      <div className="relative mt-4 flex items-center justify-center overflow-hidden rounded-lg bg-[#F7F8F5] border border-[#EDEDE8]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Selected plant leaf preview"
          className="max-h-[380px] w-full object-contain p-2"
        />

        {/* Overlay while analyzing */}
        {isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 shadow-xs">
              <svg
                className="h-4 w-4 animate-spin text-[#1B4332]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-xs font-semibold text-[#1B4332]">
                Analyzing leaf features...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Non-blocking Quality/Lighting Warning if any */}
      {validation?.warning && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200/80 bg-amber-50/70 p-2.5 text-xs text-amber-900">
          <svg
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-amber-600 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <div className="leading-relaxed">
            <span className="font-semibold text-amber-950">Notice:</span> {validation.warning}
          </div>
        </div>
      )}

      {/* Action CTA */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[11px] text-[#71717A]">
          {!modelReady ? (
            <span className="text-amber-700">Model is currently initializing.</span>
          ) : (
            <span>Ready for neural inference.</span>
          )}
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={!modelReady || isAnalyzing}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B4332] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#143326] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-700/60"
        >
          {isAnalyzing ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Analyzing leaf...</span>
            </>
          ) : (
            <>
              <span>Analyze leaf</span>
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
