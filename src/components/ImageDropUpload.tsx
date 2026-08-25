/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Upload, Clipboard, Image as ImageIcon, X, Check, Link, Loader2 } from "lucide-react";
import { optimizeImage } from "../utils/imageOptimizer";

interface ImageDropUploadProps {
  value?: string;
  onChange?: (imageUrl: string) => void;
  currentImage?: string;
  onImageChange?: (imageUrl: string) => void;
  label?: string;
  placeholder?: string;
  previewHeight?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  allowUrl?: boolean;
}

export default function ImageDropUpload({
  value,
  onChange,
  currentImage,
  onImageChange,
  label = "Subir o pegar imagen (.png, .jpg)",
  placeholder = "Arrastra tu imagen aquí, pega del portapapeles o selecciona un archivo",
  previewHeight = "h-40",
  aspectRatio = "auto",
  allowUrl = true,
}: ImageDropUploadProps) {
  const effectiveValue = value !== undefined ? value : currentImage;
  const handleValueChange = (val: string) => {
    if (onChange) onChange(val);
    if (onImageChange) onImageChange(val);
  };

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [urlInput, setUrlInput] = useState(effectiveValue && !effectiveValue.startsWith("data:") ? effectiveValue : "");
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file conversion & canvas optimization
  const processFile = async (file: File | Blob) => {
    if (!file) return;
    if (file.type && !file.type.startsWith("image/") && file.type !== "application/octet-stream") {
      alert("Por favor selecciona un archivo de imagen válido (.png, .jpg, .jpeg, .webp, .svg)");
      return;
    }
    
    setIsProcessing(true);
    try {
      const optimized = await optimizeImage(file, 1200, 1200, 0.85);
      if (optimized) {
        handleValueChange(optimized);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Error processing image:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Paste from clipboard handler on container
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            processFile(blob);
            e.preventDefault();
            return;
          }
        }
      }
    }
  };

  // Paste button using modern navigator.clipboard
  const handleClipboardButtonClick = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((type) => type.startsWith("image/"));
          if (imageType) {
            const blob = await item.getType(imageType);
            await processFile(blob as File);
            return;
          }
        }
      }
      // Fallback prompt for text URL
      const text = await navigator.clipboard.readText();
      if (text && (text.startsWith("http://") || text.startsWith("https://") || text.startsWith("data:image/"))) {
        handleValueChange(text);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      } else {
        alert("Copia una imagen (.png o .jpg) en tu portapapeles y luego pulsa aquí o presiona Ctrl+V / Cmd+V.");
      }
    } catch (err) {
      alert("Para pegar tu imagen, haz clic en este cuadro y presiona Ctrl + V (o Cmd + V en Mac).");
    }
  };

  // Global paste listener when focused on this area
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        if (document.activeElement.id !== "image-drop-area") return;
      }
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              processFile(blob);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, []);

  return (
    <div className="space-y-2 text-left font-sans">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            <span>{label}</span>
          </label>
          {effectiveValue && (
            <button
              type="button"
              onClick={() => handleValueChange("")}
              className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Quitar</span>
            </button>
          )}
        </div>
      )}

      {/* Main dropzone */}
      <div
        id="image-drop-area"
        tabIndex={0}
        ref={containerRef}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all duration-300 outline-none flex flex-col items-center justify-center text-center group cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/15 scale-[1.01]"
            : effectiveValue
            ? "border-white/20 bg-black/40 hover:border-primary/50"
            : "border-white/10 bg-black/30 hover:border-white/25 hover:bg-black/40"
        } ${previewHeight}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs font-bold text-white">Optimizando imagen...</span>
          </div>
        ) : effectiveValue ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
            <img
              src={effectiveValue}
              alt="Uploaded Preview"
              referrerPolicy="no-referrer"
              className={`max-h-full object-contain mx-auto rounded-lg filter drop-shadow-md ${
                aspectRatio === "square" ? "aspect-square" : ""
              }`}
            />
            {/* Hover overlay with quick actions */}
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-2">
              <span className="text-xs font-display font-bold text-white uppercase tracking-wider flex items-center gap-1.5 bg-primary px-3 py-1.5 rounded-xl shadow-lg">
                <Upload className="w-3.5 h-3.5" />
                Cambiar / Subir otra
              </span>
              <span className="text-[10px] text-gray-300 font-light">
                O arrastra o pega (Ctrl+V) una nueva imagen
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-2 pointer-events-none">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
              {pasteSuccess ? (
                <Check className="w-5 h-5 text-green-400 animate-bounce" />
              ) : (
                <Upload className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                {pasteSuccess ? "¡Imagen cargada!" : "Subir, Arrastrar o Pegar Imagen"}
              </p>
              <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                {placeholder}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] bg-white/5 px-2 py-0.5 rounded-md text-gray-400 font-mono">
              <span>Soporta .PNG, .JPG o Enlace</span>
            </div>
          </div>
        )}
      </div>

      {/* Action helper buttons (Paste, URL, Info) */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClipboardButtonClick();
          }}
          className="flex-1 py-1.5 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-bold text-gray-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Clipboard className="w-3.5 h-3.5 text-primary" />
          <span>Pegar del Portapapeles (Ctrl+V)</span>
        </button>

        {allowUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowUrlInput(!showUrlInput);
            }}
            className="py-1.5 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-bold text-gray-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Link className="w-3.5 h-3.5 text-sky-400" />
            <span>{showUrlInput ? "Ocultar URL" : "Ingresar URL"}</span>
          </button>
        )}
      </div>

      {/* Optional URL input box */}
      {showUrlInput && (
        <div className="flex items-center gap-2 pt-1 animate-fadeIn">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://ejemplo.com/imagen.png"
            className="flex-1 bg-black/45 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary font-mono"
          />
          <button
            type="button"
            onClick={() => {
              if (urlInput.trim()) {
                handleValueChange(urlInput.trim());
                setShowUrlInput(false);
              }
            }}
            className="px-3 py-1.5 bg-primary rounded-xl text-xs font-bold text-white hover:opacity-90 cursor-pointer"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
