"use client";

import { useEffect, useState, useCallback } from "react";
import { TopNav } from "../components/layout/TopNav";
import { UploadSection } from "../components/analysis/UploadSection";
import { ResultSection } from "../components/analysis/ResultSection";
import { HistoryView } from "../components/history/HistoryView";
import { HeroBanner } from "../components/home/HeroBanner";
import { ProjectVivaModal } from "../components/layout/ProjectVivaModal";
import { useAnalysis } from "../hooks/useAnalysis";
import { useHistory } from "../hooks/useHistory";
import { APP_CONFIG } from "../lib/config";
import type { ModelHealthStatus, PredictionResult } from "../types/analysis";

type ActiveView = "home" | "analyze" | "history";

export default function HomePage() {
  const [activeView, setActiveView] = useState<ActiveView>("analyze");
  const [modelStatus, setModelStatus] = useState<ModelHealthStatus | null>(null);
  const [isVivaOpen, setIsVivaOpen] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);

  // History hook
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

  // Health status check
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

  const handleSelectHistoryItem = (historyResult: PredictionResult) => {
    setResult(historyResult);
    setActiveView("analyze");
  };

  const handleDismissError = () => {
    setErrorDismissed(true);
  };

  const modelReady = Boolean(modelStatus?.model_available);
  const showError = error && !errorDismissed;

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFBFC] text-[#111827]">
      {/* Top Navigation */}
      <TopNav
        activeView={activeView}
        onSelectView={setActiveView}
        modelStatus={modelStatus}
        isAnalyzing={isAnalyzing}
        onOpenViva={() => setIsVivaOpen(true)}
      />

      {/* Main Content */}
      <main className="mx-auto w-full max-w-[2300px] flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 sm:py-8">
        {/* Error notification banner */}
        {showError && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm animate-fadeIn">
            <div className="flex items-center gap-2.5 text-[#991B1B]">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
            <button
              type="button"
              onClick={handleDismissError}
              className="shrink-0 ml-4 rounded-lg p-1 text-[#991B1B] hover:bg-[#FECACA] transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* ── HOME VIEW ── */}
        {activeView === "home" && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            <HeroBanner />
            {/* Two column: Upload + Result with optimized proportional scaling */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className={result ? "lg:col-span-5 xl:col-span-4 2xl:col-span-4" : "lg:col-span-6"}>
                <h2 className="text-2xl font-bold text-[#111827] mb-1">Analyze a Leaf</h2>
                <p className="text-sm text-[#6B7280] mb-5">
                  Upload a clear photo of a single plant leaf to identify possible diseases.
                </p>
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
              <div className={result ? "lg:col-span-7 xl:col-span-8 2xl:col-span-8" : "lg:col-span-6"}>
                {result ? (
                  <ResultSection
                    result={result}
                    onAnalyzeAnother={() => {
                      clearSelection();
                      setActiveView("analyze");
                    }}
                    onViewHistory={() => setActiveView("history")}
                  />
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs">
                      <div className="flex items-center justify-between pb-3.5 border-b border-[#F3F4F6] mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#065F46] font-bold text-sm">
                            🌱
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-[#111827]">
                              Diagnostic Intelligence Center
                            </h3>
                            <p className="text-xs text-[#6B7280]">
                              Automated foliar pathology screening with deep learning
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-semibold text-[#065F46] border border-[#A7F3D0]">
                          38 Classes
                        </span>
                      </div>

                      <div className="space-y-3.5">
                        <div className="flex items-start gap-3 rounded-xl border border-[#F3F4F6] bg-[#FAFBFC] p-3.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-xs font-bold text-[#2563EB]">
                            01
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-[#111827]">
                              Instant Neural Classification
                            </h4>
                            <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                              EfficientNet-B0 compound-scaled convolutional backbone trained on 54,000+ foliar samples with calibrated softmax probability scoring.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-[#F3F4F6] bg-[#FAFBFC] p-3.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5] text-xs font-bold text-[#065F46]">
                            02
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-[#111827]">
                              Grad-CAM Visual Heatmaps
                            </h4>
                            <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                              Spatial feature attribution highlights necrotic spots and chlorosis, verifying the model focuses on authentic plant pathology.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-[#F3F4F6] bg-[#FAFBFC] p-3.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7] text-xs font-bold text-[#D97706]">
                            03
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-[#111827]">
                              Agronomic Recommendations &amp; PDF Report
                            </h4>
                            <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                              Actionable cultural and isolation guidelines paired with one-click exportable pathology laboratory reports.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFB] p-3.5 flex items-center justify-between text-xs text-[#6B7280]">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                          <span>Inference pipeline ready (~38ms)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsVivaOpen(true)}
                          className="font-semibold text-[#065F46] hover:underline"
                        >
                          Model details →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYZE VIEW ── */}
        {activeView === "analyze" && (
          <div className="animate-fadeIn">
            {/* Page header with circular leaf icon */}
            <div className="mb-6 flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D1FAE5] text-[#065F46] shrink-0">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
                  Analyze a Leaf
                </h1>
                <p className="text-sm text-[#6B7280] mt-0.5">
                  Upload a clear photo of a single plant leaf to identify possible diseases.
                </p>
              </div>
            </div>

            {/* Two column layout with proportional scaling */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left: Upload (5 cols on lg, 4 on xl) */}
              <div className="lg:col-span-5 xl:col-span-4 min-w-0">
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

              {/* Right: Result (7 cols on lg, 8 on xl) */}
              <div className="lg:col-span-7 xl:col-span-8 min-w-0">
                {result ? (
                  <ResultSection
                    result={result}
                    onAnalyzeAnother={() => clearSelection()}
                    onViewHistory={() => setActiveView("history")}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-white py-16 px-8 text-center min-h-[460px]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#065F46] mb-4">
                      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#111827]">Diagnostic Result Pending</h3>
                    <p className="mt-1 text-sm text-[#6B7280] max-w-sm">
                      Select a leaf image or click one of the quick presets on the left, then click &quot;Analyze Image&quot; to inspect the diagnosis and Grad-CAM heatmap.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-[#6B7280]">
                      <span className="flex items-center gap-1.5 rounded-lg bg-[#F8FAFB] border border-[#E5E7EB] px-3 py-1.5 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        EfficientNet-B0 Ready
                      </span>
                      <span className="flex items-center gap-1.5 rounded-lg bg-[#F8FAFB] border border-[#E5E7EB] px-3 py-1.5 font-medium">
                        <span>🔬</span>
                        Grad-CAM Heatmap Enabled
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY VIEW ── */}
        {activeView === "history" && (
          <div className="animate-fadeIn">
            <HistoryView
              history={history}
              onSelectResult={handleSelectHistoryItem}
              onBackToAnalyze={() => setActiveView("analyze")}
              onDeleteItem={deleteHistoryItem}
              onClearAll={clearAllHistory}
            />
          </div>
        )}
      </main>

      {/* Model Architecture & Working Mechanism Modal */}
      <ProjectVivaModal
        isOpen={isVivaOpen}
        onClose={() => setIsVivaOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white py-4 text-center text-xs text-[#9CA3AF]">
        <div className="mx-auto w-full max-w-[2300px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          Plant Disease Detection · Machine Learning &amp; Computer Vision Project · EfficientNet-B0 + Grad-CAM
        </div>
      </footer>
    </div>
  );
}
