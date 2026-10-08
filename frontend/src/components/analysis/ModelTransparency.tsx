import { APP_CONFIG } from "../../lib/config";

interface ModelTransparencyProps {
  modelVersion?: string;
  analyzedAt?: string;
  className: string;
}

export function ModelTransparency({
  modelVersion,
  analyzedAt,
  className,
}: ModelTransparencyProps) {
  return (
    <div className="rounded-xl border border-[#E8E8E2] bg-[#FAFBF9] p-5 text-xs text-[#52525B]">
      <h3 className="font-semibold text-[#111827]">
        Model Transparency &amp; Methodology
      </h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="text-[11px] font-medium text-[#71717A]">Architecture</span>
          <p className="mt-0.5 font-medium text-[#111827]">
            {APP_CONFIG.modelInfo.name}
          </p>
          <p className="text-[11px] text-[#71717A]">
            {modelVersion || APP_CONFIG.modelInfo.version}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-medium text-[#71717A]">Explainability Engine</span>
          <p className="mt-0.5 font-medium text-[#111827]">
            {APP_CONFIG.modelInfo.xaiMethod}
          </p>
          <p className="text-[11px] text-[#71717A]">
            Resolution: {APP_CONFIG.modelInfo.inputResolution}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-medium text-[#71717A]">Corpus Benchmark</span>
          <p className="mt-0.5 font-medium text-[#111827]">
            PlantVillage Dataset
          </p>
          <p className="text-[11px] text-[#71717A]">
            38 botanical classes
          </p>
        </div>

        <div>
          <span className="text-[11px] font-medium text-[#71717A]">Inference Timestamp</span>
          <p className="mt-0.5 font-medium text-[#111827] tabular-nums">
            {analyzedAt ? new Date(analyzedAt).toUTCString() : "Just now"}
          </p>
          <p className="truncate font-mono text-[10px] text-[#71717A]" title={className}>
            {className}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-200/60 pt-3 text-[11px] leading-relaxed text-[#71717A]">
        Confidence scores represent output probabilities across 38 classes conditioned on the training distribution. Ambient lighting, camera angle, and leaf health state outside of the training corpus can affect reliability.
      </div>
    </div>
  );
}
