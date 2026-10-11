"use client";

import React, { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Upload, Sparkles, Image as ImageIcon, X, Sprout } from "lucide-react";
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

const SAMPLE_IMAGES = [
  {
    plant: "Tomato",
    disease: "Early Blight",
    path: "/samples/tomato_early_blight.jpg",
    filename: "tomato_early_blight.jpg",
  },
  {
    plant: "Tomato",
    disease: "Healthy",
    path: "/samples/tomato_healthy.jpg",
    filename: "tomato_healthy.jpg",
  },
  {
    plant: "Potato",
    disease: "Late Blight",
    path: "/samples/potato_late_blight.jpg",
    filename: "potato_late_blight.jpg",
  },
  {
    plant: "Apple",
    disease: "Scab",
    path: "/samples/apple_scab.jpg",
    filename: "apple_scab.jpg",
  },
  {
    plant: "Corn",
    disease: "Common Rust",
    path: "/samples/corn_common_rust.jpg",
    filename: "corn_common_rust.jpg",
  },
];

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
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSelectSample = async (samplePath: string, fileName: string) => {
    try {
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "image/jpeg" });
      onSelectFile(file);
    } catch (err) {
      console.error("Failed to load sample image", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Main Upload Card */}
      <div className="rounded-2xl border border-[#DFE7DF] bg-white p-5 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F3E8] text-[#176B3A] shrink-0 mt-0.5">
            <Upload className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#17261E]">Upload Leaf Image</h2>
            <p className="text-[11px] text-[#65746A]">
              Upload a clear leaf image for accurate disease detection
            </p>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleInputChange}
          className="hidden"
          id="leaf-upload-field"
        />

        {/* Dashed Drag & Drop Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? "border-[#176B3A] bg-[#E8F3E8]/70"
              : "border-[#D0DDD1] hover:border-[#176B3A] bg-[#F2F6F2]/50"
          }`}
        >
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F0EA] text-[#65746A]">
            <Upload className="h-5 w-5" />
          </div>

          <p className="text-xs font-bold text-[#17261E]">Drag and drop a leaf image here</p>
          <p className="text-[11px] text-[#65746A] mt-0.5">or click to browse</p>
          <p className="text-[10px] text-[#92A096] mt-1.5">JPG, PNG, JPEG (Max 5MB)</p>

          <div className="mt-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#176B3A] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#073F28] active:scale-95 disabled:opacity-50"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Choose Image
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validation && !validation.valid && (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-xs text-[#DC4545]">
            {validation.error}
          </div>
        )}

        {/* Selected Image Preview */}
        {previewUrl && (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-xl border border-[#DFE7DF] bg-[#F2F6F2]">
              {/* Close Button */}
              <button
                type="button"
                onClick={onClearFile}
                title="Remove image"
                className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition active:scale-90"
              >
                <X className="h-3.5 w-3.5" />
              </button>

            {/* Full Size Image Preview Container */}
            <div className="flex items-center justify-center w-full min-h-[240px] max-h-[380px] bg-[#F2F6F2] rounded-xl overflow-hidden p-2 border border-[#DFE7DF]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Selected Leaf"
                className="max-h-[360px] w-auto h-auto max-w-full object-contain mx-auto rounded-lg shadow-xs"
              />
            </div>
            </div>

            {/* File Info Bar with Replace Action */}
            {selectedFile && (
              <div className="rounded-lg border border-[#DFE7DF] bg-[#F2F6F2] px-3 py-2 flex items-center justify-between text-xs text-[#17261E]">
                <div className="flex items-center gap-2 truncate max-w-[190px]">
                  <ImageIcon className="h-4 w-4 text-[#65746A] shrink-0" />
                  <span className="truncate font-medium">{sanitizeFileName(selectedFile.name)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#65746A] text-[11px] shrink-0 font-medium">
                    {formatFileSize(selectedFile.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="rounded-md border border-[#DFE7DF] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#17261E] hover:bg-[#E8F3E8] transition"
                  >
                    Replace
                  </button>
                </div>
              </div>
            )}

            {/* Analyze Leaf Button */}
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing || !modelReady}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#176B3A] py-2.5 px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-[#073F28] active:scale-[0.98] disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Analyzing Leaf...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze Leaf</span>
                  <span className="text-sm font-normal">›</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 2. Example Images Card */}
      <div className="rounded-2xl border border-[#DFE7DF] bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#E8F3E8] text-[#176B3A]">
              <Sprout className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#17261E]">Example Images</h3>
              <p className="text-[10px] text-[#65746A]">Try these sample images</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#176B3A]">View All</span>
        </div>

        {/* 5 Compact Thumbnails */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {SAMPLE_IMAGES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample.path, sample.filename)}
              className="group flex flex-col items-center text-center p-1 rounded-lg border border-[#DFE7DF] hover:border-[#176B3A] hover:bg-[#E8F3E8]/40 transition"
            >
              <div className="w-full aspect-square rounded-md overflow-hidden bg-black/5 border border-[#EBF0EB] mb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sample.path}
                  alt={`${sample.plant} ${sample.disease}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <span className="text-[9px] font-bold text-[#17261E] leading-tight truncate w-full">
                {sample.plant}
              </span>
              <span className="text-[8px] text-[#65746A] leading-tight truncate w-full">
                {sample.disease}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
