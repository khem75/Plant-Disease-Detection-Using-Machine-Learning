"use client";

import React from "react";
import { Leaf, Clock, GraduationCap, Sprout } from "lucide-react";

interface SidebarProps {
  activeView: "analyze" | "history";
  onSelectView: (view: "analyze" | "history") => void;
  historyCount?: number;
}

export function Sidebar({ activeView, onSelectView }: SidebarProps) {
  return (
    <aside className="w-[216px] shrink-0 bg-[#073F28] text-white flex flex-col min-h-screen relative overflow-hidden select-none border-r border-[#0A4E32]">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#0C4E33]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#176B3A] text-white shadow-xs shrink-0">
          <Leaf className="h-5 w-5 text-[#2F8A4B] fill-[#2F8A4B]" />
        </div>
        <div>
          <h1 className="text-[13px] font-extrabold tracking-tight leading-tight text-white">
            Plant Disease<br />Detection
          </h1>
          <p className="text-[10px] text-[#A0B2A6] font-medium leading-none mt-0.5">
            AI &amp; Computer Vision
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1.5 z-10" aria-label="Main navigation">
        {/* Analyze */}
        <button
          type="button"
          onClick={() => onSelectView("analyze")}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeView === "analyze"
              ? "bg-[#176B3A] text-white shadow-sm"
              : "text-[#A0B2A6] hover:bg-[#0C4E33] hover:text-white"
          }`}
        >
          <Leaf className="h-4 w-4 shrink-0" />
          <span>Analyze</span>
        </button>

        {/* History */}
        <button
          type="button"
          onClick={() => onSelectView("history")}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeView === "history"
              ? "bg-[#176B3A] text-white shadow-sm"
              : "text-[#A0B2A6] hover:bg-[#0C4E33] hover:text-white"
          }`}
        >
          <Clock className="h-4 w-4 shrink-0" />
          <span>History</span>
        </button>
      </nav>

      {/* Watermark Leaf Illustration */}
      <div className="absolute bottom-16 left-0 right-0 pointer-events-none opacity-20">
        <svg viewBox="0 0 200 240" fill="none" className="w-full text-[#2F8A4B]">
          <path d="M0 240 C30 180 60 140 120 100 C150 80 180 50 190 10 C160 30 130 60 90 90 C40 130 10 180 0 240Z" fill="currentColor" />
          <path d="M0 240 C50 200 90 160 140 130 C170 110 185 85 195 50 C170 75 140 100 100 125 C50 160 20 200 0 240Z" fill="currentColor" opacity="0.6" />
        </svg>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto p-3.5 z-10 space-y-3">
        {/* Healthy Plants Badge */}
        <div className="rounded-xl bg-[#0B4A30] border border-[#0F5A3B] p-2.5 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#176B3A] text-white shrink-0">
            <Sprout className="h-4 w-4 text-[#2F8A4B]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white leading-tight">Healthy Plants</p>
            <p className="text-[9px] text-[#A0B2A6] leading-tight">Sustainable Future</p>
          </div>
        </div>

        {/* Viva / Project Label */}
        <div className="border-t border-[#0C4E33] pt-2.5 text-[10px] text-[#A0B2A6] space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <GraduationCap className="h-3.5 w-3.5 text-[#2F8A4B]" />
            <span>BCA AI &amp; Data Science</span>
          </div>
          <p className="text-[9px] text-[#A0B2A6]">Plant Disease Detection</p>
          <p className="text-[9px] text-[#71887A]">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
