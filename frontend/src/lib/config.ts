export const APP_CONFIG = {
  appName: "Plant Health",
  appSubtitle: "AI-powered leaf disease analysis",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
  maxFileSizeMB: 10,
  supportedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  supportedExtensions: [".jpg", ".jpeg", ".png", ".webp"],

  // Centralized UX Confidence Thresholds
  confidenceThresholds: {
    high: 80.0,
    medium: 50.0,
  },

  healthPollIntervalMs: 20000,

  modelInfo: {
    name: "EfficientNetB0 Plant Classifier",
    version: "v1.0.4",
    dataset: "PlantVillage (38 botanical classes)",
    inputResolution: "224 × 224 px RGB",
    xaiMethod: "Grad-CAM on top_conv layer",
  },
} as const;

export function interpretConfidence(confidencePct: number): {
  level: "high" | "medium" | "low";
  label: string;
  badgeText: string;
  badgeBg: string;
  badgeTextCol: string;
  badgeBorder: string;
  barColor: string;
  dotColor: string;
  heading: string;
  explanation: string;
  guidance: string;
} {
  if (confidencePct >= APP_CONFIG.confidenceThresholds.high) {
    return {
      level: "high",
      label: "High confidence",
      badgeText: "High confidence",
      badgeBg: "bg-[#EAF7F1]",
      badgeTextCol: "text-[#006B48]",
      badgeBorder: "border-[#A7F3D0]",
      barColor: "bg-[#00875A]",
      dotColor: "bg-[#00875A]",
      heading: "The AI found a strong match",
      explanation: "The image closely matches visual patterns the model associates with this condition.",
      guidance: "Review the disease profile and recommended steps below to help maintain crop vitality.",
    };
  } else if (confidencePct >= APP_CONFIG.confidenceThresholds.medium) {
    return {
      level: "medium",
      label: "Medium confidence",
      badgeText: "Medium confidence",
      badgeBg: "bg-[#FFF7E6]",
      badgeTextCol: "text-[#B45309]",
      badgeBorder: "border-[#FDE68A]",
      barColor: "bg-[#F59E0B]",
      dotColor: "bg-[#F59E0B]",
      heading: "The AI found a possible match",
      explanation: "The image shows signs that may be associated with this disease, but the AI is not completely certain.",
      guidance: "Consider taking another clear photo in natural daylight to confirm the result.",
    };
  } else {
    return {
      level: "low",
      label: "Low confidence",
      badgeText: "Low confidence",
      badgeBg: "bg-[#FFF7E6]",
      badgeTextCol: "text-[#D97706]",
      badgeBorder: "border-[#FCD34D]",
      barColor: "bg-[#F59E0B]",
      dotColor: "bg-[#F59E0B]",
      heading: "The result is not very certain",
      explanation: "The AI found signs that may be linked to this condition, but it is not fully sure about this result.",
      guidance: "Try taking another photo with better lighting, closer framing, less background, and the affected area clearly visible.",
    };
  }
}
