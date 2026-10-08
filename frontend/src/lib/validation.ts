import { APP_CONFIG } from "./config";
import type { ImageValidationResult } from "../types/analysis";

/**
 * Validates file type, size, dimensions, and computes basic brightness/contrast metrics
 * to warn users about poor lighting without blocking them from testing.
 */
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  // 1. File existence
  if (!file) {
    return { valid: false, error: "No image file was provided." };
  }

  // 2. MIME type check
  if (!APP_CONFIG.supportedMimeTypes.includes(file.type as any) && !file.type.startsWith("image/")) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || "unknown"}). Please select a JPG, PNG, or WebP image.`,
    };
  }

  // 3. File size check
  if (file.size <= 0) {
    return { valid: false, error: "The selected file is empty." };
  }
  if (file.size > APP_CONFIG.maxFileSizeBytes) {
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${APP_CONFIG.maxFileSizeMB} MB.`,
    };
  }

  // 4. Load into Image to check readability, dimensions, and brightness
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (width < 64 || height < 64) {
        resolve({
          valid: false,
          error: "Image resolution is too low (< 64px). Please upload a higher-resolution photograph.",
        });
        return;
      }

      // Sample image pixels for lighting warning
      let warning: string | undefined;
      let brightnessScore: number | undefined;

      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const sampleSize = 64;
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        if (ctx) {
          ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
          const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
          const data = imageData.data;
          let totalBrightness = 0;

          for (let i = 0; i < data.length; i += 4) {
            // Perceived luminance formula (ITU-R BT.709)
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            totalBrightness += 0.2126 * r + 0.7152 * g + 0.0722 * b;
          }

          const avgBrightness = totalBrightness / (sampleSize * sampleSize);
          brightnessScore = Math.round(avgBrightness);

          if (avgBrightness < 45) {
            warning = "Image lighting appears dark. Consider retaking in brighter, indirect daylight.";
          } else if (avgBrightness > 225) {
            warning = "Image is heavily overexposed. Direct glare or flash may wash out lesion details.";
          } else if (width < 300 || height < 300) {
            warning = "Resolution is modest. For optimal detection, upload a close-up photo where the leaf fills the frame.";
          }
        }
      } catch {
        // Canvas security or memory limitation shouldn't block validation
      }

      resolve({
        valid: true,
        warning,
        dimensions: { width, height },
        brightnessScore,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        valid: false,
        error: "Unable to decode this image file. The file may be corrupted or not a valid image.",
      });
    };

    img.src = objectUrl;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function sanitizeFileName(name: string): string {
  if (!name) return "leaf-sample.jpg";
  // Remove UUID prefixes or paths if present
  const base = name.split(/[\\/]/).pop() || name;
  if (base.length > 32) {
    const ext = base.split(".").pop();
    return `${base.substring(0, 24)}...${ext ? `.${ext}` : ""}`;
  }
  return base;
}
