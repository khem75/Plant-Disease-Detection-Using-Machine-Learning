"use client";

import type { HistoryItem, PredictionResult } from "../../types/analysis";
import { getFullImageUrl, formatDateOnly } from "../../lib/utils";
import { getLocalDiseaseMetadata } from "../../lib/diseaseData";

interface SidebarProps {
  activeView: "home" | "analyze" | "history";
  onSelectView: (view: "home" | "analyze" | "history") => void;
  recentHistory: HistoryItem[];
  onSelectHistoryItem: (result: PredictionResult) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenViva?: () => void;
}

// Student fallback history records that match the mockup when database is empty
const DEFAULT_RECENT_SAMPLES = [
  {
    id: 101,
    plant: "Peach",
    disease: "Bacterial Spot",
    confidence: 42.0,
    confidence_level: "low",
    date: "02 Oct 2026",
    thumb: "/samples/peach.jpg",
  },
  {
    id: 102,
    plant: "Grape",
    disease: "Leaf Blight",
    confidence: 46.5,
    confidence_level: "low",
    date: "02 Oct 2026",
    thumb: "/samples/grape.jpg",
  },
  {
    id: 103,
    plant: "Tomato",
    disease: "Early Blight",
    confidence: 88.4,
    confidence_level: "high",
    date: "28 Sep 2026",
    thumb: "/samples/tomato.jpg",
  },
  {
    id: 104,
    plant: "Apple",
    disease: "Healthy",
    confidence: 94.2,
    confidence_level: "high",
    date: "25 Sep 2026",
    thumb: "/samples/apple.jpg",
  },
  {
    id: 105,
    plant: "Pepper",
    disease: "Bacterial Spot",
    confidence: 65.8,
    confidence_level: "medium",
    date: "20 Sep 2026",
    thumb: "/samples/pepper.jpg",
  },
];

export function Sidebar({
  activeView,
  onSelectView,
  recentHistory,
  onSelectHistoryItem,
  isOpenMobile,
  onCloseMobile,
  onOpenViva,
}: SidebarProps) {
  const handleItemClick = (plant: string, disease: string, confidence: number, thumb: string, date: string) => {
    const meta = getLocalDiseaseMetadata(`${plant}___${disease.replace(/ /g, "_")}`);
    const res: PredictionResult = {
      id: Date.now(),
      plant,
      disease,
      pathogen: meta.pathogen,
      confidence,
      confidence_level: confidence >= 75 ? "high" : confidence >= 50 ? "medium" : "low",
      class_name: `${plant}___${disease.replace(/ /g, "_")}`,
      image_url: thumb,
      gradcam_image: thumb,
      heatmap_image: thumb,
      disease_info: meta,
      analyzed_at: date,
    };
    onSelectHistoryItem(res);
    onSelectView("home");
    if (onCloseMobile) onCloseMobile();
  };

  // Sidebar is no longer rendered in the main layout but kept for compatibility
  // It is now hidden by default and only used for mobile overlay if needed
  if (!isOpenMobile) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onCloseMobile}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
        aria-hidden="true"
      />

      <aside
        className="fixed top-16 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-[#E5E7EB] bg-white p-4 shadow-xl"
      >
        {/* Close button */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-[#111827]">Menu</span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1 text-[#6B7280] hover:bg-[#F3F4F6]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1" aria-label="Sidebar navigation">
          {[
            { key: "home" as const, label: "Home" },
            { key: "analyze" as const, label: "Analyze" },
            { key: "history" as const, label: "History" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onSelectView(item.key);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-colors ${
                activeView === item.key
                  ? "bg-[#ECFDF5] text-[#065F46] font-semibold"
                  : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Recent Analyses */}
        <div className="mt-6 flex flex-col flex-1 overflow-hidden">
          <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
            Recent Analyses
          </h3>

          <div className="flex-1 overflow-y-auto space-y-1.5">
            {recentHistory.length > 0
              ? recentHistory.slice(0, 5).map((item) => {
                  const thumb = getFullImageUrl(item.image_url || item.gradcam_image) || "/samples/peach.jpg";
                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        handleItemClick(
                          item.plant,
                          item.disease,
                          item.confidence,
                          item.image_url || thumb,
                          item.timestamp
                        )
                      }
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-[#F9FAFB] transition-colors"
                    >
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#F3F4F6] border border-[#E5E7EB]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb} alt={item.plant} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-[#111827] truncate">{item.plant}</div>
                        <div className="text-xs text-[#6B7280] truncate">{item.disease}</div>
                      </div>
                    </div>
                  );
                })
              : DEFAULT_RECENT_SAMPLES.slice(0, 4).map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() =>
                      handleItemClick(
                        sample.plant,
                        sample.disease,
                        sample.confidence,
                        sample.thumb,
                        sample.date
                      )
                    }
                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#F3F4F6] border border-[#E5E7EB]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sample.thumb} alt={sample.plant} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[#111827] truncate">{sample.plant}</div>
                      <div className="text-xs text-[#6B7280] truncate">{sample.disease}</div>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Model Working card */}
        {onOpenViva && (
          <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <button
              type="button"
              onClick={() => {
                onOpenViva();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#065F46] py-2 text-sm font-semibold text-white hover:bg-[#064E3B] transition-colors"
            >
              <span>⚙️</span>
              <span>Model Working</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
