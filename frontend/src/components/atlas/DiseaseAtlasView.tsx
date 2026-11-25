"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Sprout,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronRight,
  X,
  ExternalLink,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { DISEASE_CATALOG } from "../../lib/diseaseData";
import type { DiseaseInfo } from "../../types/analysis";

interface DiseaseAtlasViewProps {
  onBackToAnalyze: () => void;
}

const CROP_CATEGORIES = [
  "All Crops",
  "Apple",
  "Blueberry",
  "Cherry",
  "Corn",
  "Grape",
  "Orange",
  "Peach",
  "Pepper",
  "Potato",
  "Raspberry",
  "Soybean",
  "Squash",
  "Strawberry",
  "Tomato",
];

export function DiseaseAtlasView({ onBackToAnalyze }: DiseaseAtlasViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("All Crops");
  const [healthFilter, setHealthFilter] = useState<"all" | "diseased" | "healthy">("all");
  const [selectedDisease, setSelectedDisease] = useState<{ key: string; info: DiseaseInfo } | null>(null);

  const diseaseEntries = useMemo(() => {
    return Object.entries(DISEASE_CATALOG).map(([key, info]) => ({
      key,
      info,
      isHealthy: info.disease.toLowerCase().includes("healthy"),
    }));
  }, []);

  const filteredDiseases = useMemo(() => {
    return diseaseEntries.filter(({ key, info, isHealthy }) => {
      // Filter by crop
      if (selectedCrop !== "All Crops") {
        if (!info.plant.toLowerCase().includes(selectedCrop.toLowerCase())) {
          return false;
        }
      }

      // Filter by health status
      if (healthFilter === "healthy" && !isHealthy) return false;
      if (healthFilter === "diseased" && isHealthy) return false;

      // Filter by query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = info.disease.toLowerCase().includes(q);
        const matchPlant = info.plant.toLowerCase().includes(q);
        const matchPathogen = info.pathogen.toLowerCase().includes(q);
        const matchDesc = info.description.toLowerCase().includes(q);
        const matchSymptoms = info.symptoms.some((s) => s.toLowerCase().includes(q));
        if (!matchTitle && !matchPlant && !matchPathogen && !matchDesc && !matchSymptoms) {
          return false;
        }
      }

      return true;
    });
  }, [diseaseEntries, selectedCrop, healthFilter, searchQuery]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Header & Controls */}
      <div className="rounded-2xl border border-[#DFE7DF] bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EBF0EB]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F3E8] text-[#176B3A]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#17261E]">Plant Disease &amp; Care Guide</h2>
                <span className="rounded-full bg-[#E8F3E8] text-[#176B3A] px-2 py-0.5 text-[10px] font-bold border border-[#C8E6C9]">
                  38 Conditions Cataloged
                </span>
              </div>
              <p className="text-xs text-[#65746A] mt-0.5">
                Browse 38 plant diseases and healthy crop leaves, with symptoms and practical care advice.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToAnalyze}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl bg-[#176B3A] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#073F28] transition"
          >
            <Sprout className="h-3.5 w-3.5" />
            <span>Check a Leaf</span>
          </button>
        </div>

        {/* Search & Quick Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#92A096]" />
            <input
              type="text"
              placeholder="Search by crop, disease name, pathogen, or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#DFE7DF] bg-[#F8FAF8] pl-9 pr-3.5 py-2 text-xs text-[#17261E] placeholder-[#92A096] focus:border-[#176B3A] focus:bg-white focus:outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#92A096] hover:text-[#17261E]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Condition Type Filter */}
          <div className="md:col-span-4 flex items-center gap-1.5 bg-[#F2F6F2] p-1 rounded-xl border border-[#DFE7DF]">
            <button
              type="button"
              onClick={() => setHealthFilter("all")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                healthFilter === "all" ? "bg-white text-[#17261E] shadow-2xs font-bold" : "text-[#65746A] hover:text-[#17261E]"
              }`}
            >
              All ({diseaseEntries.length})
            </button>
            <button
              type="button"
              onClick={() => setHealthFilter("diseased")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                healthFilter === "diseased" ? "bg-[#DC4545] text-white shadow-2xs font-bold" : "text-[#65746A] hover:text-[#17261E]"
              }`}
            >
              Diseased
            </button>
            <button
              type="button"
              onClick={() => setHealthFilter("healthy")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                healthFilter === "healthy" ? "bg-[#176B3A] text-white shadow-2xs font-bold" : "text-[#65746A] hover:text-[#17261E]"
              }`}
            >
              Healthy
            </button>
          </div>
        </div>

        {/* Crop Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-[#65746A] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Crops:
          </span>
          {CROP_CATEGORIES.map((crop) => (
            <button
              key={crop}
              type="button"
              onClick={() => setSelectedCrop(crop)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                selectedCrop === crop
                  ? "bg-[#176B3A] text-white font-bold shadow-2xs"
                  : "bg-[#F8FAF8] text-[#65746A] border border-[#DFE7DF] hover:bg-[#E8F3E8] hover:text-[#176B3A]"
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Disease Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredDiseases.map(({ key, info, isHealthy }) => (
          <div
            key={key}
            onClick={() => setSelectedDisease({ key, info })}
            className="group rounded-2xl border border-[#DFE7DF] bg-white p-4 shadow-xs hover:shadow-md hover:border-[#176B3A] transition cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#E8F3E8] px-2 py-0.5 text-[10px] font-bold text-[#176B3A]">
                  <Sprout className="h-3 w-3" />
                  {info.plant}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    isHealthy
                      ? "bg-[#E8F3E8] text-[#25834A] border-[#C8E6C9]"
                      : "bg-[#FEE2E2] text-[#DC4545] border-[#FECACA]"
                  }`}
                >
                  <span className={`h-1 w-1 rounded-full ${isHealthy ? "bg-[#25834A]" : "bg-[#DC4545]"}`} />
                  {isHealthy ? "Healthy" : "Infection"}
                </span>
              </div>

              <h3 className="text-sm font-black text-[#17261E] group-hover:text-[#176B3A] transition leading-snug">
                {info.disease}
              </h3>

              <p className="text-[10px] text-[#65746A] italic">
                {info.pathogen}
              </p>

              <p className="text-[11px] text-[#65746A] line-clamp-3 leading-relaxed">
                {info.description}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-[#EBF0EB] flex items-center justify-between text-xs text-[#176B3A] font-semibold">
              <span className="text-[10px] text-[#92A096]">
                {info.symptoms.length} symptoms documented
              </span>
              <span className="inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                <span>View Care Guide</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredDiseases.length === 0 && (
        <div className="rounded-2xl border border-[#DFE7DF] bg-white p-12 text-center shadow-xs">
          <AlertTriangle className="h-8 w-8 text-[#D97706] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#17261E]">No Matching Conditions Found</h3>
          <p className="text-xs text-[#65746A] mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or crop filter to explore other plant conditions.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCrop("All Crops");
              setHealthFilter("all");
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#E8F3E8] text-[#176B3A] px-3 py-1.5 text-xs font-semibold hover:bg-[#D4E8D4] transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 3. Detailed Pathogen Modal */}
      {selectedDisease && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedDisease(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-[#DFE7DF] space-y-4"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#EBF0EB]">
              <div>
                <div className="inline-flex items-center gap-1 rounded-md bg-[#E8F3E8] px-2 py-0.5 text-[10px] font-bold text-[#176B3A] mb-1">
                  <Sprout className="h-3 w-3" />
                  {selectedDisease.info.plant} Leaf
                </div>
                <h3 className="text-xl font-black text-[#17261E]">
                  {selectedDisease.info.disease}
                </h3>
                <p className="text-xs text-[#65746A] italic mt-0.5">
                  Cause: {selectedDisease.info.pathogen}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDisease(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F6F2] hover:bg-[#E8F0EA] text-[#17261E] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Pathological Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#176B3A]">
                About This Condition
              </h4>
              <p className="text-xs text-[#65746A] leading-relaxed bg-[#F8FAF8] p-3 rounded-xl border border-[#DFE7DF]">
                {selectedDisease.info.description}
              </p>
            </div>

            {/* Diagnostic Symptoms */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#176B3A]">
                Common Symptoms
              </h4>
              <ul className="space-y-1.5 text-xs text-[#17261E]">
                {selectedDisease.info.symptoms.map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-[#DFE7DF]">
                    <AlertTriangle className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
                    <span className="leading-snug">{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prevention & Care Protocol */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#176B3A]">
                Recommended Care &amp; Prevention
              </h4>
              <ul className="space-y-1.5 text-xs text-[#17261E]">
                {selectedDisease.info.prevention.map((prev, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#F2F6F2]/60 p-2 rounded-lg border border-[#DFE7DF]">
                    <CheckCircle2 className="h-4 w-4 text-[#176B3A] shrink-0 mt-0.5" />
                    <span className="leading-snug">{prev}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBF0EB]">
              <button
                type="button"
                onClick={() => setSelectedDisease(null)}
                className="rounded-xl border border-[#DFE7DF] px-4 py-2 text-xs font-semibold text-[#17261E] hover:bg-[#F2F6F2] transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDisease(null);
                  onBackToAnalyze();
                }}
                className="rounded-xl bg-[#176B3A] px-4 py-2 text-xs font-bold text-white hover:bg-[#073F28] transition"
              >
                Check a Leaf Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
