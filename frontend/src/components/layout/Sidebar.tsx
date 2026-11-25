"use client";

import React from "react";
import { Clock, BookOpen, Leaf } from "lucide-react";

interface SidebarProps {
  activeView: "analyze" | "history" | "atlas";
  onSelectView: (view: "analyze" | "history" | "atlas") => void;
  historyCount?: number;
}

export function Sidebar({ activeView, onSelectView, historyCount = 0 }: SidebarProps) {
  return (
    <aside className="w-[216px] shrink-0 bg-[#073F28] text-white flex flex-col min-h-screen relative overflow-hidden select-none border-r border-[#0A4E32]">
      {/* Brand Header with Realistic Botanical Emblem */}
      <div className="flex items-center gap-2.5 px-4 pt-6 pb-4 border-b border-[#0C4E33] z-10 bg-[#073F28]/95 backdrop-blur-md">
        {/* Realistic Emblem Icon */}
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B7943] via-[#105E32] to-[#093C20] shadow-[0_4px_12px_rgba(0,0,0,0.35)] shrink-0 ring-1 ring-[#4ADE80]/40 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />

          <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6 transform group-hover:scale-105 transition-transform duration-300">
            <defs>
              <linearGradient id="brandLeafDorsal" x1="6" y1="26" x2="26" y2="6" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#15803D" />
                <stop offset="60%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#86EFAC" />
              </linearGradient>
              <linearGradient id="brandLeafVentral" x1="6" y1="26" x2="26" y2="6" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#052E16" />
                <stop offset="60%" stopColor="#166534" />
                <stop offset="100%" stopColor="#4ADE80" />
              </linearGradient>
              <linearGradient id="brandMidrib" x1="6" y1="26" x2="26" y2="6" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#14532D" />
                <stop offset="70%" stopColor="#BBF7D0" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
            <path d="M 6 26 C 5 19 8 12 16 7 C 22 4 25 4 26 5 C 24 11 20 18 14 22 C 10 25 7 26 6 26 Z" fill="url(#brandLeafDorsal)" />
            <path d="M 6 26 C 10 25 14 22 20 18 C 24 11 25 6 26 5 C 27 10 26 17 21 21 C 16 25 10 26 6 26 Z" fill="url(#brandLeafVentral)" opacity="0.9" />
            <path d="M 5 27 C 9 24 16 16 26 5" stroke="url(#brandMidrib)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 11 21 C 9 18 9 15 10 13" stroke="#DCFCE7" strokeWidth="0.7" strokeLinecap="round" opacity="0.8" />
            <path d="M 15 16 C 13 13 14 10 16 8" stroke="#DCFCE7" strokeWidth="0.7" strokeLinecap="round" opacity="0.8" />
            <path d="M 15 17 C 18 18 20 17 22 15" stroke="#BBF7D0" strokeWidth="0.7" strokeLinecap="round" opacity="0.7" />
          </svg>
        </div>

        <div>
          <h1 className="text-[13px] font-black tracking-tight leading-tight text-white flex items-center gap-1.5">
            <span>PlantCare</span>
          </h1>
          <p className="text-[10px] text-[#A0B2A6] font-medium leading-none mt-0.5 flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-[#4ADE80]" />
            <span>Leaf Health Assistant</span>
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1.5 z-10" aria-label="Main navigation">
        {/* Check a Leaf */}
        <button
          type="button"
          onClick={() => onSelectView("analyze")}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${activeView === "analyze"
              ? "bg-[#176B3A] text-white shadow-md ring-1 ring-[#4ADE80]/35 font-bold"
              : "text-[#A0B2A6] hover:bg-[#0C4E33] hover:text-white"
            }`}
        >
          <Leaf className={`h-4 w-4 shrink-0 ${activeView === "analyze" ? "text-[#4ADE80]" : "text-[#A0B2A6]"}`} />
          <span>Check a Leaf</span>
        </button>

        {/* Scan History */}
        <button
          type="button"
          onClick={() => onSelectView("history")}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeView === "history"
              ? "bg-[#176B3A] text-white shadow-md ring-1 ring-[#4ADE80]/35 font-bold"
              : "text-[#A0B2A6] hover:bg-[#0C4E33] hover:text-white"
            }`}
        >
          <div className="flex items-center gap-2.5">
            <Clock className={`h-4 w-4 shrink-0 ${activeView === "history" ? "text-[#4ADE80]" : "text-[#A0B2A6]"}`} />
            <span>Past Scans</span>
          </div>
          {historyCount > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums shadow-2xs ${activeView === "history"
                  ? "bg-white text-[#073F28]"
                  : "bg-[#176B3A] text-white ring-1 ring-[#4ADE80]/30"
                }`}
            >
              {historyCount}
            </span>
          )}
        </button>

        {/* Disease Guide */}
        <button
          type="button"
          onClick={() => onSelectView("atlas")}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeView === "atlas"
              ? "bg-[#176B3A] text-white shadow-md ring-1 ring-[#4ADE80]/35 font-bold"
              : "text-[#A0B2A6] hover:bg-[#0C4E33] hover:text-white"
            }`}
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className={`h-4 w-4 shrink-0 ${activeView === "atlas" ? "text-[#4ADE80]" : "text-[#A0B2A6]"}`} />
            <span>Disease Guide</span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#4ADE80] bg-[#0B4A30] px-1.5 py-0.5 rounded border border-[#0F5A3B] shadow-2xs">
            38
          </span>
        </button>
      </nav>

      {/* Hyper-Realistic Botanical Watermark Leaf */}
      <div className="absolute bottom-16 -right-4 -left-4 pointer-events-none select-none overflow-hidden h-[360px] opacity-35 mix-blend-screen transition-opacity duration-700">
        <svg
          viewBox="0 0 260 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform rotate-[-8deg] translate-y-2 scale-105"
        >
          <defs>
            <linearGradient id="leafBladeLight" x1="40" y1="340" x2="220" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B4A30" stopOpacity="0.4" />
              <stop offset="35%" stopColor="#176B3A" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#25834A" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="leafBladeDark" x1="40" y1="340" x2="220" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#052E16" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#0D5531" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#15803D" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.75" />
            </linearGradient>

            <linearGradient id="midribGrad" x1="40" y1="355" x2="215" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#14532D" />
              <stop offset="50%" stopColor="#86EFAC" />
              <stop offset="100%" stopColor="#DCFCE7" />
            </linearGradient>

            <linearGradient id="veinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.2" />
            </linearGradient>

            <radialGradient id="dewDropGlow" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#86EFAC" stopOpacity="0.5" />
              <stop offset="80%" stopColor="#15803D" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#052E16" stopOpacity="0.7" />
            </radialGradient>

            <filter id="dewDropShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Secondary Tender Sprout Leaf */}
          <g opacity="0.65">
            <path
              d="M 45 320 C 15 280 -5 220 18 165 C 45 190 70 230 75 295 Z"
              fill="url(#leafBladeDark)"
            />
            <path
              d="M 45 320 C 75 295 70 230 45 190 C 25 155 18 165 18 165 C 50 145 95 180 90 260 C 85 290 65 315 45 320 Z"
              fill="url(#leafBladeLight)"
            />
            <path
              d="M 45 320 C 35 270 25 210 18 165"
              stroke="url(#midribGrad)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>

          {/* Primary Mature Leaf - Left Half */}
          <path
            d="M 45 345 C 32 295 20 235 28 165 C 36 98 95 55 215 35 C 170 95 130 175 95 245 C 75 285 58 325 45 345 Z"
            fill="url(#leafBladeLight)"
          />

          {/* Primary Mature Leaf - Right Half */}
          <path
            d="M 45 345 C 58 325 75 285 95 245 C 130 175 170 95 215 35 C 248 85 250 165 220 230 C 192 285 130 330 45 345 Z"
            fill="url(#leafBladeDark)"
          />

          {/* Main Stem */}
          <path
            d="M 42 355 C 55 315 85 235 140 145 C 170 95 195 60 215 35"
            stroke="url(#midribGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M 43 355 C 56 315 86 235 141 145 C 171 95 196 60 215 35"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* Secondary Veins Left */}
          <g stroke="url(#veinGrad)" strokeWidth="1.4" strokeLinecap="round">
            <path d="M 68 280 C 50 270 38 255 32 240" />
            <path d="M 88 245 C 68 230 48 212 36 195" />
            <path d="M 112 205 C 88 188 65 168 48 150" />
            <path d="M 138 165 C 112 148 85 125 65 105" />
            <path d="M 165 122 C 142 105 115 85 95 70" />
            <path d="M 190 78 C 172 65 150 50 135 42" />
          </g>

          {/* Secondary Veins Right */}
          <g stroke="url(#veinGrad)" strokeWidth="1.4" strokeLinecap="round">
            <path d="M 75 272 C 105 278 140 282 170 275" />
            <path d="M 98 235 C 130 240 168 242 202 230" />
            <path d="M 122 195 C 158 198 195 195 224 178" />
            <path d="M 148 155 C 182 155 215 145 235 128" />
            <path d="M 172 115 C 200 110 225 98 238 82" />
            <path d="M 195 72 C 215 65 228 55 234 46" />
          </g>

          {/* Micro-Veinlets */}
          <g stroke="#86EFAC" strokeWidth="0.8" opacity="0.45" strokeLinecap="round">
            <path d="M 50 255 C 45 250 42 245 46 238" />
            <path d="M 72 215 C 65 208 60 205 66 198" />
            <path d="M 95 175 C 88 168 82 165 89 158" />
            <path d="M 118 135 C 110 128 105 125 112 118" />
            <path d="M 125 255 C 135 258 142 265 140 272" />
            <path d="M 152 215 C 165 218 172 225 170 232" />
            <path d="M 178 175 C 190 178 198 182 195 190" />
          </g>

          {/* Dew Droplets */}
          <g filter="url(#dewDropShadow)" transform="translate(155, 125)">
            <ellipse cx="0" cy="0" rx="9" ry="7" fill="url(#dewDropGlow)" transform="rotate(-15)" />
            <circle cx="-3.5" cy="-2.5" r="1.8" fill="#FFFFFF" opacity="0.95" />
            <circle cx="-1" cy="-4" r="0.8" fill="#FFFFFF" opacity="0.75" />
          </g>
          <g filter="url(#dewDropShadow)" transform="translate(95, 215)">
            <ellipse cx="0" cy="0" rx="6" ry="4.5" fill="url(#dewDropGlow)" transform="rotate(-25)" />
            <circle cx="-2" cy="-1.5" r="1.2" fill="#FFFFFF" opacity="0.95" />
          </g>
        </svg>
      </div>

      {/* Bottom Section - Healthy Plants Card */}
      <div className="mt-auto p-3.5 z-10">
        <div className="rounded-xl bg-[#0B4A30]/90 backdrop-blur-md border border-[#176B3A]/60 p-2.5 flex items-center gap-2.5 shadow-md">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#176B3A] to-[#0A4526] text-white shrink-0 ring-1 ring-[#4ADE80]/35 shadow-xs">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path d="M 10 18 C 10 13 12 9 16 7 C 16 11 14 15 10 18 Z" fill="#4ADE80" opacity="0.95" />
              <path d="M 10 18 C 10 14 8 11 4 9 C 4 13 6 16 10 18 Z" fill="#86EFAC" opacity="0.95" />
              <path d="M 10 18 L 10 11" stroke="#DCFCE7" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-white leading-tight truncate">Healthy Plants</p>
            <p className="text-[9px] text-[#A0B2A6] leading-tight mt-0.5 truncate">38 Diseases · 14 Crops</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
