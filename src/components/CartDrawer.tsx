/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem, MenuItem } from "../types";
import { X, Trash2, MessageSquare, ShoppingBag, Plus, Minus, FileText, Instagram, Copy, Check, ExternalLink, Sparkles, CheckCircle2, MapPin, Loader2, Navigation, Phone } from "lucide-react";
import { useState } from "react";
import { playCartSendSound } from "../utils/soundEffects";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  whatsappPhone?: string;
  storeName?: string;
  storeSubtitle?: string;
  instagramMode?: boolean;
  instagramDmUrl?: string;
  onNotify?: (message: string) => void;
  onOrderSent?: (orderSummary: string, channel: "whatsapp" | "instagram") => void;
}

// Robust extractor for clean lowercase Instagram username without @, slashes or parameters
export const extractInstagramHandle = (urlOrHandle: string): string => {
  if (!urlOrHandle) return "liacookies70";
  let clean = urlOrHandle.trim();
  clean = clean.split("?")[0].split("#")[0];
  clean = clean.replace(/\/+$/, "");
  if (clean.includes("/")) {
    const segments = clean.split("/").filter(Boolean);
    clean = segments[segments.length - 1] || "liacookies70";
  }
  return clean.replace(/^@/, "").toLowerCase().trim() || "liacookies70";
};

// Helper to construct Instagram DM link with pre-filled message text (?text=...)
// Standard format: https://ig.me/m/<username>?text=<encoded_order> (no trailing slash before query)
export const getInstagramDmUrlWithText = (baseDmUrl: string, messageText: string): string => {
  const handle = extractInstagramHandle(baseDmUrl);
  return `https://ig.me/m/${handle}?text=${encodeURIComponent(messageText)}`;
};

// Helper to construct WhatsApp link with pre-filled message text (?text=...)
export const getWhatsAppUrlWithText = (phone: string, messageText: string): string => {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "18498140019";
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
};

// Robust clipboard copy with multi-layer fallback for iframes, mobile Safari, iOS and Android
export const copyToClipboardRobust = (text: string): boolean => {
  let copied = false;

  // Layer 1: Synchronous textarea with execCommand (preserves user-gesture context for popups & works in iframes)
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "2em";
    textarea.style.height = "2em";
    textarea.style.padding = "0";
    textarea.style.border = "none";
    textarea.style.outline = "none";
    textarea.style.boxShadow = "none";
    textarea.style.background = "transparent";
    textarea.setAttribute("readonly", "");
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    copied = document.execCommand("copy");
    document.body.removeChild(textarea);
  } catch (e) {
    console.warn("execCommand fallback failed:", e);
  }

  // Layer 2: Modern Clipboard API
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch((err) => {
      console.warn("navigator.clipboard.writeText failed:", err);
    });
  }

  return copied;
};

export interface OrderSummaryOptions {
  isForInstagram?: boolean;
  customerName?: string;
  deliveryMethod?: "delivery" | "takeout" | "table";
  address?: string;
  tableNumber?: string;
  storeName?: string;
  storeSubtitle?: string;
}

export const generateOrderSummaryText = (
  cart: CartItem[],
  options?: OrderSummaryOptions
): string => {
  const {
    isForInstagram = false,
    customerName = "",
    deliveryMethod = "delivery",
    address = "",
    tableNumber = "",
    storeName = "Lia Cookies",
    storeSubtitle = "Dulce Experiencia de Sabores",
  } = options || {};

  const subtotal = cart.reduce((acc, item) => acc + item.item.price * item.quantity, 0);

  if (cart.length === 0) {
    if (isForInstagram) {
      return `¡Hola! Me comunico desde la plataforma de ${storeName} 🍪 Me gustaría consultar sobre sus galletas artesanales y realizar un pedido ✨`;
    }
    return `🍪 *${storeName.toUpperCase()}* 🍪\n_${storeSubtitle}_\n\n¡Hola! Me gustaría consultar sobre sus galletas artesanales y realizar un pedido ✨🍪`;
  }

  let itemsText = "";
  cart.forEach((cartItem) => {
    const itemNote = cartItem.notes ? (isForInstagram ? `\n   Nota: ${cartItem.notes}` : `\n   _Nota: ${cartItem.notes}_`) : "";
    const unitLabel = cartItem.item.unit ? ` (${cartItem.item.unit})` : "";
    if (isForInstagram) {
      itemsText += `🍪 ${cartItem.quantity}x ${cartItem.item.name}${unitLabel} - RD$ ${(cartItem.item.price * cartItem.quantity).toLocaleString()}${itemNote}\n`;
    } else {
      itemsText += `🍪 *${cartItem.quantity}x* ${cartItem.item.name}${unitLabel} - RD$ ${(cartItem.item.price * cartItem.quantity).toLocaleString()}${itemNote}\n`;
    }
  });

  const clientNameDisplay = customerName.trim() || "Cliente";
  const addressClean = address.trim();

  let deliveryLabel = "";
  if (deliveryMethod === "delivery") {
    if (addressClean) {
      deliveryLabel = isForInstagram
        ? `🚚 Para Envío (Delivery)\n📍 Dirección: ${addressClean}`
        : `🚚 *Para Envío (Delivery)*\n📍 *Dirección:* ${addressClean}`;
    } else {
      deliveryLabel = isForInstagram
        ? `🚚 Para Envío (Delivery)`
        : `🚚 *Para Envío (Delivery)*`;
    }
  } else if (deliveryMethod === "takeout") {
    deliveryLabel = isForInstagram
      ? `🎒 Para Retirar (Takeout)`
      : `🎒 *Para Retirar (Takeout)*`;
  } else {
    deliveryLabel = isForInstagram
      ? `🍽️ Consumo en el Local\n📌 Mesa: ${tableNumber.trim() || "No especificada"}`
      : `🍽️ *Consumo en el Local*\n📌 *Mesa:* ${tableNumber.trim() || "No especificada"}`;
  }

  if (isForInstagram) {
    return `¡Hola! Me gustaría realizar el siguiente pedido en ${storeName}:\n\n` +
      `👤 CLIENTE: ${clientNameDisplay}\n` +
      `${deliveryLabel}\n\n` +
      `🛒 DETALLE DEL PEDIDO:\n` +
      `---------------------------\n` +
      `${itemsText}` +
      `---------------------------\n` +
      `💰 TOTAL: RD$ ${subtotal.toLocaleString()}\n\n` +
      `¡Muchas gracias! ✨🍪`;
  }

  return `🍪 *${storeName.toUpperCase()}* 🍪\n_${storeSubtitle}_\n\n📱 *CLIENTE:* ${clientNameDisplay}\n${deliveryLabel}\n\n🛒 *DETALLE DEL PEDIDO:*\n===========================\n${itemsText}===========================\n*TOTAL:* RD$ ${subtotal.toLocaleString()}\n\nMuchas gracias ✨🍪✨`;
};

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onUpdateNotes,
  whatsappPhone = "18498140019",
  storeName = "Lia Cookies",
  storeSubtitle = "Dulce Experiencia de Sabores",
  instagramMode = true,
  instagramDmUrl = "https://ig.me/m/liacookies70",
  onNotify,
  onOrderSent,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "takeout" | "table">("delivery");
  const [tableNumber, setTableNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errors, setErrors] = useState<{ customerName?: boolean; address?: boolean }>({});
  const [isCopied, setIsCopied] = useState(false);
  const [sentSuccessModal, setSentSuccessModal] = useState<{ channel: "whatsapp" | "instagram"; orderText: string } | null>(null);
  const [copiedOrderText, setCopiedOrderText] = useState("");

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if (onNotify) {
      onNotify("📍 Obteniendo tu ubicación actual...");
    }

    const processCoordinates = async (lat: number, lng: number, isApproximate = false) => {
      const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
      let locationText = mapsUrl;

      // Try fast reverse geocode (BigDataCloud client-side, CORS-friendly, Spanish support)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const placeNames = [
            data.locality || data.city || data.principalSubdivision,
            data.countryName,
          ].filter(Boolean);
          if (placeNames.length > 0) {
            locationText = `${placeNames.join(", ")} (${mapsUrl})`;
          }
        }
      } catch {
        // Try fallback to Nominatim
        try {
          const controller2 = new AbortController();
          const timeoutId2 = setTimeout(() => controller2.abort(), 2000);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { signal: controller2.signal }
          );
          clearTimeout(timeoutId2);
          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              locationText = `${data.display_name} (${mapsUrl})`;
            }
          }
        } catch {
          locationText = mapsUrl;
        }
      }

      setAddress((prev) => {
        if (prev.trim() && !prev.includes("maps.google.com")) {
          return `${prev.trim()} - 📍 ${locationText}`;
        }
        return locationText;
      });

      setErrors((prev) => ({ ...prev, address: false }));
      setIsGettingLocation(false);

      if (onNotify) {
        onNotify(isApproximate ? "📍 ¡Ubicación aproximada pegada en Dirección de Envío!" : "📍 ¡Ubicación actual pegada en Dirección de Envío!");
      }
    };

    const tryIpFallback = async (originalErrorMsg?: string) => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.latitude === "number" && typeof data.longitude === "number") {
            await processCoordinates(data.latitude, data.longitude, true);
            return;
          }
        }
      } catch (e) {
        console.warn("IP Geolocation fallback failed:", e);
      }

      setIsGettingLocation(false);
      if (onNotify) {
        onNotify(originalErrorMsg || "⚠️ No pudimos obtener tu ubicación automáticamente. Por favor escribe tu dirección.");
      }
    };

    if (!navigator.geolocation) {
      tryIpFallback("⚠️ La geolocalización directa no está disponible en este navegador.");
      return;
    }

    // Step 1: Try GPS with high accuracy (phone/tablet GPS)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        processCoordinates(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("High-accuracy GPS failed on mobile/browser, trying low-accuracy Wi-Fi/cellular:", err);

        // Step 2: Try low accuracy (Wi-Fi / cellular network positioning)
        navigator.geolocation.getCurrentPosition(
          (pos2) => {
            processCoordinates(pos2.coords.latitude, pos2.coords.longitude);
          },
          (err2) => {
            console.warn("Low accuracy GPS also failed, attempting IP-based fallback:", err2);
            let userMsg = "⚠️ No pudimos obtener la señal de ubicación. Por favor escribe tu dirección.";
            if (err.code === 1 || err2.code === 1) {
              userMsg = "⚠️ Permiso de ubicación no concedido en el navegador móvil. Activa los permisos de ubicación o escribe tu dirección.";
            }
            tryIpFallback(userMsg);
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
  };

  const subtotal = cart.reduce((acc, item) => acc + item.item.price * item.quantity, 0);

  // Pool of cookie and dessert emojis for messaging
  const DESSERT_COOKIE_EMOJIS = ["🍪", "🧁", "🍰", "🍩", "🍮", "🍫", "🧇", "🥮", "🍨", "🍧", "🎂", "🥧"];

  const getRandomSweetEmoji = () => {
    return DESSERT_COOKIE_EMOJIS[Math.floor(Math.random() * DESSERT_COOKIE_EMOJIS.length)];
  };

  const generateOrderSummary = (isForInstagram = false) => {
    return generateOrderSummaryText(cart, {
      isForInstagram,
      customerName,
      deliveryMethod,
      address,
      tableNumber,
      storeName,
      storeSubtitle,
    });
  };

  const handleSendOrder = () => {
    if (cart.length === 0) return;

    const newErrors: { customerName?: boolean; address?: boolean } = {};
    // Name is strictly mandatory
    if (!customerName.trim()) {
      newErrors.customerName = true;
    }
    // Location is NO LONGER mandatory in the cart, it is optional

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Automatically scroll to customer name error field
      const el = document.getElementById("cart-customer-name-field");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return;
    }

    const channel = instagramMode ? "instagram" : "whatsapp";
    const formattedMessage = generateOrderSummary(instagramMode);

    // Play pleasant confirmation sound when clicking Confirmar
    playCartSendSound();

    // 1. Copy complete order text to clipboard
    copyToClipboardRobust(formattedMessage);
    setCopiedOrderText(formattedMessage);
    setIsCopied(true);

    // 2. Notify parent / ChipBot that an order has been registered
    if (onOrderSent) {
      onOrderSent(formattedMessage, channel);
    }

    // 3. Inform user that order information is copied
    if (onNotify) {
      onNotify("📋 ¡Tu pedido completo ya ha sido copiado! Ahora solo pulsa el botón para pedir.");
    }

    // 4. Smoothly transition to the "Pedido Copiado y Listo" screen
    setSentSuccessModal({ channel, orderText: formattedMessage });
  };

  const handleManualReCopy = () => {
    const textToCopy = copiedOrderText || generateOrderSummary(instagramMode);
    copyToClipboardRobust(textToCopy);
    setIsCopied(true);
    if (onNotify) {
      onNotify("✅ ¡Pedido completo copiado de nuevo al portapapeles!");
    }
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleFinishOrder = () => {
    setSentSuccessModal(null);
    onClearCart();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Overlay backdrop */}
      <div
        id="cart-overlay"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      ></div>

      {/* Slide-out Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div id="cart-panel" className="w-screen max-w-md bg-dark-card border-l border-white/5 flex flex-col shadow-2xl relative">
          
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Mi Pedido</h3>
                <p className="text-xs text-gray-400">Arma tu coro crujiente</p>
              </div>
            </div>
            
            <button
              id="cart-close-btn"
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Contents */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-white">¿Vacío el plato?</h4>
                  <p className="text-sm text-gray-400 px-6 max-w-xs mt-1">
                    Agrega chicharrón crujientito, mofongos o tu combo preferido para activarte.
                  </p>
                </div>
                <button
                  id="cart-add-now"
                  onClick={onClose}
                  style={{ backgroundColor: "#E8005A" }}
                  className="px-6 py-2.5 rounded-xl font-display font-bold text-sm text-white hover:opacity-90 transition-all shadow-md shadow-primary/20 cursor-pointer"
                >
                  Ver el Menú
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-display">Platos Seleccionados</span>
                    <button
                      id="cart-clear-all"
                      onClick={onClearCart}
                      className="text-xs text-primary hover:text-primary-dark transition-colors font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpiar todo</span>
                    </button>
                  </div>

                  {cart.map((cartItem) => (
                    <div
                      id={`cart-item-row-${cartItem.item.id}`}
                      key={cartItem.item.id}
                      className="p-4 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex justify-between gap-2">
                        <div>
                          <h4 className="font-display font-bold text-sm text-white">
                            {cartItem.item.name}
                          </h4>
                          <span className="text-xs font-mono font-bold text-primary mt-1 block">
                            RD$ {cartItem.item.price.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 self-start shrink-0">
                          <button
                            id={`cart-item-dec-${cartItem.item.id}`}
                            onClick={() => onUpdateQuantity(cartItem.item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-black font-mono w-5 text-center text-white">
                            {cartItem.quantity}
                          </span>
                          <button
                            id={`cart-item-inc-${cartItem.item.id}`}
                            onClick={() => onUpdateQuantity(cartItem.item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Customize / Notes input */}
                      <div className="mt-3 flex items-center gap-2 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5">
                        <FileText className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <input
                          id={`cart-item-note-input-${cartItem.item.id}`}
                          type="text"
                          value={cartItem.notes || ""}
                          placeholder="Nota (ej. más limón, aguacate)"
                          onChange={(e) => onUpdateNotes(cartItem.item.id, e.target.value)}
                          className="bg-transparent border-none text-xs text-gray-300 focus:outline-none w-full placeholder-gray-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Logistics details for order */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-display block mb-1">Información de Entrega</span>
                  
                  {/* Customer Name */}
                  <div className="space-y-2 p-4 bg-primary/10 rounded-2xl border-l-4 border-[#E8005A] border-y border-r border-white/10 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8005A]/5 rounded-full blur-xl pointer-events-none"></div>
                    <label className="text-xs font-bold text-gray-200 block flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-white font-display uppercase tracking-wider text-[11px]">
                        👤 Tu Nombre (Completo)
                      </span>
                      <span className="text-[10px] text-primary font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
                        Obligatorio
                      </span>
                    </label>
                    <input
                      id="cart-customer-name-field"
                      type="text"
                      className={`w-full bg-black/45 border rounded-xl px-4 py-3 text-sm font-sans text-white focus:outline-none transition-all ${
                        errors.customerName
                          ? "border-red-500 ring-2 ring-red-500/20 focus:border-red-500"
                          : "border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                      }`}
                      placeholder="Escribe tu nombre y apellido..."
                      value={customerName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomerName(val);
                        if (errors.customerName && val.trim()) {
                          setErrors((prev) => ({ ...prev, customerName: false }));
                        }
                      }}
                    />
                    {errors.customerName && (
                      <p className="text-[11px] text-red-400 font-semibold animate-pulse mt-0.5 flex items-center gap-1">
                        ⚠️ Por favor, ingresa tu nombre completo para continuar.
                      </p>
                    )}
                  </div>

                  {/* Delivery Method Tabs */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-medium">¿Cómo deseas recibir?</label>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-black/45 rounded-xl border border-white/5">
                      {(["delivery", "takeout", "table"] as const).map((method) => (
                        <button
                          key={method}
                          onClick={() => {
                            setDeliveryMethod(method);
                            setErrors((prev) => ({
                              ...prev,
                              address: method === "delivery" ? prev.address : false
                            }));
                          }}
                          className={`py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
                            deliveryMethod === method
                              ? "bg-primary text-white shadow-md shadow-primary/20"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {method === "delivery" ? "Delivery" : method === "takeout" ? "Retirar" : "En Mesa"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address or Table details dynamically shown */}
                  {deliveryMethod === "delivery" && (
                    <div className="space-y-2 p-4 bg-primary/10 rounded-2xl border-l-4 border-[#E8005A] border-y border-r border-white/10 shadow-lg relative overflow-hidden animate-fadeIn">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8005A]/5 rounded-full blur-xl pointer-events-none"></div>
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-1.5 text-white font-display uppercase tracking-wider text-[11px] font-bold">
                          🚚 Dirección de Envío
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            id="cart-location-btn"
                            onClick={handleGetLocation}
                            disabled={isGettingLocation}
                            className="px-2.5 py-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 active:scale-95 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm shadow-pink-500/20 transition-all cursor-pointer disabled:opacity-60"
                            title="Obtener y pegar mi ubicación GPS actual"
                          >
                            {isGettingLocation ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Obteniendo...</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="w-3 h-3 text-white" />
                                <span>Ubicación</span>
                              </>
                            )}
                          </button>
                          <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                            Opcional
                          </span>
                        </div>
                      </div>
                      <textarea
                        id="cart-address-field"
                        rows={2}
                        className="w-full bg-black/45 border border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary shadow-inner rounded-xl px-4 py-3 text-sm font-sans text-white focus:outline-none transition-all resize-none placeholder-gray-500"
                        placeholder="Opcional: Calle, Número, Sector o pulsa 'Ubicación' para GPS..."
                        value={address}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAddress(val);
                        }}
                      ></textarea>
                    </div>
                  )}

                  {deliveryMethod === "table" && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label className="text-xs text-gray-400 font-medium">Número de Mesa</label>
                      <input
                        id="cart-table-field"
                        type="number"
                        className="w-full bg-black/25 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-sans text-white focus:outline-none focus:border-primary placeholder-gray-600"
                        placeholder="Ej. Mesa 4"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Pricing Summary & Checkout Button Footer */}
          {cart.length > 0 && (
            <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">RD$ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>ITBIS (Impuestos)</span>
                  <span className="italic">No Incluidos</span>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                  <span className="font-display font-medium text-white text-base">Total Estimado</span>
                  <span className="text-2xl font-black font-mono text-white">
                    <span className="text-sm text-primary mr-0.5">RD$</span>
                    {subtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Validation warning in case of block */}
              {(errors.customerName || errors.address) && (
                <div className="p-3 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-pulse">
                  <span>⚠️ Por favor completa los campos obligatorios.</span>
                </div>
              )}

              {instagramMode && (
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-2.5 text-[11px] text-pink-200 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Tu pedido se abrirá pre-rellenado en Instagram DM, listo para presionar <strong>Enviar</strong>.</span>
                </div>
              )}

              <button
                id="cart-submit-btn"
                onClick={handleSendOrder}
                className="w-full py-4 rounded-2xl font-display font-bold text-white hover:opacity-95 selection:bg-none transform transition-all duration-300 flex items-center justify-center gap-2 shadow-lg scale-100 hover:scale-[1.02] active:scale-[0.98] cursor-pointer bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 shadow-pink-500/25"
                style={!instagramMode ? { backgroundColor: "var(--color-primary, #8A1C9E)" } : {}}
              >
                <Check className="w-5 h-5 text-white" />
                <span className="text-base tracking-wide">Confirmar</span>
              </button>
              
              <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest font-display">
                Estimamos tu total • Impuestos no incluidos
              </p>
            </div>
          )}

          {/* Order Sent & Copy Confirmation Guidance Modal Overlay */}
          {sentSuccessModal && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-6 animate-fadeIn justify-between">
              <div className="space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                      sentSuccessModal.channel === "instagram"
                        ? "bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 shadow-pink-500/30"
                        : "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/30"
                    }`}
                  >
                    {sentSuccessModal.channel === "instagram" ? (
                      <Instagram className="w-6 h-6 text-white" />
                    ) : (
                      <Phone className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <button
                    onClick={() => setSentSuccessModal(null)}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Pedido Copiado y Listo!</span>
                  </div>
                  <h3 className="text-xl font-display font-black text-white">
                    {sentSuccessModal.channel === "instagram"
                      ? "¡Listo para Enviar en Instagram DM!"
                      : "¡Listo para Enviar en WhatsApp!"}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed font-light">
                    Hemos abierto la aplicación con tu pedido. Además, toda la información de tu orden ya fue{" "}
                    <strong className="text-white font-semibold underline underline-offset-2">copiada al portapapeles</strong>.
                  </p>
                </div>

                {/* Step-by-step visual instruction */}
                <div className="space-y-2.5 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-gray-200">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-emerald-500/30">
                      1
                    </span>
                    <p className="text-[12px] leading-snug">
                      La información completa de tu pedido ya está copiada.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 border border-primary/30">
                      2
                    </span>
                    <p className="text-[12px] leading-snug">
                      <strong className="text-amber-300">¿No se visualiza el texto?</strong> Solo mantén presionado el campo de chat y pulsa <strong className="text-white underline">Pegar</strong>.
                    </p>
                  </div>
                </div>

                {/* Discreet backup preview */}
                <details className="group bg-black/40 border border-white/10 rounded-xl p-3 text-xs">
                  <summary className="flex items-center justify-between cursor-pointer list-none text-gray-400 group-hover:text-gray-200 select-none">
                    <span className="text-[11px] font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-pink-400" />
                      Ver texto completo del pedido copiado
                    </span>
                    <span className="text-[10px] text-pink-300 underline underline-offset-2">Ver / Copiar</span>
                  </summary>
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 uppercase font-mono">Respaldo copiado</span>
                      <button
                        type="button"
                        onClick={handleManualReCopy}
                        className="text-[10px] font-bold text-pink-300 hover:text-pink-200 flex items-center gap-1 cursor-pointer bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{isCopied ? "¡Copiado!" : "Copiar de nuevo"}</span>
                      </button>
                    </div>
                    <div className="bg-black/60 rounded-lg p-2.5 max-h-24 overflow-y-auto font-mono text-[10px] text-gray-300 whitespace-pre-wrap leading-relaxed border border-white/5">
                      {copiedOrderText || sentSuccessModal.orderText}
                    </div>
                  </div>
                </details>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                {sentSuccessModal.channel === "instagram" ? (
                  <a
                    href={getInstagramDmUrlWithText(
                      instagramDmUrl || "https://ig.me/m/liacookies70",
                      copiedOrderText || sentSuccessModal.orderText
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      playCartSendSound();
                      copyToClipboardRobust(copiedOrderText || sentSuccessModal.orderText);
                    }}
                    className="w-full py-3.5 rounded-xl font-display font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 transition-all cursor-pointer"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Pedir en Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                ) : (
                  <a
                    href={getWhatsAppUrlWithText(
                      whatsappPhone ? whatsappPhone.replace(/[^0-9]/g, "") : "18498140019",
                      copiedOrderText || sentSuccessModal.orderText
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      playCartSendSound();
                      copyToClipboardRobust(copiedOrderText || sentSuccessModal.orderText);
                    }}
                    className="w-full py-3.5 rounded-xl font-display font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Pedir por WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleFinishOrder}
                  className="w-full py-2.5 rounded-xl font-sans text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
                >
                  Listo, ya envié mi pedido • Limpiar Carrito
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
