"use client";

import { useMemo, useState } from "react";
import { DISEASE_CATALOG } from "../../lib/diseaseData";

export function PlantGuideView() {
  const [search, setSearch] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("all");

  const catalogEntries = useMemo(() => {
    return Object.entries(DISEASE_CATALOG).map(([key, value]) => ({
      key,
      ...value,
    }));
  }, []);

  const crops = useMemo(() => {
    const set = new Set<string>();
    catalogEntries.forEach((e) => set.add(e.plant));
    return Array.from(set).sort();
  }, [catalogEntries]);

  const filtered = useMemo(() => {
    return catalogEntries.filter((e) => {
      const matchesSearch =
        search.trim() === "" ||
        e.plant.toLowerCase().includes(search.toLowerCase()) ||
        e.disease.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase());
      const matchesCrop = selectedCrop === "all" || e.plant.toLowerCase() === selectedCrop.toLowerCase();
      return matchesSearch && matchesCrop;
    });
  }, [catalogEntries, search, selectedCrop]);

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
          Plant Disease Reference Guide
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Browse symptoms, pathogen information, and management practices for all 38 cataloged crop conditions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search by crop, disease, or symptoms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#00875A] focus:outline-hidden"
        />

        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0F172A] focus:border-[#00875A] focus:outline-hidden"
          aria-label="Filter by crop"
        >
          <option value="all">All Crops ({crops.length})</option>
          {crops.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Disease Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div
            key={item.key}
            className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-2xs hover:border-[#CBD5E1] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-[#EAF7F1] px-2 py-0.5 text-[10px] font-semibold text-[#006B48]">
                {item.plant}
              </span>
              {item.disease.toLowerCase().includes("healthy") && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  Healthy
                </span>
              )}
            </div>

            <h3 className="mt-2 text-sm font-bold text-[#0F172A]">
              {item.disease}
            </h3>

            {item.pathogen && item.pathogen !== "None (Healthy)" && (
              <p className="mt-0.5 text-[11px] italic text-[#64748B]">
                {item.pathogen}
              </p>
            )}

            <p className="mt-2 text-xs leading-relaxed text-[#475569] line-clamp-3">
              {item.description}
            </p>

            <div className="mt-4 border-t border-[#F1F5F9] pt-3 text-[11px]">
              <span className="font-semibold text-[#0F172A]">Key Symptoms:</span>
              <ul className="mt-1 space-y-1 text-[#64748B]">
                {item.symptoms.slice(0, 2).map((s, idx) => (
                  <li key={idx} className="truncate">
                    • {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
