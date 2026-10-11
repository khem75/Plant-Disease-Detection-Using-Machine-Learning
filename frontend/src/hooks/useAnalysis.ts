"use client";

import { useCallback, useEffect, useState } from "react";
import { APP_CONFIG } from "../lib/config";
import { validateImageFile } from "../lib/validation";
import type { PredictionResult, ImageValidationResult } from "../types/analysis";

export type AnalysisStage = "idle" | "validating" | "preparing" | "inferring" | "explaining" | "success" | "error";

export function useAnalysis(onAnalysisSuccess?: () => void) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validation, setValidation] = useState<ImageValidationResult | null>(null);
  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  // Clean up object URLs
  const cleanupPreview = useCallback(() => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      cleanupPreview();
    };
  }, [cleanupPreview]);

  const selectFile = useCallback(async (file: File) => {
    cleanupPreview();
    setError(null);
    setResult(null);
    setStage("validating");

    const valResult = await validateImageFile(file);
    setValidation(valResult);

    if (!valResult.valid) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(valResult.error || "Invalid image file.");
      setStage("idle");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setStage("idle");
  }, [cleanupPreview]);

  const clearSelection = useCallback(() => {
    cleanupPreview();
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidation(null);
    setError(null);
    setResult(null);
    setStage("idle");
  }, [cleanupPreview]);

  const analyze = useCallback(async () => {
    if (stage !== "idle" && stage !== "success" && stage !== "error") return;

    setError(null);
    setStage("preparing");

    const fileToUpload = selectedFile;
    if (!fileToUpload) {
      setError("Please choose or drag a leaf image to analyze.");
      setStage("idle");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      setStage("inferring");
      const response = await fetch(`${APP_CONFIG.apiUrl}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorDetail = "Diagnosis service encountered an unexpected error.";
        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            errorDetail = errorData.detail;
          }
        } catch {
          // fallback to statusText
          errorDetail = response.statusText || errorDetail;
        }
        throw new Error(errorDetail);
      }

      setStage("explaining");
      const payload: PredictionResult = await response.json();
      setResult(payload);
      setStage("success");

      if (onAnalysisSuccess) {
        onAnalysisSuccess();
      }
    } catch (err) {
      setStage("error");
      const msg = err instanceof Error ? err.message : "Analysis could not be completed. Please check server connection.";
      setError(msg);
    }
  }, [selectedFile, stage, onAnalysisSuccess]);

  const resetForNewAnalysis = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return {
    selectedFile,
    previewUrl,
    validation,
    stage,
    isAnalyzing: stage === "preparing" || stage === "inferring" || stage === "explaining",
    error,
    result,
    selectFile,
    clearSelection,
    analyze,
    resetForNewAnalysis,
    setResult,
  };
}
