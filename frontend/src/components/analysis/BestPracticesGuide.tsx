import { APP_CONFIG } from "../../lib/config";

export function BestPracticesGuide() {
  return (
    <div className="flex flex-col gap-4">
      {/* Photography Checklist */}
      <div className="rounded-xl border border-[#E2E2DC] bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[#1B4332]">
            <svg
              className="h-3 w-3 stroke-[2.5]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
            Photo Guidelines for High Accuracy
          </h3>
        </div>

        <ul className="mt-3.5 space-y-2.5 text-xs text-[#52525B]">
          <li className="flex items-start gap-2">
            <span className="font-semibold text-emerald-800">1.</span>
            <span>
              <strong className="font-medium text-[#111827]">Single focal leaf:</strong> Ensure one leaf dominates the frame without clutter.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-emerald-800">2.</span>
            <span>
              <strong className="font-medium text-[#111827]">Natural diffuse lighting:</strong> Avoid harsh direct sunlight or camera flash that washes out lesion color.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-emerald-800">3.</span>
            <span>
              <strong className="font-medium text-[#111827]">Focus on lesion margins:</strong> Position spots and chlorotic transitions in crisp focus.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-emerald-800">4.</span>
            <span>
              <strong className="font-medium text-[#111827]">Fill the frame:</strong> The leaf lamina should cover at least 60–75% of the photo area.
            </span>
          </li>
        </ul>
      </div>

      {/* Model Spec Card */}
      <div className="rounded-xl border border-[#E8E8E2] bg-[#FAFBF9] p-4.5 text-xs text-[#52525B]">
        <h4 className="font-semibold text-[#111827]">
          Inference Architecture
        </h4>
        <dl className="mt-2.5 space-y-1.5 text-[11px]">
          <div className="flex justify-between border-b border-slate-200/50 pb-1">
            <dt className="text-[#71717A]">Base Backbone</dt>
            <dd className="font-medium text-[#111827]">{APP_CONFIG.modelInfo.name}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-200/50 pb-1">
            <dt className="text-[#71717A]">Input Resolution</dt>
            <dd className="font-medium text-[#111827] tabular-nums">{APP_CONFIG.modelInfo.inputResolution}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-200/50 pb-1">
            <dt className="text-[#71717A]">XAI Mechanism</dt>
            <dd className="font-medium text-[#111827]">{APP_CONFIG.modelInfo.xaiMethod}</dd>
          </div>
          <div className="flex justify-between pt-0.5">
            <dt className="text-[#71717A]">Target Corpus</dt>
            <dd className="font-medium text-[#111827]">{APP_CONFIG.modelInfo.dataset}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
