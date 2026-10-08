import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plant Disease Detection · ML-Powered Leaf Analysis",
  description: "Identify plant leaf diseases using EfficientNet-B0 deep learning with Grad-CAM visual explainability. A BCA college project.",
  keywords: ["plant disease detection", "leaf pathology", "Grad-CAM", "explainable AI", "EfficientNet", "PlantVillage"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAFBFC] text-[#111827]">
        {children}
      </body>
    </html>
  );
}
