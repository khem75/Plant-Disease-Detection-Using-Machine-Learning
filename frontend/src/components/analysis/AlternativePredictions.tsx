"use client";

import type { AlternativePrediction } from "../../types/analysis";

interface AlternativePredictionsProps {
  alternatives: AlternativePrediction[];
  primaryClassName?: string;
}

export function AlternativePredictions({
  alternatives,
  primaryClassName,
}: AlternativePredictionsProps) {
  if (!alternatives || alternatives.length <= 1) return null;

  // Filter out the primary predicted class or display all top candidates
  const filtered = alternatives.slice(0, 5);

  return (
    <div className="rounded-xl border border-[#E2E2DC] bg-[#FAFBF9] p-4.5">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
          Candidate Classifications (Softmax Distribution)
        </h4>
        <span className="text-[10px] text-[#71717A]">Top model candidates</span>
      </div>

      <div className="mt-3 space-y-2.5">
        {filtered.map((candidate, idx) => {
          const isPrimary = candidate.class_name === primaryClassName || idx === 0;
          const pct = Math.max(0.5, Math.min(100, candidate.confidence));

          return (
            <div key={candidate.class_name} className="flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <span className="text-[11px] font-mono text-[#71717A] w-3">
                    {idx + 1}.
                  </span>
                  <span className={`truncate ${isPrimary ? "font-semibold text-[#111827]" : "text-[#52525B]"}`}>
                    {candidate.plant} · {candidate.disease}
                  </span>
                </div>
                <span className="font-mono text-[11px] font-medium text-[#111827] tabular-nums shrink-0">
                  {candidate.confidence.toFixed(2)}%
                </span>
              </div>

              {/* Visual probability bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPrimary ? "bg-[#1B4332]" : "bg-slate-400"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[#71717A]">
        Calculated from actual output activations across all 38 supported classes.
      </p>
    </div>
  );
}
