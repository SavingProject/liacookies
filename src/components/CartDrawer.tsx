/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem, MenuItem } from "../types";
import { X, Trash2, MessageSquare, ShoppingBag, Plus, Minus, FileText } from "lucide-react";
import { useState } from "react";

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
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onUpdateNotes,
  whatsappPhone = "18498140019",
  storeName = "MONTE PORK",
  storeSubtitle = "El Más Crujiente de la Región",
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "takeout" | "table">("delivery");
  const [tableNumber, setTableNumber] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<{ customerName?: boolean; address?: boolean }>({});

  const subtotal = cart.reduce((acc, item) => acc + item.item.price * item.quantity, 0);

  // Available side dishes for selecting if needed
  const guarnicionesDisponibles = [
    "Yuca en Mojo",
    "Yuca Frita",
    "Tostones al Ajillo",
    "Papas Fritas",
    "Casabe tostado",
    "Batata Frita"
  ];

  // Pool of cookie and dessert emojis for WhatsApp messaging
  const DESSERT_COOKIE_EMOJIS = ["🍪", "🧁", "🍰", "🍩", "🍮", "🍫", "🧇", "🥮", "🍨", "🍧", "🎂", "🥧"];

  const getRandomSweetEmoji = () => {
    return DESSERT_COOKIE_EMOJIS[Math.floor(Math.random() * DESSERT_COOKIE_EMOJIS.length)];
  };

  const handleSendWhatsApp = () => {
    if (cart.length === 0) return;

    const newErrors: { customerName?: boolean; address?: boolean } = {};
    if (!customerName.trim()) {
      newErrors.customerName = true;
    }
    if (deliveryMethod === "delivery" && !address.trim()) {
      newErrors.address = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Automatically scroll to first error if possible
      const errField = newErrors.customerName ? "cart-customer-name-field" : "cart-address-field";
      const el = document.getElementById(errField);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return;
    }

    let itemsText = "";
    cart.forEach((cartItem) => {
      const itemNote = cartItem.notes ? `\n   _Nota: ${cartItem.notes}_` : "";
      const unitLabel = cartItem.item.unit ? ` (${cartItem.item.unit})` : "";
      const sweetBullet = getRandomSweetEmoji();
      itemsText += `${sweetBullet} *${cartItem.quantity}x* ${cartItem.item.name}${unitLabel} - RD$ ${(cartItem.item.price * cartItem.quantity).toLocaleString()}${itemNote}\n`;
    });

    const deliveryLabel =
      deliveryMethod === "delivery"
        ? `🚚 *Para Envío (Delivery)*\n📍 *Dirección:* ${address}`
        : deliveryMethod === "takeout"
        ? `🎒 *Para Retirar (Takeout)*`
        : `🍽️ *Consumo en el Local*\n📌 *Mesa:* ${tableNumber || "No especificada"}`;

    const sweetLeft = getRandomSweetEmoji();
    const sweetRight = getRandomSweetEmoji();
    const sweetFooter1 = getRandomSweetEmoji();
    const sweetFooter2 = getRandomSweetEmoji();

    const formattedMessage = `${sweetLeft} *${storeName.toUpperCase()}* ${sweetRight}\n_${storeSubtitle}_\n\n📱 *CLIENTE:* ${customerName}\n${deliveryLabel}\n\n🛒 *DETALLE DEL PEDIDO:*\n===========================\n${itemsText}===========================\n*TOTAL:* RD$ ${subtotal.toLocaleString()}\n\nMuchas gracias ✨${sweetFooter1}${sweetFooter2}`;

    const encodedMessage = encodeURIComponent(formattedMessage);
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");

    // Clear the cart items since the order has already been executed/sent
    onClearCart();

    // Close the drawer
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
                      <label className="text-xs font-bold text-gray-200 block flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-white font-display uppercase tracking-wider text-[11px]">
                          🚚 Dirección de Envío
                        </span>
                        <span className="text-[10px] text-primary font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
                          Obligatorio
                        </span>
                      </label>
                      <textarea
                        id="cart-address-field"
                        rows={2}
                        className={`w-full bg-black/45 border rounded-xl px-4 py-3 text-sm font-sans text-white focus:outline-none transition-all resize-none ${
                          errors.address
                            ? "border-red-500 ring-2 ring-red-500/20 focus:border-red-500"
                            : "border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                        }`}
                        placeholder="Calle, Número, Sector, Referencia para el delivery..."
                        value={address}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAddress(val);
                          if (errors.address && val.trim()) {
                            setErrors((prev) => ({ ...prev, address: false }));
                          }
                        }}
                      ></textarea>
                      {errors.address && (
                        <p className="text-[11px] text-red-400 font-semibold animate-pulse mt-0.5 flex items-center gap-1">
                          ⚠️ Por favor, ingresa la dirección para enviar tu pedido.
                        </p>
                      )}
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
                  <span>Subtotal del corral</span>
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

              <button
                id="cart-submit-btn"
                onClick={handleSendWhatsApp}
                style={{ backgroundColor: "#E8005A" }}
                className="w-full py-4 rounded-2xl font-display font-bold text-white hover:opacity-95 selection:bg-none transform transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 scale-100 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-white text-primary" />
                <span>Pedir por WhatsApp</span>
              </button>
              
              <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest font-display">
                Estimamos tu total • Impuestos no incluidos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
