/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  light?: boolean;
  title?: string;
  logoType?: "cookie" | "snout" | "image" | "emoji" | "none";
  logoValue?: string;
  titleDisplayType?: "text" | "image";
  titleImageUrl?: string;
  titleImageWidth?: number | string;
}

export default function Logo({ 
  size = "md", 
  light = false, 
  title = "Lia Cookies",
  logoType = "emoji",
  logoValue = "🍪",
  titleDisplayType = "text",
  titleImageUrl = "",
  titleImageWidth = 320,
}: LogoProps) {
  // If image mode is active and an image URL is provided, display the centered image
  if (titleDisplayType === "image" && titleImageUrl) {
    const sizeImageClasses = {
      sm: "max-h-9 max-w-[140px] sm:max-w-[180px]",
      md: "max-h-14 max-w-[220px]",
      lg: "max-h-24 md:max-h-28 max-w-[320px]",
      xl: "max-h-[380px] md:max-h-[500px] lg:max-h-[650px] max-w-[95vw] w-auto h-auto",
    };

    const customWidthStyle = size === "xl" && titleImageWidth ? { maxWidth: `${titleImageWidth}px`, width: "100%" } : {};

    return (
      <div id="brand-logo-image-container" className="flex items-center justify-center select-none py-1">
        <img
          src={titleImageUrl}
          alt={title || "Brand Logo"}
          referrerPolicy="no-referrer"
          style={customWidthStyle}
          className={`object-contain mx-auto filter drop-shadow-xl transition-transform duration-300 hover:scale-[1.02] ${sizeImageClasses[size]}`}
        />
      </div>
    );
  }

  const sizeClasses = {
    sm: "text-2xl gap-0.5",
    md: "text-4xl gap-1",
    lg: "text-5xl md:text-6xl gap-1.5",
    xl: "text-6xl md:text-7xl lg:text-8xl gap-2",
  };

  const noseSizes = {
    sm: "w-6 h-6 border-2",
    md: "w-9 h-9 border-2",
    lg: "w-12 h-12 md:w-14 md:h-14 border-3",
    xl: "w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 border-4",
  };

  const emojiSizes = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl md:text-3xl",
    xl: "text-4xl md:text-5xl lg:text-6xl",
  };

  // Dynamically build the brand logo with snout/icon replacing the first 'O' and fuchsia highlighting the last word
  const titleUpper = title.toUpperCase();
  const oIndex = logoType !== "none" ? titleUpper.indexOf("O") : -1;
  const hasO = oIndex !== -1;

  let partBeforeO = "";
  let partAfterO = "";

  if (hasO) {
    partBeforeO = titleUpper.substring(0, oIndex);
    partAfterO = titleUpper.substring(oIndex + 1);
  } else {
    partBeforeO = titleUpper;
  }

  // Highlight the last word if there is a space
  let textToProcess = hasO ? partAfterO : partBeforeO;
  const lastSpaceIdx = textToProcess.lastIndexOf(" ");
  
  let textBeforeHighlight = textToProcess;
  let highlightedWord = "";

  if (lastSpaceIdx !== -1) {
    textBeforeHighlight = textToProcess.substring(0, lastSpaceIdx);
    highlightedWord = textToProcess.substring(lastSpaceIdx + 1);
  } else if (!hasO) {
    textBeforeHighlight = textToProcess;
  } else {
    textBeforeHighlight = "";
    highlightedWord = textToProcess;
  }

  return (
    <div
      id="brand-logo"
      className={`font-display font-black tracking-tighter text-white inline-flex items-center justify-center select-none ${sizeClasses[size]}`}
    >
      {/* Text before O */}
      <span className="text-white">{partBeforeO}</span>
      
      {/* Replacement for 'O' with Cookie */}
      {hasO && (logoType === "cookie" || (logoType === "emoji" && (logoValue === "🍪" || !logoValue))) && (
        <span
          className={`relative rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110 border-white/80 shrink-0 ${noseSizes[size]}`}
          style={{ boxShadow: "0 0 16px rgba(251, 191, 36, 0.45)" }}
        >
          {/* Chocolate chips */}
          <span className="absolute top-[22%] left-[28%] w-[18%] h-[18%] bg-[#261005] rounded-full shadow-inner"></span>
          <span className="absolute top-[32%] right-[22%] w-[20%] h-[20%] bg-[#261005] rounded-full shadow-inner"></span>
          <span className="absolute bottom-[24%] left-[34%] w-[22%] h-[22%] bg-[#261005] rounded-full shadow-inner"></span>
          <span className="absolute bottom-[36%] right-[32%] w-[14%] h-[14%] bg-[#261005] rounded-full shadow-inner"></span>
        </span>
      )}

      {/* Replacement for 'O' if pig snout requested */}
      {hasO && logoType === "snout" && (
        <span
          style={{ backgroundColor: "var(--color-primary, #8A1C9E)" }}
          className={`relative rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110 logo-pig-nose-glow border-white shrink-0 ${noseSizes[size]}`}
        >
          <span className="absolute left-[32%] w-[12%] h-[28%] bg-black rounded-full transform rotate-3 shadow-inner"></span>
          <span className="absolute right-[32%] w-[12%] h-[28%] bg-black rounded-full transform -rotate-3 shadow-inner"></span>
          <span className="absolute bottom-[20%] w-[25%] h-[8%] bg-black/10 rounded-full"></span>
        </span>
      )}

      {/* Replacement for 'O' with custom Emoji */}
      {hasO && logoType === "emoji" && logoValue && logoValue !== "🍪" && (
        <span
          className={`relative rounded-full flex items-center justify-center bg-black/40 shadow-lg transform transition-transform duration-300 hover:scale-110 border-white shrink-0 ${noseSizes[size]}`}
        >
          <span className={`select-none leading-none ${emojiSizes[size]}`}>{logoValue}</span>
        </span>
      )}

      {/* Replacement for 'O' with Image */}
      {hasO && logoType === "image" && (
        <img
          src={logoValue || "/src/assets/images/lia_six_pack_box_1788791837137.jpg"}
          alt="Custom Logo"
          referrerPolicy="no-referrer"
          className={`rounded-full object-cover shadow-lg transform transition-transform duration-300 hover:scale-110 border-white shrink-0 ${noseSizes[size]}`}
        />
      )}

      {/* Text between O and Highlight */}
      {textBeforeHighlight && (
        <span className="text-white">{textBeforeHighlight}</span>
      )}

      {/* Highlighted Suffix */}
      {highlightedWord && (
        <span 
          className="text-primary font-extrabold uppercase ml-1" 
          style={{ 
            color: "var(--color-primary, #8A1C9E)",
            textShadow: "0 0 16px var(--color-primary, rgba(138, 28, 158, 0.6))"
          }}
        >
          {highlightedWord}
        </span>
      )}
    </div>
  );
}
