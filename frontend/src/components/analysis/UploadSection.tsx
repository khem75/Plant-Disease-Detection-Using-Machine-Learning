"use client";

import { useRef, useState, useEffect, type DragEvent, type ChangeEvent } from "react";
import { formatFileSize, sanitizeFileName } from "../../lib/validation";
import type { ImageValidationResult } from "../../types/analysis";

interface UploadSectionProps {
  selectedFile: File | null;
  previewUrl: string | null;
  validation: ImageValidationResult | null;
  isAnalyzing: boolean;
  modelReady: boolean;
  onSelectFile: (file: File) => void;
  onClearFile: () => void;
  onAnalyze: () => void;
}

export function UploadSection({
  selectedFile,
  previewUrl,
  validation,
  isAnalyzing,
  modelReady,
  onSelectFile,
  onClearFile,
  onAnalyze,
}: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Paste support (Ctrl + V anywhere)
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      if (isAnalyzing) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            onSelectFile(file);
            break;
          }
        }
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isAnalyzing, onSelectFile]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isAnalyzing) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelectFile(e.target.files[0]);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleQuickSample = async (samplePath: string, fileName: string) => {
    try {
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "image/jpeg" });
      onSelectFile(file);
    } catch (err) {
      console.error("Failed to load quick test sample", err);
    }
  };

  const displayFileName = selectedFile ? sanitizeFileName(selectedFile.name) : "leaf_photo.jpg";
  const displayFileSize = selectedFile ? formatFileSize(selectedFile.size) : "17.8 KB";
  const displayDimensions = validation?.dimensions
    ? `${validation.dimensions.width} × ${validation.dimensions.height}`
    : "256 × 256";

  const hasImage = Boolean(previewUrl);

  const sampleImages = [
    { path: "/samples/tomato_early_blight.jpg", file: "tomato_early_blight.jpg", label: "Tomato", sub: "Early Blight" },
    { path: "/samples/pepper.jpg", file: "pepper_bacterial_spot.jpg", label: "Pepper, Bell", sub: "Bacterial Spot" },
    { path: "/samples/apple_black_rot.jpg", file: "apple_black_rot.jpg", label: "Apple", sub: "Black Rot" },
    { path: "/samples/corn_common_rust.jpg", file: "corn_common_rust.jpg", label: "Corn", sub: "Common Rust" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Main Uploaded Card */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        {/* Card Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#059669] text-white">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="text-sm font-bold text-[#111827]">Uploaded Image</span>
        </div>

        {!hasImage ? (
          /* Empty State: Upload Dropzone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 px-4 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-[#059669] bg-[#ECFDF5]"
                : "border-[#D1D5DB] bg-[#FAFBFC] hover:border-[#9CA3AF] hover:bg-[#F3F4F6]"
            }`}
            onClick={() => inputRef.current?.click()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5E7EB]/60 text-[#4B5563] mb-3">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m16 16-4-4-4 4" />
              </svg>
            </div>

            <p className="text-sm font-semibold text-[#111827]">
              Upload a leaf image
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">
              Drag &amp; drop or click to choose from your device
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              disabled={isAnalyzing}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#065F46] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#064E3B] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span>Choose Image</span>
            </button>
          </div>
        ) : (
          /* Preview State */
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            {/* Image display container */}
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#111827]/5 border border-[#E5E7EB]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl || ""}
                alt="Leaf Preview"
                onClick={() => setIsZoomOpen(true)}
                className="h-full w-full object-cover cursor-zoom-in"
              />

              {/* Close/Remove button on top-right */}
              <button
                type="button"
                onClick={onClearFile}
                className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-sm"
                title="Remove image"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* File info row */}
            <div className="flex items-center justify-between rounded-xl bg-[#F8FAFB] border border-[#E5E7EB] px-3 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <svg className="h-4 w-4 text-[#6B7280] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#111827] truncate">
                    {displayFileName}
                  </div>
                  <div className="text-[11px] text-[#6B7280]">
                    {displayDimensions} • {displayFileSize}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-lg border border-[#D1D5DB] bg-white px-2.5 py-1 text-xs font-medium text-[#374151] hover:bg-[#F3F4F6] shrink-0 ml-2 transition-colors"
              >
                Change Image
              </button>
            </div>

            {/* Analyze Action Button */}
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!modelReady || isAnalyzing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#065F46] py-3 text-sm font-bold text-white shadow-xs hover:bg-[#064E3B] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#D1D5DB] disabled:text-[#9CA3AF] transition-all"
            >
              {isAnalyzing ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Analyzing Leaf...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span>Analyze Image</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Supported formats footer */}
        <p className="mt-3 text-center text-xs text-[#9CA3AF]">
          JPG, PNG or WebP • Max size: 10 MB
        </p>
      </div>

      {/* Card 2: Try a sample image */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#065F46]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 2v7.31M14 9.3V2M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
            </svg>
            <span className="text-sm font-bold text-[#111827]">Try a sample image</span>
          </div>
          <span className="text-[11px] font-medium text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
            4 presets
          </span>
        </div>

        {/* 4 sample image cards */}
        <div className="grid grid-cols-4 gap-2">
          {sampleImages.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickSample(sample.path, sample.file)}
              className="group flex flex-col items-center rounded-xl border border-[#E5E7EB] p-2 hover:border-[#059669] hover:bg-[#ECFDF5]/40 hover:shadow-2xs transition-all text-center focus:outline-hidden focus:ring-2 focus:ring-[#059669]/20"
            >
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-[#F3F4F6] mb-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sample.path}
                  alt={sample.label}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <span className="text-[11px] font-bold text-[#111827] leading-tight truncate w-full text-center">
                {sample.label}
              </span>
              <span className="text-[10px] text-[#6B7280] leading-tight truncate w-full text-center mt-0.5">
                {sample.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomOpen && previewUrl && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-white p-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2 mb-2 px-2">
              <span className="text-xs font-semibold text-[#111827]">{displayFileName}</span>
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
              src={previewUrl}
              alt="Leaf Full View"
              className="max-h-[75vh] w-auto rounded-lg object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
