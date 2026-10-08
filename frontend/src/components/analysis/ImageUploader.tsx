"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { APP_CONFIG } from "../../lib/config";

interface ImageUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function ImageUploader({ onFileSelected, disabled }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Paste handler for convenience
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            onFileSelected(file);
            break;
          }
        }
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disabled, onFileSelected]);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setIsDragging(false);
        return 0;
      }
      return next;
    });
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragCounter(0);

      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        onFileSelected(file);
        e.dataTransfer.clearData();
      }
    },
    [disabled, onFileSelected]
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
    // reset input so selecting the same file triggers change
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label="Upload leaf image by clicking or dragging and dropping"
      className={`group relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-all duration-200 outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-700/60 ${
        isDragging
          ? "border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20"
          : "border-[#D6D6CE] bg-[#FCFCFA] hover:border-emerald-700/40 hover:bg-[#F7F8F5]"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={APP_CONFIG.supportedMimeTypes.join(",")}
        onChange={handleInputChange}
        disabled={disabled}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Center Icon */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100/80 text-[#1B4332] shadow-xs group-hover:scale-105 transition-transform duration-200">
        <svg
          aria-hidden="true"
          className="h-6 w-6 stroke-[1.75]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Copy */}
      <h3 className="text-sm font-semibold text-[#111827]">
        {isDragging ? "Drop your leaf image here" : "Analyze a leaf"}
      </h3>
      <p className="mt-1 text-xs text-[#52525B]">
        Drag &amp; drop, or <span className="font-medium text-emerald-800 underline underline-offset-2">browse files</span>
      </p>

      {/* Format specs */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-[#71717A]">
        <span>JPG, PNG or WebP</span>
        <span aria-hidden="true">·</span>
        <span>Max {APP_CONFIG.maxFileSizeMB} MB</span>
        <span aria-hidden="true">·</span>
        <span className="hidden sm:inline">Paste with Ctrl+V</span>
      </div>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
        One leaf per photo for best accuracy
      </div>
    </div>
  );
}
