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
          let foliarPixelCount = 0;
          let neutralPixelCount = 0;
          const totalPixels = data.length / 4;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Perceived luminance formula (ITU-R BT.709)
            totalBrightness += 0.2126 * r + 0.7152 * g + 0.0722 * b;

            // RGB to HSV conversion for botanical validation
            const rNorm = r / 255;
            const gNorm = g / 255;
            const bNorm = b / 255;
            const max = Math.max(rNorm, gNorm, bNorm);
            const min = Math.min(rNorm, gNorm, bNorm);
            const delta = max - min;
            let hue = 0;
            if (delta > 0) {
              if (max === rNorm) {
                hue = ((gNorm - bNorm) / delta) % 6;
              } else if (max === gNorm) {
                hue = (bNorm - rNorm) / delta + 2;
              } else {
                hue = (rNorm - gNorm) / delta + 4;
              }
              hue = Math.round(hue * 60);
              if (hue < 0) hue += 360;
            }
            const sat = max > 0 ? (delta / max) * 100 : 0;
            const val = max * 100;

            // Check neutral / monochrome / document pixels
            if (sat < 12 || (val > 94 && sat < 18) || val < 8) {
              neutralPixelCount++;
            }

            // Botanical foliar hue: green (chlorophyll) through yellow/amber/rust/brown (carotenoid/necrosis)
            // Hue in degrees: 18° to 180° with sufficient saturation
            if (hue >= 18 && hue <= 180 && sat >= 15 && val >= 15) {
              foliarPixelCount++;
            }
          }

          const avgBrightness = totalBrightness / totalPixels;
          brightnessScore = Math.round(avgBrightness);
          const neutralRatio = neutralPixelCount / totalPixels;
          const foliarRatio = foliarPixelCount / totalPixels;

          // Reject document / paper table / text screenshots
          if (neutralRatio > 0.82 && foliarRatio < 0.14) {
            resolve({
              valid: false,
              error: "Document or text image detected: The selected file appears to be a document or graphic. Please upload a clear photo of a real plant leaf.",
            });
            return;
          }

          // Reject non-plant images (no botanical leaf foliage detected)
          if (foliarRatio < 0.10) {
            resolve({
              valid: false,
              error: "Non-plant image detected: No botanical leaf foliage could be identified. Please upload a clear photograph of a plant leaf.",
            });
            return;
          }

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
