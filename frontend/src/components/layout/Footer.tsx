export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E8E8E2] bg-[#FAFAF8] py-6 text-xs text-[#71717A]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
        <p className="max-w-xl text-[11px] leading-relaxed text-[#71717A]">
          <strong className="font-medium text-[#52525B]">Responsible AI Notice:</strong> AI-generated classifications and Grad-CAM visualizations are screening aids for informational research and should not replace on-site agricultural diagnostic testing or verified plant pathology consultation.
        </p>
        <p className="text-[11px] text-[#A1A1AA] tabular-nums">
          EfficientNetB0 · Grad-CAM XAI · PlantVillage 38 Classes
        </p>
      </div>
    </footer>
  );
}
