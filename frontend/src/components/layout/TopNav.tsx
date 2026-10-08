"use client";

import { useState } from "react";
import type { ModelHealthStatus } from "../../types/analysis";

interface TopNavProps {
  activeView: "home" | "analyze" | "history";
  onSelectView: (view: "home" | "analyze" | "history") => void;
  modelStatus: ModelHealthStatus | null;
  isAnalyzing: boolean;
  onOpenViva?: () => void;
}

export function TopNav({
  activeView,
  onSelectView,
  modelStatus,
  isAnalyzing,
  onOpenViva,
}: TopNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { key: "home" | "analyze" | "history"; label: string; icon: React.ReactNode }[] = [
    {
      key: "home",
      label: "Home",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      key: "analyze",
      label: "Analyze",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      key: "history",
      label: "History",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[2300px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#065F46] text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 20A7 7 0 0 1 4 13C4 8 8 3 13 3c3.87 0 7 2.13 7 6 0 4-3 11-9 11Z" />
              <path d="M11 13c1.5 0 3-1 4-3" />
              <path d="M11 20v-7" />
            </svg>
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight text-[#111827] leading-tight">
              Plant Disease Detection
            </h1>
            <p className="text-[11px] font-medium text-[#9CA3AF] leading-none hidden sm:block">
              Using Machine Learning
            </p>
          </div>
        </div>

        {/* Center: Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-2 h-16" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectView(item.key)}
              className={`relative flex h-full items-center gap-2 px-3.5 text-sm transition-colors ${
                activeView === item.key
                  ? "text-[#111827] font-bold"
                  : "text-[#6B7280] hover:text-[#111827] font-medium"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {activeView === item.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-[#065F46]" />
              )}
            </button>
          ))}
        </nav>

        {/* Right: Status + Model Working */}
        <div className="flex items-center gap-3">
          {onOpenViva && (
            <button
              type="button"
              onClick={onOpenViva}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] hover:text-[#065F46] transition-colors shadow-2xs"
              title="Explore Model Architecture, Inference Pipeline & Grad-CAM Working"
            >
              <span>⚙️</span>
              <span>Model Working</span>
            </button>
          )}

          {/* Model Status */}
          {isAnalyzing ? (
            <div className="flex items-center gap-2 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1.5 text-xs font-medium text-[#065F46]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34D399] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#059669]" />
              </span>
              <span>Analyzing</span>
            </div>
          ) : !modelStatus || !modelStatus.model_available ? (
            <div className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-xs font-medium text-[#9CA3AF]">
              <span className="h-2 w-2 rounded-full bg-[#D1D5DB]" />
              <span>Model Offline</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1.5 text-xs font-medium text-[#065F46]">
              <span className="h-2 w-2 rounded-full bg-[#059669]" />
              <span>Model Ready</span>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white animate-fadeIn">
          <nav className="flex flex-col p-2 gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelectView(item.key);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  activeView === item.key
                    ? "bg-[#ECFDF5] text-[#065F46] font-semibold"
                    : "text-[#6B7280] hover:bg-[#F9FAFB]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            {onOpenViva && (
              <button
                type="button"
                onClick={() => {
                  onOpenViva();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] hover:text-[#065F46]"
              >
                <span>⚙️</span>
                <span>Model Working</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
