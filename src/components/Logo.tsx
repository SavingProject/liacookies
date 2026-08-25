/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  light?: boolean;
  title?: string;
  logoType?: "snout" | "image" | "emoji" | "none";
  logoValue?: string;
  titleDisplayType?: "text" | "image";
  titleImageUrl?: string;
  titleImageWidth?: number | string;
}

export default function Logo({ 
  size = "md", 
  light = false, 
  title = "MONTE PORK",
  logoType = "snout",
  logoValue = "",
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
    sm: "text-xs",
    md: "text-base",
    lg: "text-xl md:text-2xl",
    xl: "text-3xl md:text-4xl lg:text-5xl",
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
    // If no space and no O, make the whole text normal or highlight
    textBeforeHighlight = textToProcess;
  } else {
    // Has O but no space, so the part after O is the highlight
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
      
      {/* Replacement for 'O' if present */}
      {hasO && logoType === "snout" && (
        <span
          style={{ backgroundColor: "var(--color-primary, #E8005A)" }}
          className={`relative rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110 logo-pig-nose-glow border-white shrink-0 ${noseSizes[size]}`}
        >
          {/* Nostrils */}
          <span className="absolute left-[32%] w-[12%] h-[28%] bg-black rounded-full transform rotate-3 shadow-inner"></span>
          <span className="absolute right-[32%] w-[12%] h-[28%] bg-black rounded-full transform -rotate-3 shadow-inner"></span>
          
          {/* Snout bottom smile accent */}
          <span className="absolute bottom-[20%] w-[25%] h-[8%] bg-black/10 rounded-full"></span>
        </span>
      )}

      {hasO && logoType === "emoji" && (
        <span
          className={`relative rounded-full flex items-center justify-center bg-black/40 shadow-lg transform transition-transform duration-300 hover:scale-110 logo-pig-nose-glow border-white shrink-0 ${noseSizes[size]}`}
        >
          <span className={`select-none leading-none ${emojiSizes[size]}`}>{logoValue || "🐷"}</span>
        </span>
      )}

      {hasO && logoType === "image" && (
        <img
          src={logoValue || "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=120"}
          alt="Custom Logo"
          referrerPolicy="no-referrer"
          className={`rounded-full object-cover shadow-lg transform transition-transform duration-300 hover:scale-110 logo-pig-nose-glow border-white shrink-0 ${noseSizes[size]}`}
        />
      )}

      {/* Text between O and Highlight */}
      {textBeforeHighlight && (
        <span className="text-white">{textBeforeHighlight}</span>
      )}

      {/* Highlighted Suffix */}
      {highlightedWord && (
        <span 
          className="text-primary font-extrabold uppercase ml-1 animate-pulse" 
          style={{ 
            color: "var(--color-primary, #E8005A)",
            textShadow: "0 0 10px var(--color-primary, rgba(232, 0, 90, 0.4))"
          }}
        >
          {highlightedWord}
        </span>
      )}
    </div>
  );
}
