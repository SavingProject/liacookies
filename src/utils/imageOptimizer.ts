/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Optimizes, resizes, and compresses image files or base64 data URLs
 * to ensure ultra-fast rendering, zero memory crashes, and safe storage.
 * Preserves alpha transparency for PNG / logos.
 */
export async function optimizeImage(
  source: File | Blob | string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    // If it's a remote URL (http/https), return it directly
    if (typeof source === "string" && (source.startsWith("http://") || source.startsWith("https://"))) {
      return resolve(source);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    const processImage = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          // Fallback if dimensions couldn't be determined
          if (typeof source === "string") return resolve(source);
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || "");
          reader.onerror = () => resolve("");
          reader.readAsDataURL(source as Blob);
          return;
        }

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          if (typeof source === "string") return resolve(source);
          return resolve("");
        }

        // Determine if image might have transparency
        const isPng =
          (typeof source !== "string" && (source as File).type === "image/png") ||
          (typeof source === "string" && source.startsWith("data:image/png"));

        // Clear canvas with transparency
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let outputType = "image/jpeg";
        let outputQuality = quality;

        if (isPng) {
          // Preserve PNG transparency for logos and icons
          outputType = "image/png";
        }

        const resultDataUrl = canvas.toDataURL(outputType, outputQuality);
        resolve(resultDataUrl);
      } catch (err) {
        console.warn("Canvas optimization error fallback:", err);
        if (typeof source === "string") {
          resolve(source);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || "");
          reader.onerror = () => resolve("");
          reader.readAsDataURL(source as Blob);
        }
      }
    };

    img.onload = processImage;
    img.onerror = () => {
      console.warn("Could not load image for optimization.");
      if (typeof source === "string") resolve(source);
      else resolve("");
    };

    if (typeof source === "string") {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          resolve("");
        }
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Safely persists an item into localStorage without ever throwing QuotaExceededError or crashing React.
 */
export function safeSetLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`[Storage] Failed to save key "${key}" to localStorage:`, error);
    // Try clearing older temporary cache keys if quota was exceeded
    try {
      localStorage.removeItem("montepork_cart");
      localStorage.setItem(key, value);
    } catch {
      // Ignore if still exceeded - in-memory and server API will keep the state safely
    }
  }
}
