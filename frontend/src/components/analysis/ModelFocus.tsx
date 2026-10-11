"use client";

import { useState } from "react";
import { getFullImageUrl } from "../../lib/utils";

interface ModelFocusProps {
  originalImageUrl: string;
  gradcamImageUrl: string;
  heatmapImageUrl?: string;
  plantName: string;
  diseaseName: string;
}

export function ModelFocus({
  originalImageUrl,
  gradcamImageUrl,
  heatmapImageUrl,
  plantName,
  diseaseName,
}: ModelFocusProps) {
  const [viewMode, setViewMode] = useState<"overlay" | "original" | "heatmap">("overlay");
  const [opacity, setOpacity] = useState<number>(65); // 0 to 100%

  const fullOriginalUrl = getFullImageUrl(originalImageUrl);
  const fullGradcamUrl = getFullImageUrl(gradcamImageUrl);
  const fullHeatmapUrl = getFullImageUrl(heatmapImageUrl || gradcamImageUrl);

  return (
    <div className="flex flex-col gap-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E8E8E2] pb-4">
        {/* View Mode Segmented Switch */}
        <div className="flex items-center gap-1 rounded-lg border border-[#D6D6CE] bg-[#F7F8F5] p-1 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("overlay")}
            className={`rounded-md px-3 py-1.5 font-medium transition-all ${
              viewMode === "overlay"
                ? "bg-white text-[#111827] shadow-xs"
                : "text-[#52525B] hover:text-[#111827]"
            }`}
          >
            Overlay
          </button>
          <button
            type="button"
            onClick={() => setViewMode("original")}
            className={`rounded-md px-3 py-1.5 font-medium transition-all ${
              viewMode === "original"
                ? "bg-white text-[#111827] shadow-xs"
                : "text-[#52525B] hover:text-[#111827]"
            }`}
          >
            Original
          </button>
          <button
            type="button"
            onClick={() => setViewMode("heatmap")}
            className={`rounded-md px-3 py-1.5 font-medium transition-all ${
              viewMode === "heatmap"
                ? "bg-white text-[#111827] shadow-xs"
                : "text-[#52525B] hover:text-[#111827]"
            }`}
          >
            Heatmap
          </button>
        </div>

        {/* Opacity slider (active in overlay mode) */}
        {viewMode === "overlay" && (
          <div className="flex items-center gap-3 text-xs text-[#52525B]">
            <label htmlFor="heatmap-opacity" className="whitespace-nowrap font-medium text-[#111827]">
              Heatmap intensity: <span className="tabular-nums font-mono text-[#52525B]">{opacity}%</span>
            </label>
            <input
              id="heatmap-opacity"
              type="range"
              min="10"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="h-1.5 w-28 cursor-pointer accent-[#1B4332] sm:w-36"
              aria-label="Heatmap overlay opacity"
            />
          </div>
        )}
      </div>

      {/* Side-by-side on desktop / stacked on mobile */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Original reference leaf */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-[#52525B]">
              Input Leaf Image
            </span>
            <span className="text-[11px] text-[#71717A]">Reference photo</span>
          </div>

          <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-[#E2E2DC] bg-[#F7F8F5] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullOriginalUrl}
              alt={`Original ${plantName} leaf`}
              className="h-full w-full object-contain p-2"
            />
          </div>
        </div>

        {/* Right: Model Focus / Grad-CAM view */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-[#1B4332]">
              Model Attention Focus
            </span>
            <span className="text-[11px] text-[#71717A]">Grad-CAM (top_conv)</span>
          </div>

          <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-[#E2E2DC] bg-[#F7F8F5] flex items-center justify-center">
            {viewMode === "original" && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={fullOriginalUrl}
                alt="Original leaf"
                className="h-full w-full object-contain p-2"
              />
            )}

            {viewMode === "heatmap" && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={fullHeatmapUrl}
                alt="Pure Grad-CAM attention heatmap"
                className="h-full w-full object-contain p-2"
              />
            )}

            {viewMode === "overlay" && (
              <div className="relative h-full w-full flex items-center justify-center">
                {/* Base original image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fullOriginalUrl}
                  alt="Original base"
                  className="absolute inset-0 h-full w-full object-contain p-2"
                />

                {/* Overlaid attention heatmap with interactive opacity */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fullGradcamUrl}
                  alt="Attention focus overlay"
                  style={{ opacity: opacity / 100 }}
                  className="absolute inset-0 h-full w-full object-contain p-2 transition-opacity duration-75"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Heatmap Legend & Explanation */}
      <div className="rounded-xl border border-[#E2E2DC] bg-[#FAFBF9] p-4 text-xs text-[#52525B]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium text-[#111827]">
            Attention Scale:
          </span>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-[#71717A]">Lower attention</span>
            <div className="h-2.5 w-32 rounded-full bg-linear-to-r from-blue-600 via-cyan-400 via-yellow-400 to-red-600 shadow-inner sm:w-48" />
            <span className="font-semibold text-rose-700">Higher attention</span>
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-[#71717A]">
          Grad-CAM (Gradient-weighted Class Activation Mapping) computes gradients of the predicted class score with respect to the final convolutional layer (<code className="font-mono text-slate-800">top_conv</code>). Warm colors highlight image regions that contributed most strongly to the model&apos;s classification. This visualizes neural network feature focus and does not prove biological causation.
        </p>
      </div>
    </div>
  );
}
