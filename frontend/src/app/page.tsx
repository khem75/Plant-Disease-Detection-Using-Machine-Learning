"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Sprout } from "lucide-react";
import { Sidebar } from "../components/layout/Sidebar";
import { UploadSection } from "../components/analysis/UploadSection";
import { ResultSection } from "../components/analysis/ResultSection";
import { PredictionHistoryTable } from "../components/history/PredictionHistoryTable";
import { useAnalysis } from "../hooks/useAnalysis";
import { useHistory } from "../hooks/useHistory";
import { APP_CONFIG } from "../lib/config";
import type { ModelHealthStatus, PredictionResult } from "../types/analysis";

type ActiveView = "analyze" | "history";

export default function HomePage() {
  const [activeView, setActiveView] = useState<ActiveView>("analyze");
  const [modelStatus, setModelStatus] = useState<ModelHealthStatus | null>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);

  // Real SQLite History hook
  const {
    history,
    loadHistory,
    clearAll: clearAllHistory,
    deleteItem: deleteHistoryItem,
  } = useHistory();

  // Analysis hook
  const {
    selectedFile,
    previewUrl,
    validation,
    isAnalyzing,
    error,
    result,
    selectFile,
    clearSelection,
    analyze,
    setResult,
  } = useAnalysis(() => {
    loadHistory();
    setErrorDismissed(false);
  });

  // Health check polling
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${APP_CONFIG.apiUrl}/health`);
      if (res.ok) {
        const data: ModelHealthStatus = await res.json();
        setModelStatus(data);
      } else {
        setModelStatus(null);
      }
    } catch {
      setModelStatus(null);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = window.setInterval(checkHealth, APP_CONFIG.healthPollIntervalMs);
    return () => window.clearInterval(interval);
  }, [checkHealth]);

  // When clicking a history item, inspect it
  const handleSelectHistoryItem = (historyResult: PredictionResult) => {
    setResult(historyResult);
    setActiveView("analyze");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const modelReady = Boolean(modelStatus?.model_available);
  const showError = Boolean(error && !errorDismissed);

  return (
    <div className="flex min-h-screen bg-[#F2F6F2] text-[#17261E]">
      {/* Dark Forest Green Sidebar (~216px) */}
      <div className="hidden md:block">
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          historyCount={history.length}
        />
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-[#DFE7DF] bg-[#073F28] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#176B3A] text-white">
              <Sprout className="h-4 w-4 text-[#2F8A4B]" />
            </div>
            <span className="text-xs font-bold text-white">Plant Disease Detection</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveView("analyze")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeView === "analyze" ? "bg-[#176B3A] text-white" : "text-[#A0B2A6]"
              }`}
            >
              Analyze
            </button>
            <button
              type="button"
              onClick={() => setActiveView("history")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeView === "history" ? "bg-[#176B3A] text-white" : "text-[#A0B2A6]"
              }`}
            >
              History
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-[1780px] w-full mx-auto space-y-4">
          {/* Main Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#DFE7DF]/70">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#17261E] tracking-tight">
                {activeView === "analyze" ? "Analyze Leaf Image" : "Prediction History"}
              </h1>
              <p className="text-xs text-[#65746A] mt-0.5">
                {activeView === "analyze"
                  ? "Upload a leaf image to detect plant disease using deep learning"
                  : "All recorded botanical disease analyses stored in the local SQLite database"}
              </p>
            </div>

            {/* Right Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DFE7DF] bg-white px-3.5 py-1.5 shadow-xs">
              <ShieldCheck className="h-4 w-4 text-[#176B3A]" />
              <div className="text-left">
                <span className="text-xs font-bold text-[#17261E] leading-none">
                  Accurate Detection
                </span>
                <span className="text-[10px] text-[#65746A] block leading-none mt-0.5">
                  for Healthier Crops
                </span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {showError && (
            <div className="flex items-center justify-between rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-xs text-[#DC4545] animate-fadeIn">
              <div className="flex items-center gap-2">
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorDismissed(true)}
                className="p-1 hover:bg-[#FECACA] rounded-lg transition"
              >
                ✕
              </button>
            </div>
          )}

          {/* ── 1. ANALYZE SCREEN (Default) ── */}
          {activeView === "analyze" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Analysis Workspace (Two Columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left Column: 33% (Upload + Example Images) */}
                <div className="lg:col-span-4 min-w-0">
                  <UploadSection
                    selectedFile={selectedFile}
                    previewUrl={previewUrl}
                    validation={validation}
                    isAnalyzing={isAnalyzing}
                    modelReady={modelReady}
                    onSelectFile={selectFile}
                    onClearFile={clearSelection}
                    onAnalyze={analyze}
                  />
                </div>

                {/* Right Column: 67% (Prediction Result + Grad-CAM + Advice) */}
                <div className="lg:col-span-8 min-w-0">
                  {result ? (
                    <ResultSection
                      result={result}
                      onAnalyzeAnother={clearSelection}
                      onViewHistory={() => setActiveView("history")}
                    />
                  ) : (
                    /* Initial Ready State */
                    <div className="rounded-2xl border border-[#DFE7DF] bg-white p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[460px]">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F3E8] text-[#176B3A] mb-3">
                        <Sprout className="h-7 w-7" />
                      </div>
                      <h3 className="text-base font-bold text-[#17261E]">Ready to Analyze Leaf</h3>
                      <p className="mt-1 text-xs text-[#65746A] max-w-sm">
                        Upload a leaf image on the left, click one of the example images, or select a record from the history table to view predictions and Grad-CAM explainability.
                      </p>
                      <div className="mt-5 flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFE7DF] bg-[#F2F6F2] px-3 py-1 font-medium text-[#17261E]">
                          <span className={`h-2 w-2 rounded-full ${modelReady ? "bg-[#25834A]" : "bg-[#F59E0B]"}`} />
                          EfficientNet-B0 {modelReady ? "Ready" : "Loading"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFE7DF] bg-[#F2F6F2] px-3 py-1 font-medium text-[#17261E]">
                          Grad-CAM Active
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Full-Width Prediction History */}
              <div className="w-full">
                <PredictionHistoryTable
                  history={history}
                  onSelectResult={handleSelectHistoryItem}
                  onViewAll={() => setActiveView("history")}
                  onDeleteItem={deleteHistoryItem}
                  isFullPage={false}
                />
              </div>
            </div>
          )}

          {/* ── 2. HISTORY SCREEN ── */}
          {activeView === "history" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-[#DFE7DF]">
                <button
                  type="button"
                  onClick={() => setActiveView("analyze")}
                  className="rounded-lg bg-[#176B3A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#073F28] transition flex items-center gap-1.5"
                >
                  <span>←</span>
                  <span>Back to Analyze</span>
                </button>
              </div>

              <PredictionHistoryTable
                history={history}
                onSelectResult={handleSelectHistoryItem}
                onDeleteItem={deleteHistoryItem}
                onClearAll={clearAllHistory}
                isFullPage={true}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
