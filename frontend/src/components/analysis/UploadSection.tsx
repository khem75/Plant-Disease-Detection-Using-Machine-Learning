"use client";

import React, { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Upload, UploadCloud, Leaf, Sparkles, Image as ImageIcon, X, Sprout, CheckCircle2, ScanLine } from "lucide-react";
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
    badge: "Fungal",
  },
  {
    plant: "Tomato",
    disease: "Healthy",
    path: "/samples/tomato_healthy.jpg",
    filename: "tomato_healthy.jpg",
    badge: "Normal",
  },
  {
    plant: "Potato",
    disease: "Late Blight",
    path: "/samples/potato_late_blight.jpg",
    filename: "potato_late_blight.jpg",
    badge: "Oomycete",
  },
  {
    plant: "Apple",
    disease: "Scab",
    path: "/samples/apple_scab.jpg",
    filename: "apple_scab.jpg",
    badge: "Fungal",
  },
  {
    plant: "Corn",
    disease: "Common Rust",
    path: "/samples/corn_common_rust.jpg",
    filename: "corn_common_rust.jpg",
    badge: "Rust Fungi",
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
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8F3E8] to-[#CDE4CE] text-[#176B3A] shrink-0 mt-0.5 shadow-2xs ring-1 ring-[#176B3A]/20">
            <Upload className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#17261E]">Upload Leaf Photo</h2>
            <p className="text-[11px] text-[#65746A]">
              Upload a clear photo of an infected or healthy leaf to diagnose diseases and get care advice
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
          className={`group cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${isDragging
              ? "border-[#176B3A] bg-[#E8F3E8]/80 shadow-md scale-[1.01]"
              : "border-[#D0DDD1] hover:border-[#176B3A] bg-gradient-to-b from-[#F8FAF8] to-[#F2F6F2]/70 hover:shadow-xs"
            }`}
        >
          {/* Modern Botanical Dropzone Icon Badge */}
          <div className="mx-auto mb-3 relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-[#E8F3E8] via-[#E2EFE3] to-[#D0E6D2] border border-[#BEDABE] shadow-xs group-hover:scale-105 group-hover:border-[#176B3A] group-hover:shadow-md transition-all duration-300">
            <div className="relative flex items-center justify-center">
              <UploadCloud className="h-7 w-7 text-[#176B3A] stroke-[2.2]" />
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#176B3A] text-white shadow-xs ring-2 ring-white">
                <Leaf className="h-2.5 w-2.5 fill-white text-white" />
              </span>
            </div>
          </div>

          <p className="text-xs font-bold text-[#17261E] group-hover:text-[#176B3A] transition">
            Drag &amp; drop a leaf image here
          </p>
          <p className="text-[11px] text-[#65746A] mt-0.5">or browse from your local files</p>
          <p className="text-[10px] text-[#92A096] mt-1.5 font-medium">Supports JPG, PNG, JPEG, WEBP (Max 5MB)</p>

          <div className="mt-3.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#176B3A] to-[#0E4C27] hover:from-[#13592F] hover:to-[#0A381C] px-4 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Choose Image</span>
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validation && !validation.valid && (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-xs text-[#DC4545] animate-fadeIn flex items-start gap-2">
            <span className="text-sm">⚠</span>
            <span>{validation.error}</span>
          </div>
        )}

        {/* Selected Image Preview */}
        {previewUrl && (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl border border-[#DFE7DF] bg-[#F2F6F2]">
              {/* Close Button */}
              <button
                type="button"
                onClick={onClearFile}
                title="Remove image"
                className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black transition active:scale-90 shadow-md backdrop-blur-xs"
              >
                <X className="h-4 w-4" />
              </button>

              {/* High-Resolution Preview Container with Specimen Crosshairs */}
              <div className="relative flex items-center justify-center w-full min-h-[250px] max-h-[380px] bg-gradient-to-b from-[#F8FAF8] to-[#F2F6F2] rounded-2xl overflow-hidden p-3 border border-[#DFE7DF]">
                {/* Specimen Frame Watermark */}
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-[#073F28]/85 text-white text-[9px] font-bold backdrop-blur-xs">
                  Leaf Ready
                </div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Selected Leaf"
                  className="max-h-[350px] w-auto h-auto max-w-full object-contain mx-auto rounded-xl shadow-xs"
                />
              </div>
            </div>

            {/* File Info Bar with Replace Action */}
            {selectedFile && (
              <div className="rounded-xl border border-[#DFE7DF] bg-[#F8FAF8] px-3.5 py-2.5 flex items-center justify-between text-xs text-[#17261E] shadow-2xs">
                <div className="flex items-center gap-2 truncate max-w-[200px]">
                  <ImageIcon className="h-4 w-4 text-[#176B3A] shrink-0" />
                  <span className="truncate font-semibold">{sanitizeFileName(selectedFile.name)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#65746A] text-[11px] shrink-0 font-medium font-mono">
                    {formatFileSize(selectedFile.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="rounded-lg border border-[#DFE7DF] bg-white px-2.5 py-1 text-[10px] font-bold text-[#17261E] hover:bg-[#E8F3E8] hover:text-[#176B3A] transition shadow-2xs"
                  >
                    Replace
                  </button>
                </div>
              </div>
            )}

            {/* Analyze Leaf Button & Progress Status */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                title="Check leaf health"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#176B3A] via-[#1A733E] to-[#0A4324] hover:from-[#13592F] hover:to-[#06331B] py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Examining leaf...</span>
                  </>
                ) : (
                  <>
                    <ScanLine className="h-4 w-4 text-[#86EFAC]" />
                    <span>Check This Leaf</span>
                    <span className="text-sm font-normal text-[#86EFAC]">›</span>
                  </>
                )}
              </button>

              {/* Progress Indicator */}
              {isAnalyzing && (
                <div className="rounded-xl border border-[#D1E4D3] bg-[#EBF3EC] p-3 text-left space-y-2 animate-fadeIn shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#176B3A]">
                    <span>Checking Leaf Health...</span>
                    <span className="text-[10px] animate-pulse">Analyzing Surface</span>
                  </div>
                  {/* Animated Progress Bar */}
                  <div className="h-1.5 w-full bg-[#DFE7DF] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#176B3A] via-[#2F8A4B] to-[#10B981] animate-pulse rounded-full w-full" />
                  </div>
                  <div className="space-y-1 text-[10px] text-[#2F6B45]">
                    <p className="flex items-center gap-1.5 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#176B3A] animate-ping" />
                      Scanning for leaf spots, discoloration, and damage...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Backend offline / warming warning */}
            {!modelReady && !isAnalyzing && (
              <p className="text-center text-[10px] text-[#D97706] font-medium bg-[#FFFBEB] p-2 rounded-lg border border-[#FDE68A]">
                ⚡ Connecting to diagnostic service... You can click &quot;Check This Leaf&quot; anytime.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. Example Images Card */}
      <div className="rounded-2xl border border-[#DFE7DF] bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#E8F3E8] text-[#176B3A] shadow-2xs">
              <Sprout className="h-3.5 w-3.5 text-[#176B3A]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#17261E]">Sample Leaves to Test</h3>
              <p className="text-[10px] text-[#65746A]">Click any photo to test the scanner</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#176B3A] bg-[#E8F3E8] px-2 py-0.5 rounded-full border border-[#C8E6C9]">
            5 Samples
          </span>
        </div>

        {/* 5 Compact Thumbnails with Realistic Preview */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {SAMPLE_IMAGES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample.path, sample.filename)}
              className="group flex flex-col items-center text-center p-1 rounded-xl border border-[#DFE7DF] hover:border-[#176B3A] hover:bg-[#E8F3E8]/40 transition shadow-2xs"
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-black/5 border border-[#EBF0EB] mb-1 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sample.path}
                  alt={`${sample.plant} ${sample.disease}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[7px] font-bold py-0.5 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {sample.badge}
                </span>
              </div>
              <span className="text-[9px] font-bold text-[#17261E] leading-tight truncate w-full group-hover:text-[#176B3A]">
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
