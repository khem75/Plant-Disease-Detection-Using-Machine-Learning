export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] px-6 py-8 sm:px-10 sm:py-10">
      {/* Decorative leaf art */}
      <div className="pointer-events-none absolute -right-4 -top-8 h-56 w-56 opacity-15">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <path
            d="M160 30C110 35 60 75 55 135c10-5 35-10 65-5 40 7 60 40 60 40s10-40 0-85c-5-25-15-45-20-55z"
            fill="#059669"
          />
          <path d="M100 110c20-25 45-45 75-55" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
          <path d="M120 85c10-10 20-15 35-20" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="relative z-10 max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-[#065F46] sm:text-3xl">
          Check your plant&apos;s health
        </h2>
        <p className="mt-2 text-sm text-[#047857] sm:text-base leading-relaxed">
          Take a photo of a leaf and let the AI identify common diseases.
          Get visual explanations and practical recommendations.
        </p>

        {/* Feature pills */}
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            { icon: "⚡", text: "Instant analysis" },
            { icon: "🔍", text: "Visual explanation" },
            { icon: "📋", text: "Actionable guidance" },
            { icon: "📊", text: "Confidence scoring" },
          ].map((feature) => (
            <div
              key={feature.text}
              className="inline-flex items-center gap-2 rounded-lg bg-white/80 border border-[#A7F3D0] px-3 py-1.5 text-xs font-medium text-[#065F46]"
            >
              <span>{feature.icon}</span>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
