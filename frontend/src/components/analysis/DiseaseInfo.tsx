"use client";

import type { DiseaseInfo as DiseaseInfoType } from "../../types/analysis";

interface DiseaseInfoProps {
  diseaseInfo: DiseaseInfoType;
  plantName: string;
  diseaseName: string;
  confidence: number;
}

export function DiseaseInfo({
  diseaseInfo,
  plantName,
  diseaseName,
  confidence,
}: DiseaseInfoProps) {
  const isHealthy = diseaseName.toLowerCase().includes("healthy");
  const isLowConfidence = confidence < 50.0;

  return (
    <div className="flex flex-col gap-6">
      {/* Overview section */}
      <div className="rounded-xl border border-[#E2E2DC] bg-white p-5 shadow-xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#52525B]">
          Agronomic Overview
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#111827]">
          {diseaseInfo.description}
        </p>

        {diseaseInfo.pathogen && diseaseInfo.pathogen !== "Unspecified" && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[#52525B]">
            <span className="font-semibold text-[#111827]">Identified Agent:</span>
            <span>{diseaseInfo.pathogen}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Symptoms Section */}
        <div className="flex flex-col rounded-xl border border-[#E2E2DC] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F0F0EB] pb-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
              Reference Class Symptoms
            </h3>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
              Literature profile
            </span>
          </div>

          <p className="mt-2.5 text-[11px] italic leading-normal text-[#71717A]">
            * Characteristic symptoms documented for this disease class in botanical literature. The AI model classifies overall patterns and does not individually segment discrete lesions.
          </p>

          <ul className="mt-4 space-y-2.5 text-xs text-[#334155]">
            {diseaseInfo.symptoms && diseaseInfo.symptoms.length > 0 ? (
              diseaseInfo.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                  <span className="leading-relaxed">{symptom}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No specific symptoms documented.</li>
            )}
          </ul>
        </div>

        {/* Recommended Actions */}
        <div className="flex flex-col rounded-xl border border-[#E2E2DC] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F0F0EB] pb-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
              Recommended Next Steps
            </h3>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
              Cultural &amp; IPM
            </span>
          </div>

          {isLowConfidence ? (
            <div className="mt-3 space-y-2.5 text-xs">
              <p className="font-semibold text-rose-900">
                Confidence is Low — Follow Verification Protocol First:
              </p>
              <ol className="space-y-2 text-[#334155]">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-rose-700">1.</span>
                  <span>
                    <strong>Retake the photograph:</strong> Place a single leaf on a plain neutral surface under bright, indirect daylight.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-rose-700">2.</span>
                  <span>
                    <strong>Inspect the canopy:</strong> Check if multiple leaves or branches display similar chlorotic or necrotic spots.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-rose-700">3.</span>
                  <span>
                    <strong>Consult an agronomist:</strong> Do not apply chemical sprays without physical confirmation from a qualified specialist.
                  </span>
                </li>
              </ol>
            </div>
          ) : (
            <ul className="mt-4 space-y-2.5 text-xs text-[#334155]">
              {diseaseInfo.prevention && diseaseInfo.prevention.length > 0 ? (
                diseaseInfo.prevention.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B4332]" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">Continue general crop monitoring and balanced irrigation.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
