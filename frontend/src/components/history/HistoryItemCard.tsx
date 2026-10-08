"use client";

import { ConfidenceBadge } from "../analysis/ConfidenceBadge";
import { formatDateOnly, getFullImageUrl } from "../../lib/utils";
import type { HistoryItem } from "../../types/analysis";

interface HistoryItemCardProps {
  item: HistoryItem;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: number) => void;
}

export function HistoryItemCard({
  item,
  onSelect,
  onDelete,
}: HistoryItemCardProps) {
  const thumbUrl = getFullImageUrl(item.image_url || item.gradcam_image);

  return (
    <div className="group relative flex items-center justify-between rounded-xl border border-[#E8E8E2] bg-white p-3.5 shadow-2xs transition-all hover:border-[#D0D0C8] hover:shadow-xs">
      <div
        onClick={() => onSelect(item)}
        className="flex flex-1 cursor-pointer items-center gap-3.5 min-w-0"
      >
        {/* Thumbnail preview */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#EDEDE8] bg-[#F7F8F5]">
          {thumbUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={thumbUrl}
              alt={`${item.plant} leaf thumbnail`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M11 20A7 7 0 0 1 4 13C4 8 8 3 13 3c3.87 0 7 2.13 7 6 0 4-3 11-9 11Z" />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              {item.plant}
            </span>
            <span className="text-[#A1A1AA] text-[10px]" aria-hidden="true">·</span>
            <span className="text-[11px] text-[#71717A] tabular-nums">
              {formatDateOnly(item.timestamp)}
            </span>
          </div>

          <h4 className="truncate text-xs font-semibold text-[#111827]">
            {item.disease}
          </h4>

          <div className="mt-1 flex items-center gap-2">
            <ConfidenceBadge confidence={item.confidence} size="sm" />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="ml-2 flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onSelect(item)}
          className="rounded px-2.5 py-1 text-xs font-medium text-[#111827] hover:bg-slate-100"
          aria-label={`View analysis for ${item.plant} ${item.disease}`}
        >
          View
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="rounded p-1 text-[#A1A1AA] hover:bg-rose-50 hover:text-rose-600 transition-colors"
          title="Delete record"
          aria-label="Delete history entry"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
