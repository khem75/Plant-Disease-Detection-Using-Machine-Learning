"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Sprout, BookOpen, Clock, Leaf, ScanLine, Sparkles, CheckCircle2 } from "lucide-react";
import { Sidebar } from "../components/layout/Sidebar";
import { UploadSection } from "../components/analysis/UploadSection";
import { ResultSection } from "../components/analysis/ResultSection";
import { PredictionHistoryTable } from "../components/history/PredictionHistoryTable";
import { DiseaseAtlasView } from "../components/atlas/DiseaseAtlasView";
import { useAnalysis } from "../hooks/useAnalysis";
import { useHistory } from "../hooks/useHistory";
import { APP_CONFIG } from "../lib/config";
import type { ModelHealthStatus, PredictionResult } from "../types/analysis";

type ActiveView = "analyze" | "history" | "atlas";

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

  // Quick sample loader for the ready state
  const handleTestSample = async (samplePath: string, fileName: string) => {
    try {
      checkHealth();
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "image/jpeg" });
      selectFile(file);
    } catch (err) {
      console.error("Failed to load sample", err);
    }
  };

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

  const modelReady = Boolean(modelStatus?.model_available);

  useEffect(() => {
    checkHealth();
    // Fast polling (1200ms) while server is warming up, slow (30s) once online
    const intervalTime = modelReady ? 30000 : 1200;
    const interval = window.setInterval(checkHealth, intervalTime);
    return () => window.clearInterval(interval);
  }, [checkHealth, modelReady]);

  // When clicking a history item, inspect it
  const handleSelectHistoryItem = (historyResult: PredictionResult) => {
    setResult(historyResult);
    setActiveView("analyze");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveView("analyze")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                activeView === "analyze" ? "bg-[#176B3A] text-white" : "text-[#A0B2A6]"
              }`}
            >
              Analyze
            </button>
            <button
              type="button"
              onClick={() => setActiveView("history")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                activeView === "history" ? "bg-[#176B3A] text-white" : "text-[#A0B2A6]"
              }`}
            >
              History
            </button>
            <button
              type="button"
              onClick={() => setActiveView("atlas")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                activeView === "atlas" ? "bg-[#176B3A] text-white" : "text-[#A0B2A6]"
              }`}
            >
              Atlas
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 max-w-[1780px] w-full mx-auto space-y-4">
          {/* Main Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#DFE7DF]/70 no-print">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#17261E] tracking-tight">
                {activeView === "analyze"
                  ? "Check Plant Health"
                  : activeView === "history"
                  ? "Past Leaf Scans"
                  : "Plant Disease Guide"}
              </h1>
              <p className="text-xs text-[#65746A] mt-0.5">
                {activeView === "analyze"
                  ? "Take or upload a photo of a leaf to identify diseases, see affected areas, and get care advice"
                  : activeView === "history"
                  ? "Review all your previous leaf scans and diagnoses"
                  : "Browse 38 common leaf diseases across 14 crops with symptoms and organic treatments"}
              </p>
            </div>

            {/* Right Top Badge: Friendly Assistant Indicator */}
            <div className="inline-flex items-center gap-2.5 rounded-2xl border border-[#DFE7DF] bg-white/95 backdrop-blur-xs px-3.5 py-2 shadow-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8F3E8] to-[#D0E6D2] text-[#176B3A] ring-1 ring-[#176B3A]/20 shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-[#176B3A]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#17261E] leading-none">
                    Plant Health Assistant
                  </span>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                </div>
                <span className="text-[10px] text-[#65746A] block leading-none mt-1">
                  Ready to scan 38 crop conditions
                </span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {showError && (
            <div className="flex items-center justify-between rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-xs text-[#DC4545] animate-fadeIn no-print">
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
                <div className="lg:col-span-4 min-w-0 no-print">
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
                    /* Initial Ready State - Friendly & Humanized */
                    <div className="rounded-2xl border border-[#DFE7DF] bg-gradient-to-b from-white to-[#F8FAF8] p-5 sm:p-7 shadow-xs space-y-5 min-h-[440px] no-print flex flex-col justify-between">
                      {/* Top Header */}
                      <div className="text-center space-y-1 max-w-md mx-auto">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8F3E8] to-[#CDE4CE] text-[#176B3A] shadow-xs ring-1 ring-[#176B3A]/25 mb-1">
                          <Sprout className="h-5 w-5 text-[#176B3A]" />
                        </div>
                        <h3 className="text-base font-black text-[#17261E] tracking-tight">
                          Check your plant in 3 simple steps
                        </h3>
                        <p className="text-xs text-[#65746A]">
                          Upload a photo showing leaf spots or damage, and we&apos;ll help you diagnose and treat it.
                        </p>
                      </div>

                      {/* 3 Human Step Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-xl border border-[#DFE7DF] bg-white p-3.5 text-center shadow-2xs hover:border-[#176B3A] transition flex flex-col items-center justify-center">
                          <div className="h-7 w-7 rounded-full bg-[#E8F3E8] text-[#176B3A] flex items-center justify-center font-bold text-xs mb-2">
                            1
                          </div>
                          <span className="text-xs font-bold text-[#17261E]">Snap a Leaf Photo</span>
                          <p className="text-[10px] text-[#65746A] mt-1 leading-tight">
                            Take a clear picture of any spots, discoloration, or wilted tissue.
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#DFE7DF] bg-white p-3.5 text-center shadow-2xs hover:border-[#176B3A] transition flex flex-col items-center justify-center">
                          <div className="h-7 w-7 rounded-full bg-[#E8F3E8] text-[#176B3A] flex items-center justify-center font-bold text-xs mb-2">
                            2
                          </div>
                          <span className="text-xs font-bold text-[#17261E]">See Infected Areas</span>
                          <p className="text-[10px] text-[#65746A] mt-1 leading-tight">
                            We highlight the damaged spots with an easy-to-read color heatmap.
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#DFE7DF] bg-white p-3.5 text-center shadow-2xs hover:border-[#176B3A] transition flex flex-col items-center justify-center">
                          <div className="h-7 w-7 rounded-full bg-[#E8F3E8] text-[#176B3A] flex items-center justify-center font-bold text-xs mb-2">
                            3
                          </div>
                          <span className="text-xs font-bold text-[#17261E]">Get Treatment Advice</span>
                          <p className="text-[10px] text-[#65746A] mt-1 leading-tight">
                            Follow simple, practical steps to protect your crop from spreading.
                          </p>
                        </div>
                      </div>

                      {/* Supported Crops Note */}
                      <div className="rounded-xl bg-[#F2F6F2]/70 border border-[#DFE7DF] px-4 py-2 text-center text-xs text-[#65746A]">
                        Supports <strong className="text-[#17261E]">14 common crops</strong> including Tomato, Potato, Apple, Corn, Grape, Pepper, Strawberry &amp; more.
                      </div>

                      {/* System Status Badges & Quick Action */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#DFE7DF]/70 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFE7DF] bg-white px-2.5 py-1 text-xs font-semibold text-[#17261E]">
                            <span className={`h-2 w-2 rounded-full ${modelReady ? "bg-[#25834A]" : "bg-[#F59E0B]"}`} />
                            Scanner {modelReady ? "Ready" : "Loading"}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFE7DF] bg-white px-2.5 py-1 text-xs font-semibold text-[#17261E]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#176B3A]" />
                            Heatmap Active
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTestSample("/samples/tomato_early_blight.jpg", "tomato_early_blight.jpg")}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#176B3A] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#073F28] transition active:scale-95 cursor-pointer"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-[#86EFAC]" />
                          <span>Try a Sample Leaf</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Full-Width Prediction History */}
              <div className="w-full no-print">
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
            <div className="space-y-4 animate-fadeIn no-print">
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

          {/* ── 3. DISEASE ATLAS SCREEN ── */}
          {activeView === "atlas" && (
            <div className="no-print">
              <DiseaseAtlasView onBackToAnalyze={() => setActiveView("analyze")} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
