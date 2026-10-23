import React, { useState, useEffect } from "react";
import { Sparkles, X, MessageSquareHeart } from "lucide-react";

interface CookieBotIcon25DProps {
  botName?: string;
  greetingMessage?: string;
  animationFrequency?: "normal" | "frequent" | "subtle" | "none";
  isActive?: boolean;
  onClick: () => void;
  primaryColor?: string;
}

export const CookieBotIcon25D: React.FC<CookieBotIcon25DProps> = ({
  botName = "ChipBot",
  greetingMessage = "¡Hola! 🍪 Soy ChipBot. ¿Puedo ayudarte?",
  animationFrequency = "normal",
  isActive = true,
  onClick,
  primaryColor = "#8A1C9E",
}) => {
  const [isWinking, setIsWinking] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [showSparkle, setShowSparkle] = useState(false);

  // Periodic attention-grabbing animation
  useEffect(() => {
    if (animationFrequency === "none") return;

    let intervalMs = 6000;
    if (animationFrequency === "frequent") intervalMs = 3500;
    if (animationFrequency === "subtle") intervalMs = 12000;

    const timer = setInterval(() => {
      // Trigger animation sequence
      setIsBouncing(true);
      setShowSparkle(true);
      setTimeout(() => setIsWinking(true), 250);
      setTimeout(() => setIsWinking(false), 900);
      setTimeout(() => setIsBouncing(false), 1100);
      setTimeout(() => setShowSparkle(false), 1400);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [animationFrequency]);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center select-none font-sans">
      {/* Speech Bubble / Greeting Balloon */}
      {showGreeting && (
        <div
          onClick={onClick}
          className="mr-3 max-w-[240px] sm:max-w-[280px] cursor-pointer group animate-fadeIn transition-all duration-300 transform hover:scale-105"
        >
          <div className="relative bg-gradient-to-br from-[#260B33]/95 via-[#1a0624]/95 to-[#12031a]/95 text-white border border-white/15 px-3.5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md">
            {/* Small close button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowGreeting(false);
              }}
              className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-black/70 border border-white/20 text-gray-400 hover:text-white flex items-center justify-center text-[10px] transition-colors"
              title="Cerrar saludo"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-2">
              <span className="text-base leading-none pt-0.5">✨</span>
              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 font-display">
                    {botName}
                  </span>
                  <span className="flex h-1.5 w-1.5 relative">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isActive ? "bg-emerald-400" : "bg-gray-400"
                      }`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                        isActive ? "bg-emerald-500" : "bg-gray-500"
                      }`}
                    ></span>
                  </span>
                </div>
                <p className="text-xs text-gray-100 font-medium leading-snug line-clamp-2">
                  {greetingMessage}
                </p>
              </div>
            </div>

            {/* Bubble pointer tail right side */}
            <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-[#1a0624]/95"></div>
          </div>
        </div>
      )}

      {/* 2.5D Cookie Bot Button */}
      <div className="relative group cursor-pointer" onClick={onClick}>
        {/* Glow halo behind bot */}
        <div
          className="absolute -inset-2 rounded-full opacity-60 blur-lg transition-all duration-500 group-hover:opacity-100 group-hover:blur-xl"
          style={{
            background: isActive
              ? `radial-gradient(circle, ${primaryColor} 0%, rgba(255,42,133,0.3) 60%, transparent 80%)`
              : "radial-gradient(circle, rgba(120,120,120,0.3) 0%, transparent 70%)"
          }}
        />

        {/* Ambient 3D floor shadow */}
        <div
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-black/60 rounded-full blur-[3px] transition-all duration-300 ${
            isBouncing ? "scale-75 opacity-40 translate-y-1" : "scale-100 opacity-70"
          }`}
        />

        {/* Floating container with 2.5D perspective tilt */}
        <div
          className={`relative transition-transform duration-300 transform group-hover:scale-110 active:scale-95 ${
            isBouncing ? "-translate-y-2.5 rotate-3" : "translate-y-0"
          }`}
          style={{ perspective: "1000px" }}
        >
          {/* Sparkle burst when animating */}
          {showSparkle && (
            <div className="absolute -top-3 -right-2 z-20 animate-ping text-amber-300 pointer-events-none">
              <Sparkles className="w-5 h-5 fill-amber-300 text-yellow-200" />
            </div>
          )}

          {/* 2.5D Cookie Bot SVG Art */}
          <svg
            width="68"
            height="68"
            viewBox="0 0 100 100"
            className="filter drop-shadow-xl"
            style={{ overflow: "visible" }}
          >
            <defs>
              {/* 3D Bevel Rim Gradient */}
              <linearGradient id="cookieRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8d4a1b" />
                <stop offset="60%" stopColor="#5d2c0b" />
                <stop offset="100%" stopColor="#3d1b06" />
              </linearGradient>

              {/* Cookie Face Baked Gradient */}
              <radialGradient id="cookieFaceGrad" cx="38%" cy="32%" r="65%">
                <stop offset="0%" stopColor="#ffd89b" />
                <stop offset="35%" stopColor="#e59850" />
                <stop offset="75%" stopColor="#b86926" />
                <stop offset="100%" stopColor="#7a3e12" />
              </radialGradient>

              {/* Chocolate Chip 3D Gradient */}
              <radialGradient id="chocoChipGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#5c2c16" />
                <stop offset="45%" stopColor="#301509" />
                <stop offset="100%" stopColor="#140702" />
              </radialGradient>

              {/* Robot Visor Screen Gradient */}
              <linearGradient id="robotVisorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#090d16" />
                <stop offset="100%" stopColor="#030712" />
              </linearGradient>

              {/* Antenna Glow */}
              <radialGradient id="antennaGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="60%" stopColor="#4facfe" />
                <stop offset="100%" stopColor="#0072ff" />
              </radialGradient>

              {/* Metallic Ear Piece */}
              <linearGradient id="metalEarpiece" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>

            {/* --- ANTENNA --- */}
            {/* Antenna Stem */}
            <rect x="47.5" y="8" width="5" height="14" rx="2.5" fill="url(#metalEarpiece)" />
            {/* Antenna Glowing Orb */}
            <circle
              cx="50"
              cy="8"
              r="6.5"
              fill={isActive ? "url(#antennaGlow)" : "#64748b"}
              className={isActive ? "animate-pulse" : ""}
            />
            {/* Spark ring */}
            {isActive && (
              <circle
                cx="50"
                cy="8"
                r="8.5"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="2 3"
                opacity="0.8"
                className="animate-spin"
                style={{ transformOrigin: "50px 8px", animationDuration: "4s" }}
              />
            )}

            {/* --- 2.5D BISCUIT RIM (Extrusion depth layer) --- */}
            <circle cx="50" cy="55" r="42" fill="url(#cookieRimGrad)" />

            {/* --- 2.5D MAIN COOKIE FACE (Shifted up for isometric bevel) --- */}
            <circle cx="50" cy="50" r="41" fill="url(#cookieFaceGrad)" />

            {/* Cookie Texture / Crust Crackles */}
            <path
              d="M24 35 Q30 38 34 32 M68 33 Q74 38 78 44 M22 62 Q28 65 32 60 M66 68 Q72 65 76 72"
              stroke="#7a3c10"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.55"
            />

            {/* --- 3D CHOCOLATE CHIPS --- */}
            {/* Chip 1 (Top-Left) */}
            <g transform="translate(22, 28) rotate(-15)">
              <ellipse cx="6" cy="7" rx="6.5" ry="5.5" fill="#140702" opacity="0.6" />
              <ellipse cx="5" cy="5" rx="6" ry="5" fill="url(#chocoChipGrad)" />
              <circle cx="3.5" cy="3.5" r="1.5" fill="#8d4c28" opacity="0.8" />
            </g>

            {/* Chip 2 (Top-Right) */}
            <g transform="translate(68, 26) rotate(20)">
              <ellipse cx="6" cy="7" rx="6" ry="5" fill="#140702" opacity="0.6" />
              <ellipse cx="5" cy="5" rx="5.5" ry="4.5" fill="url(#chocoChipGrad)" />
              <circle cx="3.5" cy="3.5" r="1.3" fill="#8d4c28" opacity="0.8" />
            </g>

            {/* Chip 3 (Bottom-Center-Right) */}
            <g transform="translate(62, 66) rotate(45)">
              <ellipse cx="6" cy="7" rx="7" ry="5.5" fill="#140702" opacity="0.6" />
              <ellipse cx="5" cy="5" rx="6.5" ry="5" fill="url(#chocoChipGrad)" />
              <circle cx="3.5" cy="3.5" r="1.6" fill="#8d4c28" opacity="0.8" />
            </g>

            {/* Chip 4 (Bottom-Left) */}
            <g transform="translate(24, 68) rotate(-30)">
              <ellipse cx="5" cy="6" rx="5.5" ry="4.5" fill="#140702" opacity="0.6" />
              <ellipse cx="4" cy="4" rx="5" ry="4" fill="url(#chocoChipGrad)" />
              <circle cx="2.5" cy="2.5" r="1.2" fill="#8d4c28" opacity="0.8" />
            </g>

            {/* --- ROBOT SIDE EAR-PIECES (Headphones) --- */}
            {/* Left earpiece */}
            <rect x="5" y="44" width="6" height="15" rx="3" fill="url(#metalEarpiece)" />
            <circle cx="8" cy="51.5" r="2.5" fill={isActive ? "#00f2fe" : "#64748b"} />

            {/* Right earpiece */}
            <rect x="89" y="44" width="6" height="15" rx="3" fill="url(#metalEarpiece)" />
            <circle cx="92" cy="51.5" r="2.5" fill={isActive ? "#00f2fe" : "#64748b"} />

            {/* --- ROBOT VISOR / CYBER FACE --- */}
            {/* Screen Border with 2.5D depth */}
            <rect
              x="25"
              y="40"
              width="50"
              height="24"
              rx="12"
              fill="#1e293b"
              stroke="url(#metalEarpiece)"
              strokeWidth="1.8"
            />
            {/* Screen Inner Glass */}
            <rect x="27" y="42" width="46" height="20" rx="10" fill="url(#robotVisorGrad)" />

            {/* Glass reflection streak */}
            <path
              d="M32 44 L58 44 Q48 52 38 60 L32 60 Z"
              fill="white"
              opacity="0.08"
            />

            {/* --- ROBOT EYES & SMILE --- */}
            {isActive ? (
              isWinking ? (
                /* Winking Face */
                <g>
                  {/* Left Eye: Normal glowing LED */}
                  <circle cx="39" cy="52" r="3.2" fill="#00f2fe" filter="drop-shadow(0 0 3px #00f2fe)" />
                  <circle cx="38" cy="51" r="1" fill="#ffffff" />
                  {/* Right Eye: Wink arc */}
                  <path
                    d="M58 53 Q62 48 66 53"
                    stroke="#00f2fe"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    fill="none"
                    filter="drop-shadow(0 0 2px #00f2fe)"
                  />
                  {/* Cute Open Mouth */}
                  <path
                    d="M48 54 Q51 59 54 54"
                    stroke="#ff2a85"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              ) : (
                /* Normal Happy Face */
                <g>
                  {/* Left Eye */}
                  <circle cx="40" cy="52" r="3.2" fill="#00f2fe" filter="drop-shadow(0 0 3px #00f2fe)" />
                  <circle cx="39" cy="50.8" r="1" fill="#ffffff" />
                  {/* Right Eye */}
                  <circle cx="62" cy="52" r="3.2" fill="#00f2fe" filter="drop-shadow(0 0 3px #00f2fe)" />
                  <circle cx="61" cy="50.8" r="1" fill="#ffffff" />
                  {/* Sweet Smile */}
                  <path
                    d="M48 55 Q51 58 54 55"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              )
            ) : (
              /* Sleeping / Inactive Face (-.-) */
              <g opacity="0.6">
                <path d="M37 53 L43 53" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <path d="M59 53 L65 53" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <path d="M49 56 L53 56" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            )}

            {/* Cheek blush spots */}
            {isActive && (
              <>
                <ellipse cx="32" cy="55" rx="2.5" ry="1.5" fill="#ff2a85" opacity="0.55" />
                <ellipse cx="70" cy="55" rx="2.5" ry="1.5" fill="#ff2a85" opacity="0.55" />
              </>
            )}
          </svg>

          {/* Online badge pill */}
          <div
            className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase font-display border shadow-md flex items-center gap-1 ${
              isActive
                ? "bg-emerald-950/90 text-emerald-400 border-emerald-500/50"
                : "bg-gray-900/90 text-gray-400 border-gray-600/50"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? "bg-emerald-400 animate-pulse" : "bg-gray-500"
              }`}
            />
            <span>{isActive ? "IA" : "OFF"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
