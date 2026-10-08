"use client";

import { APP_CONFIG } from "../../lib/config";
import type { ModelHealthStatus } from "../../types/analysis";
import { ModelStatusBadge } from "./ModelStatusBadge";

interface HeaderProps {
  modelStatus: ModelHealthStatus | null;
  isAnalyzing: boolean;
  historyCount: number;
  activeView: "analysis" | "history";
  onSelectView: (view: "analysis" | "history") => void;
  onNewAnalysis: () => void;
}

export function Header({
  modelStatus,
  isAnalyzing,
  historyCount,
  activeView,
  onSelectView,
  onNewAnalysis,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E8E8E2] bg-[#FAFAF8]/95 backdrop-blur-xs transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectView("analysis")}
            className="flex items-center gap-2.5 text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-700/50 rounded-lg p-0.5"
            aria-label="Plant Health home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B4332] text-white shadow-xs">
              {/* Minimal leaf glyph */}
              <svg
                aria-hidden="true"
                className="h-4.5 w-4.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20A7 7 0 0 1 4 13C4 8 8 3 13 3c3.87 0 7 2.13 7 6 0 4-3 11-9 11Z" />
                <path d="M11 13c1.5 0 3-1 4-3" />
                <path d="M11 20v-7" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-[#111827]">
                {APP_CONFIG.appName}
              </span>
              <p className="hidden text-xs text-[#64748B] sm:block">
                {APP_CONFIG.appSubtitle}
              </p>
            </div>
          </button>
        </div>

        {/* Right side: navigation & model status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ModelStatusBadge status={modelStatus} isAnalyzing={isAnalyzing} />

          <div className="h-4 w-px bg-slate-200" aria-hidden="true" />

          <nav className="flex items-center gap-1" aria-label="Main navigation">
            <button
              onClick={() => {
                onSelectView("analysis");
                onNewAnalysis();
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeView === "analysis"
                  ? "bg-[#1B4332] text-white shadow-xs"
                  : "text-[#52525B] hover:bg-slate-200/60 hover:text-[#111827]"
              }`}
            >
              New analysis
            </button>

            <button
              onClick={() => onSelectView("history")}
              className={`relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeView === "history"
                  ? "bg-[#1B4332] text-white shadow-xs"
                  : "text-[#52525B] hover:bg-slate-200/60 hover:text-[#111827]"
              }`}
            >
              <span>History</span>
              {historyCount > 0 && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-semibold tabular-nums ${
                    activeView === "history"
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {historyCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
