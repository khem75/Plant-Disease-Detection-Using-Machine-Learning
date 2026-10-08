"use client";

import { interpretConfidence } from "../../lib/config";

interface ConfidenceBadgeProps {
  confidence: number;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
}

export function ConfidenceBadge({
  confidence,
  size = "md",
  showDescription = false,
}: ConfidenceBadgeProps) {
  const interp = interpretConfidence(confidence);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm font-semibold",
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="inline-flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tabular-nums ${interp.badgeBg} ${interp.badgeTextCol} ${interp.badgeBorder} ${sizeClasses[size]}`}
          role="status"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${interp.dotColor}`} />
          <span>{interp.badgeText}</span>
          <span>· {confidence.toFixed(2)}%</span>
        </span>
      </div>

      {showDescription && (
        <p className="text-xs leading-relaxed text-[#64748B]">
          {interp.explanation}
        </p>
      )}
    </div>
  );
}
