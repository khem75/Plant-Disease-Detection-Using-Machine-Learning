"use client";

import { APP_CONFIG } from "../../lib/config";
import type { ModelHealthStatus } from "../../types/analysis";

interface SettingsViewProps {
  modelStatus: ModelHealthStatus | null;
  onClearHistory: () => void;
  historyCount: number;
}

export function SettingsView({
  modelStatus,
  onClearHistory,
  historyCount,
}: SettingsViewProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
          Application Settings &amp; Diagnostics
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Configuration thresholds, model connection health, and local database storage.
        </p>
      </div>

      {/* Model Connection Status */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A]">Model &amp; API Service</h3>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
            <span className="text-[#64748B]">Backend Endpoint:</span>
            <span className="font-mono text-[#0F172A]">{APP_CONFIG.apiUrl}</span>
          </div>
          <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
            <span className="text-[#64748B]">Inference Status:</span>
            <span className={`font-semibold ${modelStatus?.model_available ? "text-[#00875A]" : "text-amber-600"}`}>
              {modelStatus?.model_available ? "Online (Healthy)" : "Unavailable"}
            </span>
          </div>
          <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
            <span className="text-[#64748B]">Supported Classes:</span>
            <span className="font-semibold text-[#0F172A]">{modelStatus?.classes || 38} Botanical Classes</span>
          </div>
          <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
            <span className="text-[#64748B]">Backbone Architecture:</span>
            <span className="font-semibold text-[#0F172A]">{APP_CONFIG.modelInfo.name}</span>
          </div>
        </div>
      </div>

      {/* Confidence Thresholds */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-[#0F172A]">Calibrated Confidence Thresholds</h3>
        <p className="text-xs text-[#64748B]">
          Defined in <code className="font-mono text-emerald-800">lib/config.ts</code> to categorize uncertainty for non-technical users:
        </p>

        <div className="grid gap-3 sm:grid-cols-3 text-xs pt-1">
          <div className="rounded-xl border border-emerald-200 bg-[#EAF7F1] p-3">
            <p className="font-bold text-[#006B48]">High Confidence</p>
            <p className="mt-1 text-sm font-extrabold text-[#00875A] tabular-nums">≥ 80.0%</p>
            <p className="mt-1 text-[11px] text-[#475569]">Visual traits strongly align with training patterns.</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-[#FFF7E6] p-3">
            <p className="font-bold text-[#B45309]">Medium Confidence</p>
            <p className="mt-1 text-sm font-extrabold text-[#D97706] tabular-nums">50.0% – 79.9%</p>
            <p className="mt-1 text-[11px] text-[#475569]">Partial alignment; verification photo recommended.</p>
          </div>

          <div className="rounded-xl border border-rose-200 bg-[#FFF5F5] p-3">
            <p className="font-bold text-[#DC2626]">Low Confidence</p>
            <p className="mt-1 text-sm font-extrabold text-[#DC2626] tabular-nums">&lt; 50.0%</p>
            <p className="mt-1 text-[11px] text-[#475569]">High uncertainty; user guided to retake or inspect.</p>
          </div>
        </div>
      </div>

      {/* Database Management */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-[#0F172A]">Diagnostic History Storage</h3>
        <p className="text-xs text-[#64748B]">
          You have <strong className="text-[#0F172A] tabular-nums">{historyCount}</strong> recorded diagnosis entries stored in the local SQLite database.
        </p>

        <button
          type="button"
          onClick={() => {
            if (window.confirm("Are you sure you want to permanently delete all saved analyses?")) {
              onClearHistory();
            }
          }}
          disabled={historyCount === 0}
          className="rounded-lg border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-40 transition-all"
        >
          Clear all analysis history
        </button>
      </div>
    </div>
  );
}
