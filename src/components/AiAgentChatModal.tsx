import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Sparkles,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  ExternalLink,
  MessageCircle,
  Instagram,
  AlertCircle,
  Cookie,
  Check,
  Plus,
  Minus,
  Trash2,
  Compass,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { MenuItem, MenuCategory, StoreSettings, ContactInfo, AiAgentConfig, CartItem } from "../types";
import { buildFullAiPrompt, DEFAULT_AI_AGENT_CONFIG } from "../utils/aiPromptBuilder";
import {
  generateOrderSummaryText,
  copyToClipboardRobust,
  getInstagramDmUrlWithText,
  getWhatsAppUrlWithText,
} from "./CartDrawer";
import {
  playUserSendSound,
  playAiReplySound,
  playCartAddSound,
  playCartRemoveSound,
} from "../utils/soundEffects";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: number;
  isError?: boolean;
  cartUpdates?: string[];
}

export interface ParsedButton {
  type: "order" | "add_item" | "remove_item" | "delete_item" | "action" | "link";
  label: string;
  param1: string; // specs / itemId / action / url
  param2?: string; // qty / optional param
  rawTag: string;
}

interface AiAgentChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiConfig: AiAgentConfig;
  menuItems: MenuItem[];
  categories: MenuCategory[];
  storeSettings: StoreSettings;
  bankAccounts: any[];
  contactInfo: ContactInfo;
  cart?: CartItem[];
  lastSentOrder?: { text: string; channel: "whatsapp" | "instagram"; timestamp: number } | null;
  onOpenCart?: () => void;
  onAddToCart?: (item: MenuItem, quantity?: number) => void;
  onBatchAddToCart?: (items: { item: MenuItem; quantity: number }[]) => void;
  onUpdateQuantity?: (itemId: string, delta: number) => void;
  onRemoveItem?: (itemId: string) => void;
  onClearCart?: () => void;
  onOrderSent?: (orderText: string, channel: "whatsapp" | "instagram") => void;
  onNavigateToSection?: (sectionId: string) => void;
  showToast?: (message: string) => void;
}

/**
 * Extracts button tags from text and returns clean text along with parsed buttons
 */
export function parseMessageButtons(text: string): { cleanText: string; buttons: ParsedButton[] } {
  const buttons: ParsedButton[] = [];
  let workingText = text;

  // Regex matches [button:type|label|param1|param2] or [boton:type|...]
  // Types: order/pedido, add_item/add_product/item/menu_item, remove_item/quitar/restar, delete_item/eliminar/borrar, action/accion, link/url
  const buttonRegex = /\[(?:button|boton):([a-zA-Z_-]+)\|([^\|\]]+)\|([^\|\]]+)(?:\|([^\]]+))?\]/gi;

  let match;
  while ((match = buttonRegex.exec(text)) !== null) {
    const rawTag = match[0];
    const rawType = match[1].toLowerCase();
    const label = match[2].trim();
    const param1 = match[3].trim();
    const param2 = match[4]?.trim();

    let normalizedType: "order" | "add_item" | "remove_item" | "delete_item" | "action" | "link" = "link";
    if (rawType === "order" || rawType === "pedido") {
      normalizedType = "order";
    } else if (
      rawType === "add_item" ||
      rawType === "item" ||
      rawType === "add_product" ||
      rawType === "agregar" ||
      rawType === "menu_item" ||
      rawType === "menu_select" ||
      rawType === "select"
    ) {
      normalizedType = "add_item";
    } else if (
      rawType === "remove_item" ||
      rawType === "remove" ||
      rawType === "quitar" ||
      rawType === "restar" ||
      rawType === "disminuir"
    ) {
      normalizedType = "remove_item";
    } else if (
      rawType === "delete_item" ||
      rawType === "delete" ||
      rawType === "eliminar" ||
      rawType === "borrar"
    ) {
      normalizedType = "delete_item";
    } else if (rawType === "action" || rawType === "accion") {
      normalizedType = "action";
    } else if (rawType === "link" || rawType === "url") {
      normalizedType = "link";
    }

    buttons.push({
      type: normalizedType,
      label,
      param1,
      param2,
      rawTag
    });
  }

  // Remove the button tags from display text
  const cleanText = workingText.replace(buttonRegex, "").trim();

  return { cleanText, buttons };
}

export const AiAgentChatModal: React.FC<AiAgentChatModalProps> = ({
  isOpen,
  onClose,
  aiConfig = DEFAULT_AI_AGENT_CONFIG,
  menuItems,
  categories,
  storeSettings,
  bankAccounts,
  contactInfo,
  cart = [],
  lastSentOrder = null,
  onOpenCart,
  onAddToCart,
  onBatchAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSent,
  onNavigateToSection,
  showToast,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clickedButtons, setClickedButtons] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastProcessedOrderTimestampRef = useRef<number>(0);

  // Auto-resize textarea height dynamically based on content (expand / shrink)
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollH = textareaRef.current.scrollHeight;
      const newHeight = Math.min(scrollH, 130);
      textareaRef.current.style.height = `${Math.max(38, newHeight)}px`;
    }
  };

  // Conversation & input text size adjustment (default: 13, minimum: 11, maximum: 17)
  const [chatFontSize, setChatFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("lia_chipbot_font_size");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 11 && parsed <= 17) {
          return parsed;
        }
      }
    } catch (e) {
      // Ignore
    }
    return 13; // Por defecto se queda como está (13px)
  });

  // Re-adjust textarea height when text value or font size scales
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, chatFontSize]);

  const handleIncreaseFontSize = () => {
    setChatFontSize((prev) => {
      const next = Math.min(17, prev + 1);
      try {
        localStorage.setItem("lia_chipbot_font_size", next.toString());
      } catch (e) {}
      return next;
    });
    setTimeout(() => textareaRef.current?.focus(), 30);
  };

  const handleDecreaseFontSize = () => {
    setChatFontSize((prev) => {
      const next = Math.max(11, prev - 1);
      try {
        localStorage.setItem("lia_chipbot_font_size", next.toString());
      } catch (e) {}
      return next;
    });
    setTimeout(() => textareaRef.current?.focus(), 30);
  };

  const botName = aiConfig.botName || "ChipBot";
  const isEnabled = aiConfig.enabled !== false;
  const primaryColor = storeSettings.primaryColor || "#8A1C9E";

  // Initial welcome message with interactive menu selection buttons
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = isEnabled
        ? `¡Hola! Soy **${botName}** 🤖🍪, tu asesor inteligente de Lia Cookies.\n\nPuedo responderte sobre nuestros sabores, precios, ofertas y **gestionar tu pedido automáticamente**: con solo pedírmelo agrego o elimino cualquier galleta de tu carrito en vivo, o puedes seleccionarlas directamente con los botones interactivos del menú.\n\n[button:action|📜 Ver Todas las Galletas en el Menú|view_category|entradas]\n[button:add_item|🍪 + Seleccionar Choco Chip (RD$ 200)|choco_chip|1]\n[button:add_item|📦 + Seleccionar Six Pack Surtido|six_pack|1]\n[button:action|🛍️ Ver Mi Pedido Actual|open_cart]\n\n¿Qué delicia se te antoja hoy? Dime o selecciona con los botones y la coloco en tu carrito ✨`
        : `¡Hola! Soy **${botName}** 🤖🍪.\n\nActualmente el agente IA se encuentra en reposo (desactivado por el administrador). Puedes explorar todo el menú de galletas, agregarlas a tu carrito o contactarnos directamente por nuestros canales oficiales.`;

      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: welcomeText,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [botName, isEnabled]);

  // Synchronize perception when an order has been sent (from Cart or ChipBot)
  useEffect(() => {
    if (
      lastSentOrder &&
      lastSentOrder.timestamp &&
      lastSentOrder.timestamp > lastProcessedOrderTimestampRef.current
    ) {
      lastProcessedOrderTimestampRef.current = lastSentOrder.timestamp;
      const channelName = lastSentOrder.channel === "instagram" ? "Instagram DM" : "WhatsApp";

      setMessages((prev) => {
        const alreadyHasNotice = prev.some((m) => m.id === `order_sent_${lastSentOrder.timestamp}`);
        if (alreadyHasNotice) return prev;

        return [
          ...prev,
          {
            id: `order_sent_${lastSentOrder.timestamp}`,
            sender: "bot",
            text: `🎉 **¡Pedido registrado con éxito!** He detectado que enviaste tu pedido mediante **${channelName}** 🍪✨\n\n📋 Toda la información de tu orden ya fue copiada a tu portapapeles. Si por alguna razón no se visualiza automáticamente en tu aplicación, solo debes mantener presionado y darle a **Pegar**.\n\n¿Deseas que te brinde los números de cuenta bancaria para la transferencia o consultar los tiempos estimados de entrega? 😊`,
            timestamp: lastSentOrder.timestamp,
          },
        ];
      });
    }
  }, [lastSentOrder]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && isEnabled) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isEnabled]);

  // Keep cursor focus in chat input continuously (when agent finishes response or changes loading state)
  useEffect(() => {
    if (!isLoading && isOpen && isEnabled) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isOpen, isEnabled]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, clickedButtons]);

  // Helper to extract numeric or word quantities in Spanish
  const extractQuantity = (str: string): number => {
    if (!str) return 1;
    const numMatch = str.match(/\b(\d+)\b/);
    if (numMatch) {
      const val = parseInt(numMatch[1], 10);
      if (!isNaN(val) && val > 0) return val;
    }
    const lower = str.toLowerCase();
    if (lower.includes("media docena")) return 6;
    if (lower.includes("docena")) return 12;
    if (lower.includes("diez")) return 10;
    if (lower.includes("nueve")) return 9;
    if (lower.includes("ocho")) return 8;
    if (lower.includes("siete")) return 7;
    if (lower.includes("seis")) return 6;
    if (lower.includes("cinco")) return 5;
    if (lower.includes("cuatro")) return 4;
    if (lower.includes("tres")) return 3;
    if (lower.includes("dos")) return 2;
    if (
      lower.includes("un ") ||
      lower.includes("una ") ||
      lower.includes("uno ") ||
      lower.startsWith("un") ||
      lower.startsWith("una")
    ) {
      return 1;
    }
    return 1;
  };

  // Helper to find a menu item by ID or fuzzy name / flavor
  const findMenuItem = (identifier: string): MenuItem | undefined => {
    if (!identifier) return undefined;
    const cleanId = identifier
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    if (!cleanId) return undefined;

    // 1. Direct ID match
    let match = menuItems.find((i) => i.id.toLowerCase() === cleanId);
    if (match) return match;

    // 2. Direct name exact match
    match = menuItems.find((i) => i.name.toLowerCase() === cleanId);
    if (match) return match;

    // 3. Name contains query
    match = menuItems.find((i) => i.name.toLowerCase().includes(cleanId));
    if (match) return match;

    // 4. Query contains name
    match = menuItems.find((i) => cleanId.includes(i.name.toLowerCase()));
    if (match) return match;

    // 5. Highly specific flavor and alias matching
    // Six Pack / Oferta Apertura
    if (
      cleanId.includes("sixpack") ||
      cleanId.includes("six pack") ||
      cleanId.includes("6 pack") ||
      cleanId.includes("6 cookies") ||
      cleanId.includes("caja") ||
      cleanId.includes("surtid") ||
      cleanId.includes("apertura") ||
      cleanId.includes("combo")
    ) {
      return (
        menuItems.find(
          (i) =>
            i.id === "six_pack_cookies" ||
            i.id.includes("six") ||
            i.name.toLowerCase().includes("six pack")
        ) || menuItems[menuItems.length - 1]
      );
    }

    // Guayaba & Cheese Cream
    if (
      cleanId.includes("guayaba") ||
      cleanId.includes("cheese") ||
      cleanId.includes("queso")
    ) {
      const found = menuItems.find(
        (i) =>
          i.id === "cookie_cheese_cream_guayaba" ||
          i.name.toLowerCase().includes("guayaba")
      );
      if (found) return found;
    }

    // Coco
    if (cleanId.includes("coco")) {
      const found = menuItems.find(
        (i) => i.id === "cookie_coco" || i.name.toLowerCase().includes("coco")
      );
      if (found) return found;
    }

    // Red Velvet
    if (cleanId.includes("velvet") || cleanId.includes("red")) {
      const found = menuItems.find(
        (i) => i.id === "cookie_red_velvet" || i.name.toLowerCase().includes("velvet")
      );
      if (found) return found;
    }

    // Dulce de Leche
    if (
      cleanId.includes("dulce de leche") ||
      cleanId.includes("dulce") ||
      cleanId.includes("leche") ||
      cleanId.includes("arequipe") ||
      cleanId.includes("manjar")
    ) {
      const found = menuItems.find(
        (i) =>
          i.id === "cookie_dulce_de_leche" ||
          i.name.toLowerCase().includes("leche")
      );
      if (found) return found;
    }

    // Pistacho
    if (cleanId.includes("pistacho") || cleanId.includes("pistachio")) {
      const found = menuItems.find(
        (i) =>
          i.id === "cookie_pistacho" ||
          i.name.toLowerCase().includes("pistacho")
      );
      if (found) return found;
    }

    // Chocolate
    if (
      cleanId.includes("choco") ||
      cleanId.includes("chocolate") ||
      cleanId.includes("chispas") ||
      cleanId.includes("chip")
    ) {
      const found = menuItems.find(
        (i) =>
          i.id === "cookie_chocolate" ||
          i.name.toLowerCase().includes("choco")
      );
      if (found) return found;
    }

    return undefined;
  };

  // Helper to extract multi-item requests and exact quantities from user plain text
  const parseNaturalLanguageCartRequests = (
    userText: string
  ): {
    clearsCart: boolean;
    adds: { item: MenuItem; quantity: number }[];
    removes: { item: MenuItem; quantity: number }[];
    deletes: { item: MenuItem }[];
  } => {
    const result = {
      clearsCart: false,
      adds: [] as { item: MenuItem; quantity: number }[],
      removes: [] as { item: MenuItem; quantity: number }[],
      deletes: [] as { item: MenuItem }[],
    };

    const lower = userText.toLowerCase().trim();
    if (!lower) return result;

    // Check clear cart intent
    if (
      lower.includes("vaciar carrito") ||
      lower.includes("vacía el carrito") ||
      lower.includes("vacia el carrito") ||
      lower.includes("borra todo") ||
      lower.includes("borrar todo") ||
      lower.includes("limpia el carrito") ||
      lower.includes("limpiar el carrito") ||
      lower.includes("elimina todo") ||
      lower.includes("eliminar todo") ||
      lower.includes("cancela todo")
    ) {
      result.clearsCart = true;
      return result;
    }

    // Split text into clauses / phrases to isolate different products
    // Delimiters: commas, semicolons, linebreaks, " y ", " e ", " con ", " más ", " mas ", " además ", " ademas ", " también ", " tambien "
    const segments = lower
      .split(/[,;\n]+|\s+(?:y|e|con|\+|más|mas|además|ademas|también|tambien|junto\s+a|junto\s+con)\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const processedItemIds = new Set<string>();

    segments.forEach((segment) => {
      const isDelete =
        segment.includes("elimina") ||
        segment.includes("eliminar") ||
        segment.includes("borra") ||
        segment.includes("borrar") ||
        segment.includes("cancela") ||
        segment.includes("ya no quiero");

      const isRemove =
        !isDelete &&
        (segment.includes("quita") ||
          segment.includes("quítame") ||
          segment.includes("quitame") ||
          segment.includes("resta") ||
          segment.includes("restame") ||
          segment.includes("réstame") ||
          segment.includes("saca") ||
          segment.includes("sácame") ||
          segment.includes("sacame") ||
          segment.includes("menos") ||
          segment.includes("disminuye"));

      const isAdd =
        !isDelete &&
        !isRemove &&
        (segment.includes("agrega") ||
          segment.includes("agregar") ||
          segment.includes("añade") ||
          segment.includes("anade") ||
          segment.includes("añadir") ||
          segment.includes("anadir") ||
          segment.includes("ponme") ||
          segment.includes("pon") ||
          segment.includes("quiero") ||
          segment.includes("dame") ||
          segment.includes("coloca") ||
          segment.includes("sumar") ||
          segment.includes("pídeme") ||
          segment.includes("pideme") ||
          segment.includes("incluye") ||
          segment.includes("trae") ||
          segment.includes("pide") ||
          lower.includes("agrega") ||
          lower.includes("quiero") ||
          lower.includes("ponme") ||
          lower.includes("dame"));

      const matchedItem = findMenuItem(segment);
      if (matchedItem && !processedItemIds.has(matchedItem.id)) {
        const qty = extractQuantity(segment);
        processedItemIds.add(matchedItem.id);

        if (isDelete) {
          result.deletes.push({ item: matchedItem });
        } else if (isRemove) {
          result.removes.push({ item: matchedItem, quantity: qty });
        } else if (isAdd) {
          result.adds.push({ item: matchedItem, quantity: qty });
        }
      }
    });

    // Fallback: If segments didn't capture all flavors mentioned in the user message,
    // do a direct keyword check across the entire text for each available menu item
    menuItems.forEach((item) => {
      if (processedItemIds.has(item.id)) return;

      const itemNameNorm = item.name.toLowerCase();
      const itemIdNorm = item.id.toLowerCase();
      let isMentioned = false;
      let matchedIndex = -1;

      if (itemIdNorm.includes("six") || itemNameNorm.includes("six pack")) {
        if (
          lower.includes("six pack") ||
          lower.includes("sixpack") ||
          lower.includes("6 pack") ||
          lower.includes("surtid")
        ) {
          isMentioned = true;
          matchedIndex = Math.max(
            lower.indexOf("six pack"),
            lower.indexOf("sixpack"),
            lower.indexOf("6 pack")
          );
        }
      } else if (itemIdNorm.includes("guayaba") || itemNameNorm.includes("guayaba")) {
        if (
          lower.includes("guayaba") ||
          lower.includes("cheese cream") ||
          lower.includes("queso crema")
        ) {
          isMentioned = true;
          matchedIndex = Math.max(lower.indexOf("guayaba"), lower.indexOf("cheese cream"));
        }
      } else if (itemIdNorm.includes("coco") || itemNameNorm.includes("coco")) {
        if (lower.includes("coco")) {
          isMentioned = true;
          matchedIndex = lower.indexOf("coco");
        }
      } else if (itemIdNorm.includes("velvet") || itemNameNorm.includes("velvet")) {
        if (lower.includes("velvet") || lower.includes("red velvet")) {
          isMentioned = true;
          matchedIndex = Math.max(lower.indexOf("velvet"), lower.indexOf("red velvet"));
        }
      } else if (itemIdNorm.includes("leche") || itemNameNorm.includes("leche")) {
        if (
          lower.includes("leche") ||
          lower.includes("dulce de leche") ||
          lower.includes("arequipe")
        ) {
          isMentioned = true;
          matchedIndex = Math.max(lower.indexOf("dulce de leche"), lower.indexOf("leche"));
        }
      } else if (itemIdNorm.includes("pistacho") || itemNameNorm.includes("pistacho")) {
        if (lower.includes("pistacho") || lower.includes("pistachio")) {
          isMentioned = true;
          matchedIndex = lower.indexOf("pistacho");
        }
      } else if (itemIdNorm.includes("chocolate") || itemNameNorm.includes("chocolate")) {
        if (lower.includes("chocolate") || lower.includes("choco") || lower.includes("chispas")) {
          isMentioned = true;
          matchedIndex = Math.max(lower.indexOf("chocolate"), lower.indexOf("choco"));
        }
      }

      if (isMentioned && matchedIndex !== -1) {
        processedItemIds.add(item.id);
        const contextBefore = lower.slice(Math.max(0, matchedIndex - 25), matchedIndex);
        const qty = extractQuantity(contextBefore);

        const isDelete =
          contextBefore.includes("elimina") ||
          contextBefore.includes("borra") ||
          contextBefore.includes("cancela");
        const isRemove =
          !isDelete &&
          (contextBefore.includes("quita") ||
            contextBefore.includes("resta") ||
            contextBefore.includes("saca") ||
            contextBefore.includes("menos"));

        if (isDelete) {
          result.deletes.push({ item });
        } else if (isRemove) {
          result.removes.push({ item, quantity: qty });
        } else {
          result.adds.push({ item, quantity: qty });
        }
      }
    });

    return result;
  };

  // Helper to execute automatic cart additions, reductions, deletions and clearing
  const processCartActions = (
    botReplyText: string,
    userText?: string
  ): { cleanedText: string; executedActions: string[] } => {
    const executedActions: string[] = [];
    let cleanedText = botReplyText;

    // Track handled item IDs to prevent duplicate additions between tags and NLP
    const handledAddIds = new Set<string>();
    const handledRemoveIds = new Set<string>();
    const handledDeleteIds = new Set<string>();

    // Regex for [cart:action|param1|param2] or [cart_action:action|...] or [carrito:action|...] or [pedido:action|...]
    const cartRegex = /\[(?:cart|cart_action|carrito|pedido):(add|agregar|sumar|añadir|anadir|remove|quitar|restar|delete|eliminar|borrar|clear|vaciar)(?:\|([^\|\]]+))?(?:\|([^\]]+))?\]/gi;

    let match;
    const itemsToAdd: { item: MenuItem; quantity: number }[] = [];

    while ((match = cartRegex.exec(botReplyText)) !== null) {
      let action = match[1].toLowerCase();
      let param1 = match[2]?.trim() || "";
      let param2 = match[3]?.trim();

      // Normalize action aliases
      if (
        action === "agregar" ||
        action === "sumar" ||
        action === "añadir" ||
        action === "anadir"
      ) {
        action = "add";
      } else if (action === "quitar" || action === "restar") {
        action = "remove";
      } else if (action === "eliminar" || action === "borrar") {
        action = "delete";
      } else if (action === "vaciar") {
        action = "clear";
      }

      // Check if parameters are inverted (e.g. [cart:add|2|cookie_chocolate])
      if (/^\d+$/.test(param1) && param2 && !/^\d+$/.test(param2)) {
        const tmp = param1;
        param1 = param2;
        param2 = tmp;
      }

      const qty = param2 ? extractQuantity(param2) : 1;
      const validQty = isNaN(qty) || qty <= 0 ? 1 : qty;

      if (action === "add") {
        const item = findMenuItem(param1);
        if (item) {
          itemsToAdd.push({ item, quantity: validQty });
          handledAddIds.add(item.id);
          executedActions.push(`+${validQty} ${item.name}`);
        }
      } else if (action === "remove") {
        const item = findMenuItem(param1);
        const cartEntry = cart.find(
          (ci) =>
            (item && ci.item.id === item.id) ||
            ci.item.id.toLowerCase() === param1.toLowerCase() ||
            ci.item.name.toLowerCase().includes(param1.toLowerCase()) ||
            param1.toLowerCase().includes(ci.item.name.toLowerCase())
        );
        if (cartEntry) {
          handledRemoveIds.add(cartEntry.item.id);
          if (onUpdateQuantity) {
            onUpdateQuantity(cartEntry.item.id, -validQty);
            executedActions.push(`-${validQty} ${cartEntry.item.name}`);
          }
        }
      } else if (action === "delete") {
        const item = findMenuItem(param1);
        const cartEntry = cart.find(
          (ci) =>
            (item && ci.item.id === item.id) ||
            ci.item.id.toLowerCase() === param1.toLowerCase() ||
            ci.item.name.toLowerCase().includes(param1.toLowerCase()) ||
            param1.toLowerCase().includes(ci.item.name.toLowerCase())
        );
        if (cartEntry) {
          handledDeleteIds.add(cartEntry.item.id);
          if (onRemoveItem) {
            onRemoveItem(cartEntry.item.id);
            executedActions.push(`Eliminado: ${cartEntry.item.name}`);
          }
        }
      } else if (action === "clear") {
        if (onClearCart) {
          onClearCart();
          executedActions.push("Carrito vaciado");
        }
      }
    }

    // Comprehensive Multi-item NLP: Check user message for any products requested that model missed
    if (userText) {
      const nlp = parseNaturalLanguageCartRequests(userText);

      if (nlp.clearsCart && executedActions.length === 0) {
        if (onClearCart) {
          onClearCart();
          executedActions.push("Carrito vaciado");
        }
      } else {
        // Add any missing items requested by user that model didn't emit tag for
        nlp.adds.forEach(({ item, quantity }) => {
          if (!handledAddIds.has(item.id)) {
            itemsToAdd.push({ item, quantity });
            handledAddIds.add(item.id);
            executedActions.push(`+${quantity} ${item.name}`);
          }
        });

        // Delete any missing items requested by user
        nlp.deletes.forEach(({ item }) => {
          if (!handledDeleteIds.has(item.id)) {
            handledDeleteIds.add(item.id);
            if (onRemoveItem) {
              onRemoveItem(item.id);
              executedActions.push(`Eliminado: ${item.name}`);
            }
          }
        });

        // Remove quantities for any missing items requested by user
        nlp.removes.forEach(({ item, quantity }) => {
          if (!handledRemoveIds.has(item.id)) {
            handledRemoveIds.add(item.id);
            if (onUpdateQuantity) {
              onUpdateQuantity(item.id, -quantity);
              executedActions.push(`-${quantity} ${item.name}`);
            }
          }
        });
      }
    }

    if (itemsToAdd.length > 0) {
      playCartAddSound();
      if (onBatchAddToCart) {
        onBatchAddToCart(itemsToAdd);
      } else if (onAddToCart) {
        itemsToAdd.forEach((entry) => {
          for (let i = 0; i < entry.quantity; i++) {
            onAddToCart(entry.item);
          }
        });
      }
    }

    if (handledRemoveIds.size > 0 || handledDeleteIds.size > 0) {
      playCartRemoveSound();
    }

    // Strip [cart:...] tags from rendered text
    cleanedText = cleanedText.replace(cartRegex, "").trim();

    return { cleanedText, executedActions };
  };

  // Helper to execute button action
  const handleExecuteButton = (btn: ParsedButton, buttonKey: string) => {
    setClickedButtons((prev) => ({ ...prev, [buttonKey]: true }));

    switch (btn.type) {
      case "order": {
        // Parse items specification: "choco_chip:2, pistacho:1" or JSON
        const itemsToAdd: { item: MenuItem; quantity: number }[] = [];
        const spec = btn.param1;

        if (spec.startsWith("[") && spec.endsWith("]")) {
          // JSON array
          try {
            const parsed = JSON.parse(spec);
            if (Array.isArray(parsed)) {
              parsed.forEach((entry: any) => {
                const itemRef = entry.id || entry.item || entry.name || "";
                const qty = parseInt(entry.quantity || entry.qty || 1, 10);
                const found = findMenuItem(itemRef);
                if (found) {
                  itemsToAdd.push({ item: found, quantity: Math.max(1, qty) });
                }
              });
            }
          } catch (e) {
            console.error("Error parsing order JSON:", e);
          }
        } else {
          // Comma-separated: "id_o_nombre:qty, id_o_nombre:qty"
          const tokens = spec.split(/[,;\n]+/);
          tokens.forEach((token) => {
            const parts = token.split(":");
            const identifier = parts[0]?.trim();
            const qty = parts[1] ? parseInt(parts[1].trim(), 10) : 1;
            if (identifier) {
              const found = findMenuItem(identifier);
              if (found) {
                itemsToAdd.push({ item: found, quantity: isNaN(qty) || qty <= 0 ? 1 : qty });
              }
            }
          });
        }

        if (itemsToAdd.length > 0) {
          playCartAddSound();
          if (onBatchAddToCart) {
            onBatchAddToCart(itemsToAdd);
          } else if (onAddToCart) {
            itemsToAdd.forEach((i) => {
              for (let q = 0; q < i.quantity; q++) {
                onAddToCart(i.item);
              }
            });
          }
          if (showToast) {
            showToast(`🛒 ¡${itemsToAdd.length} variedad(es) de galletas colocadas en tu pedido! 🍪✨`);
          }
        } else {
          // Fallback to specialty or first item
          if (menuItems[0] && onAddToCart) {
            playCartAddSound();
            onAddToCart(menuItems[0], 1);
            if (showToast) showToast(`🛒 ¡Galleta añadida a tu pedido! 🍪`);
          }
        }
        break;
      }

      case "add_item": {
        const itemRef = btn.param1;
        const qty = btn.param2 ? parseInt(btn.param2, 10) : 1;
        const found = findMenuItem(itemRef);
        if (found) {
          playCartAddSound();
          if (onAddToCart) {
            for (let q = 0; q < (isNaN(qty) || qty <= 0 ? 1 : qty); q++) {
              onAddToCart(found);
            }
          }
          if (showToast) {
            showToast(`🍪 ¡${found.name} agregada a tu pedido!`);
          }
        }
        break;
      }

      case "remove_item": {
        playCartRemoveSound();
        const itemRef = btn.param1;
        const qty = btn.param2 ? parseInt(btn.param2, 10) : 1;
        const validQty = isNaN(qty) || qty <= 0 ? 1 : qty;
        const cartEntry = cart.find(
          (ci) =>
            ci.item.id.toLowerCase() === itemRef.toLowerCase() ||
            ci.item.name.toLowerCase().includes(itemRef.toLowerCase()) ||
            itemRef.toLowerCase().includes(ci.item.name.toLowerCase())
        );
        if (cartEntry && onUpdateQuantity) {
          onUpdateQuantity(cartEntry.item.id, -validQty);
          if (showToast) {
            showToast(`➖ Se restó ${validQty}x ${cartEntry.item.name} de tu pedido`);
          }
        } else {
          const found = findMenuItem(itemRef);
          if (found && onUpdateQuantity) {
            onUpdateQuantity(found.id, -validQty);
            if (showToast) {
              showToast(`➖ Se restó de tu pedido`);
            }
          }
        }
        break;
      }

      case "delete_item": {
        playCartRemoveSound();
        const itemRef = btn.param1;
        const cartEntry = cart.find(
          (ci) =>
            ci.item.id.toLowerCase() === itemRef.toLowerCase() ||
            ci.item.name.toLowerCase().includes(itemRef.toLowerCase()) ||
            itemRef.toLowerCase().includes(ci.item.name.toLowerCase())
        );
        if (cartEntry && onRemoveItem) {
          onRemoveItem(cartEntry.item.id);
          if (showToast) {
            showToast(`🗑️ ${cartEntry.item.name} eliminada de tu pedido`);
          }
        } else {
          const found = findMenuItem(itemRef);
          if (found && onRemoveItem) {
            onRemoveItem(found.id);
            if (showToast) {
              showToast(`🗑️ Galleta eliminada de tu pedido`);
            }
          }
        }
        break;
      }

      case "action": {
        const action = btn.param1.toLowerCase();
        const param = btn.param2;

        if (action === "open_cart" || action === "checkout" || action === "ver_pedido") {
          if (onOpenCart) onOpenCart();
        } else if (
          action === "open_instagram" ||
          action === "instagram" ||
          action === "enviar_instagram" ||
          action === "send_instagram" ||
          action === "pedir_instagram"
        ) {
          handleSendOrderToInstagram();
        } else if (
          action === "open_whatsapp" ||
          action === "whatsapp" ||
          action === "enviar_whatsapp" ||
          action === "send_whatsapp" ||
          action === "pedir_whatsapp"
        ) {
          handleSendOrderToWhatsApp();
        } else if (action === "view_category" || action === "view_section" || action === "categoria") {
          const catId = param || "entradas";
          if (onNavigateToSection) {
            onNavigateToSection(catId);
            onClose(); // Close modal so user sees the scrolled menu section
          }
        }
        break;
      }

      case "link": {
        let url = btn.param1;
        if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
          url = `https://${url}`;
        }
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes("ig.me") || lowerUrl.includes("instagram.com")) {
          handleSendOrderToInstagram(url);
          return;
        }
        if (
          lowerUrl.includes("wa.me") ||
          lowerUrl.includes("whatsapp.com") ||
          lowerUrl.includes("api.whatsapp.com")
        ) {
          handleSendOrderToWhatsApp(url);
          return;
        }
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
        }
        break;
      }
    }

    // Keep cursor / focus in chat input after button interaction
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 40);
  };

  const handleSendOrderToInstagram = (customUrl?: string) => {
    // 1. Generate organized order summary with established store format and current cart
    const formattedMessage = generateOrderSummaryText(cart, {
      isForInstagram: true,
      storeName: storeSettings.heroTitle || "Lia Cookies",
      storeSubtitle: storeSettings.heroSubtitle || "Dulce Experiencia de Sabores",
    });

    // 2. Automatically copy order to clipboard
    copyToClipboardRobust(formattedMessage);

    // 3. Notify parent/ChipBot that order has been sent
    if (onOrderSent) {
      onOrderSent(formattedMessage, "instagram");
    }

    // 4. Inform user BEFORE/UPON sending that complete order info is already copied
    if (showToast) {
      showToast("📋 ¡Tu pedido completo ya ha sido copiado! Si no se visualiza automáticamente, solo mantén presionado y dale a 'Pegar'.");
    }

    // 5. Add acknowledging bot message in chat so ChipBot registers the event in history
    setMessages((prev) => [
      ...prev,
      {
        id: `bot_sent_ig_${Date.now()}`,
        sender: "bot",
        text: `🚀 **¡He registrado que enviaste tu pedido a Instagram DM!** 📸🍪\n\n📋 **Aviso importante:** Toda la información de tu orden ya fue copiada a tu portapapeles. Si por alguna razón no se visualiza automáticamente en el chat, solo mantén presionado y dale a **Pegar**.\n\n¿Deseas verificar los datos de nuestras cuentas bancarias para la transferencia del comprobante? ✨`,
        timestamp: Date.now(),
      },
    ]);

    // 6. Construct Instagram DM link pre-filled with the order text
    const baseDm =
      customUrl ||
      storeSettings.instagramDmUrl ||
      (contactInfo.instagram ? `https://ig.me/m/${contactInfo.instagram}` : "https://ig.me/m/liacookies70");
    const dmLink = getInstagramDmUrlWithText(baseDm, formattedMessage);

    // 7. Open Instagram DM
    try {
      const linkEl = document.createElement("a");
      linkEl.href = dmLink;
      linkEl.target = "_blank";
      linkEl.rel = "noopener noreferrer";
      document.body.appendChild(linkEl);
      linkEl.click();
      document.body.removeChild(linkEl);
    } catch {
      window.open(dmLink, "_blank");
    }
  };

  const handleSendOrderToWhatsApp = (customUrl?: string) => {
    // 1. Generate organized order summary with established store format and current cart
    const formattedMessage = generateOrderSummaryText(cart, {
      isForInstagram: false,
      storeName: storeSettings.heroTitle || "Lia Cookies",
      storeSubtitle: storeSettings.heroSubtitle || "Dulce Experiencia de Sabores",
    });

    // 2. Automatically copy order to clipboard
    copyToClipboardRobust(formattedMessage);

    // 3. Notify parent/ChipBot that order has been sent
    if (onOrderSent) {
      onOrderSent(formattedMessage, "whatsapp");
    }

    // 4. Inform user BEFORE/UPON sending that complete order info is already copied
    if (showToast) {
      showToast("📋 ¡Tu pedido completo ya ha sido copiado! Si no se visualiza automáticamente, solo mantén presionado y dale a 'Pegar'.");
    }

    // 5. Add acknowledging bot message in chat
    setMessages((prev) => [
      ...prev,
      {
        id: `bot_sent_wa_${Date.now()}`,
        sender: "bot",
        text: `🚀 **¡He registrado que enviaste tu pedido a WhatsApp!** 💬🍪\n\n📋 **Aviso importante:** Toda la información de tu orden ya fue copiada a tu portapapeles. Si por alguna razón no se visualiza automáticamente en el chat, solo mantén presionado y dale a **Pegar**.\n\n¿Deseas verificar los datos de nuestras cuentas bancarias para la transferencia del comprobante? ✨`,
        timestamp: Date.now(),
      },
    ]);

    // 6. Construct WhatsApp link pre-filled with the order text
    const phone = contactInfo.phone ? contactInfo.phone.replace(/[^0-9]/g, "") : "18498140019";
    const waUrl = getWhatsAppUrlWithText(phone, formattedMessage);

    // 7. Open WhatsApp
    try {
      const linkEl = document.createElement("a");
      linkEl.href = waUrl;
      linkEl.target = "_blank";
      linkEl.rel = "noopener noreferrer";
      document.body.appendChild(linkEl);
      linkEl.click();
      document.body.removeChild(linkEl);
    } catch {
      window.open(waUrl, "_blank");
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isLoading) return;

    if (!isEnabled) {
      setMessages((prev) => [
        ...prev,
        {
          id: `usr_${Date.now()}`,
          sender: "user",
          text: textToSend,
          timestamp: Date.now(),
        },
        {
          id: `bot_disabled_${Date.now()}`,
          sender: "bot",
          text: `💤 **${botName}** está desactivado en este momento. Por favor activa el agente desde el panel de administración o contáctanos por Instagram o WhatsApp para atenderte personalmente.`,
          timestamp: Date.now() + 100,
        },
      ]);
      setInputValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 15);
      return;
    }

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: Date.now(),
    };

    playUserSendSound();
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 15);
    setIsLoading(true);

    try {
      // Build dynamic system prompt with full store info, live cart and sent order knowledge
      const systemInstruction = buildFullAiPrompt(
        aiConfig,
        menuItems,
        categories,
        storeSettings,
        bankAccounts,
        contactInfo,
        cart,
        lastSentOrder
      );

      // Construct messages payload
      const historyPayload = [
        { role: "system", content: systemInstruction },
        ...messages
          .filter((m) => !m.isError)
          .slice(-8)
          .map((m) => ({
            role: m.sender === "bot" ? "assistant" : "user",
            content: m.text,
          })),
        { role: "user", content: textToSend },
      ];

      // Call backend AI chat endpoint
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: aiConfig.provider || "openrouter",
          messages: historyPayload,
          config: {
            openRouterApiKey: aiConfig.openRouterApiKey,
            openRouterModel: aiConfig.openRouterModel || "openrouter/free",
            openAiApiKey: aiConfig.openAiApiKey,
            openAiModel: aiConfig.openAiModel || "gpt-4o-mini",
            geminiApiKey: aiConfig.geminiApiKey,
            geminiModel: aiConfig.geminiModel || "gemini-2.5-flash",
            ollamaBaseUrl: aiConfig.ollamaBaseUrl || "https://ollama.com/v1",
            ollamaApiKey: aiConfig.ollamaApiKey,
            ollamaModel: aiConfig.ollamaModel || "gemma4:31b-cloud",
          },
        }),
      });

      if (!res.ok) {
        let errData;
        try {
          errData = await res.json();
        } catch (_) {}
        const errorMsg =
          errData?.error ||
          `Error al conectar con ${aiConfig.provider?.toUpperCase()} (${res.status}).`;

        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: "bot",
            text: `⚠️ **Aviso de Conexión:** ${errorMsg}\n\n*Consejo:* Si eres el administrador, verifica la API Key y el modelo en el botón **🤖 Agente IA** de la barra de administración.`,
            timestamp: Date.now(),
            isError: true,
          },
        ]);
        return;
      }

      const data = await res.json();
      const botReply =
        data.reply?.trim() ||
        "¡Qué delicia! Me encanta esa elección de galletas. Ya he actualizado tu carrito. ¿Deseas algo más?";

      // Execute automatic cart actions embedded in response or user intent
      const { cleanedText, executedActions } = processCartActions(botReply, textToSend);

      if (executedActions.length > 0 && showToast) {
        showToast(`🛒 ChipBot actualizó tu carrito: ${executedActions.join(", ")} ✨`);
      }

      playAiReplySound();
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: "bot",
          text: cleanedText,
          timestamp: Date.now(),
          cartUpdates: executedActions.length > 0 ? executedActions : undefined,
        },
      ]);
    } catch (err: any) {
      console.error("AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "bot",
          text: `⚠️ No pude comunicarme con el servidor de inteligencia artificial. Revisa tu conexión a internet o la configuración del proveedor en el panel de control.`,
          timestamp: Date.now(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 35);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome_reset",
        sender: "bot",
        text: `Conversación reiniciada 🍪✨ ¿Qué delicias se te antojan hoy? Dime qué deseas pedir o consultar y con gusto gestiono tu carrito al instante.\n\n[button:action|🛍️ Ver Mi Pedido Actual|open_cart]`,
        timestamp: Date.now(),
      },
    ]);
    setClickedButtons({});
  };

  if (!isOpen) return null;

  const quickQuestions = [
    "🍪 ¿Cuáles son las galletas más populares?",
    "📦 Quiero pedir un Six Pack surtido",
    "💰 Precios de todas las cookies",
    "💳 ¿A qué cuentas bancarias puedo transferir?",
    "🛵 ¿Cómo realizo mi pedido?",
  ];

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex items-end justify-center sm:block select-none font-sans animate-fadeIn">
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm sm:hidden"
        onClick={onClose}
      />

      {/* Main Chat Container */}
      <div
        className="relative w-full sm:w-[440px] h-[88vh] sm:h-[620px] max-h-[90vh] bg-[#1a0524] border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        style={{
          boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 40px ${primaryColor}30`,
        }}
      >
        {/* Chat Header */}
        <div
          className="p-4 border-b border-white/10 flex items-center justify-between relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}40 0%, #16041f 100%)`,
          }}
        >
          {/* Subtle top light bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="flex items-center gap-3">
            {/* Bot Mini Avatar 2.5D */}
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ffd89b] to-[#b86926] p-0.5 shadow-md flex items-center justify-center border border-amber-200/40">
              <span className="text-xl leading-none">🍪</span>
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#16041f] flex items-center justify-center ${
                  isEnabled ? "bg-emerald-500" : "bg-gray-500"
                }`}
              >
                {isEnabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                )}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-sm tracking-wide text-white">
                  {botName}
                </h3>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    isEnabled
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                  }`}
                >
                  {isEnabled ? "Activo" : "Desactivado"}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-light">
                {isEnabled
                  ? `Asesor con Botones Interactivos • ${storeSettings.heroTitle || "Lia Cookies"}`
                  : "Agente en reposo"}
              </p>
            </div>
          </div>

          {/* Action buttons & customer font size adjustment */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Font size control for conversation (default: 13, max: 17) */}
            <div
              className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 shadow-inner"
              title="Ajustar tamaño de texto de la conversación (máximo 17)"
            >
              <button
                type="button"
                onClick={handleDecreaseFontSize}
                disabled={chatFontSize <= 11}
                title="Disminuir texto (A-)"
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                A-
              </button>
              <span
                className="text-[10px] font-mono font-bold text-pink-300 px-1 min-w-[24px] text-center select-none"
                title={`Tamaño actual: ${chatFontSize}px (máximo 17)`}
              >
                {chatFontSize}
              </span>
              <button
                type="button"
                onClick={handleIncreaseFontSize}
                disabled={chatFontSize >= 17}
                title="Aumentar texto hasta máx. 17 (A+)"
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                A+
              </button>
            </div>

            <button
              onClick={handleClearHistory}
              title="Reiniciar chat"
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Cerrar chat"
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Disabled Banner Warning (if agent is toggled off) */}
        {!isEnabled && (
          <div className="bg-amber-950/70 border-b border-amber-500/30 px-3 py-2 flex items-center gap-2 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <p className="text-[11px] leading-tight">
              <strong>Agente Desactivado:</strong> El agente no contestará
              preguntas automáticas hasta que sea activado en el panel admin.
            </p>
          </div>
        )}

        {/* Chat Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const { cleanText, buttons: rawButtons } = isUser
              ? { cleanText: msg.text, buttons: [] }
              : parseMessageButtons(msg.text);

            // Filter out redundant "order" buttons (agregar todo el pedido)
            // ChipBot adds items directly to the cart, so the whole-order addition button must NOT appear to avoid duplicating orders
            const buttons = rawButtons.filter((btn) => btn.type !== "order");

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isUser ? "items-end" : "items-start"
                } animate-fadeIn`}
              >
                <div
                  style={{ fontSize: `${chatFontSize}px`, lineHeight: 1.55 }}
                  className={`max-w-[92%] sm:max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed shadow-md select-text ${
                    isUser
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-br-none"
                      : msg.isError
                      ? "bg-red-950/80 border border-red-500/40 text-red-200 rounded-bl-none"
                      : "bg-white/10 border border-white/15 text-gray-100 rounded-bl-none backdrop-blur-md"
                  }`}
                >
                  {/* Automatic Cart Changes Indicator Badge */}
                  {msg.cartUpdates && msg.cartUpdates.length > 0 && (
                    <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 shadow-sm">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-white">Carrito actualizado:</span>
                      <span className="text-emerald-300 font-mono text-[11px]">{msg.cartUpdates.join(", ")}</span>
                    </div>
                  )}

                  {/* Text content formatted */}
                  {cleanText && (
                    <div
                      className="space-y-2 whitespace-pre-wrap break-words"
                      style={{ fontSize: `${chatFontSize}px` }}
                    >
                      {cleanText.split("\n\n").map((paragraph, idx) => (
                        <p key={idx}>
                          {paragraph.split("**").map((chunk, cIdx) =>
                            cIdx % 2 === 1 ? (
                              <strong key={cIdx} className="font-bold text-white">
                                {chunk}
                              </strong>
                            ) : (
                              chunk
                            )
                          )}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* High-Impact Interactive Buttons Tray */}
                  {buttons.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/15 space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-pink-300 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-pink-400 animate-pulse" />
                        <span>Acciones Rápidas Disponibles:</span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {buttons.map((btn, bIdx) => {
                          const buttonKey = `${msg.id}_btn_${bIdx}`;
                          const isClicked = Boolean(clickedButtons[buttonKey]);

                          // 1. ORDER BUTTON (Poner el pedido en el menú de la plataforma)
                          if (btn.type === "order") {
                            return (
                              <div
                                key={bIdx}
                                className="group relative rounded-2xl p-[1.5px] bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 shadow-lg shadow-pink-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleExecuteButton(btn, buttonKey)}
                                  className={`w-full relative px-3.5 py-2.5 rounded-[15px] flex items-center justify-between gap-3 text-left transition-all cursor-pointer overflow-hidden ${
                                    isClicked
                                      ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white"
                                      : "bg-gradient-to-r from-[#2B0024] to-[#12001A] hover:bg-opacity-80 text-white"
                                  }`}
                                >
                                  {/* Shimmer light effect animation across button */}
                                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none transition-transform" />

                                  <div className="flex items-center gap-2.5 z-10 min-w-0">
                                    <div
                                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                                        isClicked
                                          ? "bg-white text-emerald-600 font-bold"
                                          : "bg-gradient-to-br from-amber-400 to-pink-600 text-white"
                                      }`}
                                    >
                                      {isClicked ? (
                                        <Check className="w-4 h-4 animate-bounce" />
                                      ) : (
                                        <ShoppingBag className="w-4 h-4 animate-pulse" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-black text-xs text-white leading-tight drop-shadow-sm flex items-center gap-1.5 truncate">
                                        <span>
                                          {isClicked
                                            ? "¡Colocado en Tu Pedido! 🎉"
                                            : btn.label}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-pink-200/80 font-medium">
                                        {isClicked
                                          ? "Toca 'Ver Mi Pedido' para revisar"
                                          : "Presiona para agregarlo al menú/carrito"}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 z-10 shrink-0">
                                    {isClicked ? (
                                      <span
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (onOpenCart) onOpenCart();
                                        }}
                                        className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer transition-colors"
                                      >
                                        <span>Ver Carrito</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </span>
                                    ) : (
                                      <span className="w-7 h-7 rounded-xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                                        <Plus className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                  </div>
                                </button>
                              </div>
                            );
                          }

                          // 2. ADD SINGLE ITEM BUTTON
                          if (btn.type === "add_item") {
                            return (
                              <button
                                key={bIdx}
                                type="button"
                                onClick={() => handleExecuteButton(btn, buttonKey)}
                                className={`w-full group px-3.5 py-2 rounded-xl border flex items-center justify-between gap-2.5 transition-all duration-200 cursor-pointer text-left shadow-md hover:scale-[1.01] active:scale-95 ${
                                  isClicked
                                    ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
                                    : "bg-gradient-to-r from-pink-900/40 to-purple-900/40 border-pink-500/30 hover:border-pink-400 text-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0">
                                    {isClicked ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Cookie className="w-3.5 h-3.5 text-pink-300" />
                                    )}
                                  </div>
                                  <span className="font-bold text-xs truncate">
                                    {isClicked ? `¡Añadida! ✅` : btn.label}
                                  </span>
                                </div>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-pink-200 shrink-0 font-medium">
                                  {isClicked ? "Agregada" : "+ Añadir"}
                                </span>
                              </button>
                            );
                          }

                          // 2b. REMOVE ITEM QUANTITY BUTTON
                          if (btn.type === "remove_item") {
                            return (
                              <button
                                key={bIdx}
                                type="button"
                                onClick={() => handleExecuteButton(btn, buttonKey)}
                                className={`w-full group px-3.5 py-2 rounded-xl border flex items-center justify-between gap-2.5 transition-all duration-200 cursor-pointer text-left shadow-md hover:scale-[1.01] active:scale-95 ${
                                  isClicked
                                    ? "bg-amber-950/80 border-amber-500/50 text-amber-200"
                                    : "bg-gradient-to-r from-amber-900/40 to-orange-950/40 border-amber-500/30 hover:border-amber-400 text-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                                    {isClicked ? (
                                      <Check className="w-3.5 h-3.5 text-amber-400" />
                                    ) : (
                                      <Minus className="w-3.5 h-3.5 text-amber-300" />
                                    )}
                                  </div>
                                  <span className="font-bold text-xs truncate">
                                    {isClicked ? `¡Restada! ➖` : btn.label}
                                  </span>
                                </div>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-amber-200 shrink-0 font-medium">
                                  {isClicked ? "Modificado" : "- Quitar"}
                                </span>
                              </button>
                            );
                          }

                          // 2c. DELETE ITEM COMPLETELY BUTTON
                          if (btn.type === "delete_item") {
                            return (
                              <button
                                key={bIdx}
                                type="button"
                                onClick={() => handleExecuteButton(btn, buttonKey)}
                                className={`w-full group px-3.5 py-2 rounded-xl border flex items-center justify-between gap-2.5 transition-all duration-200 cursor-pointer text-left shadow-md hover:scale-[1.01] active:scale-95 ${
                                  isClicked
                                    ? "bg-red-950/80 border-red-500/50 text-red-200"
                                    : "bg-gradient-to-r from-red-900/40 to-rose-950/40 border-red-500/30 hover:border-red-400 text-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="w-6 h-6 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                                    {isClicked ? (
                                      <Check className="w-3.5 h-3.5 text-red-400" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5 text-red-300" />
                                    )}
                                  </div>
                                  <span className="font-bold text-xs truncate">
                                    {isClicked ? `¡Eliminada! 🗑️` : btn.label}
                                  </span>
                                </div>
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-red-200 shrink-0 font-medium">
                                  {isClicked ? "Eliminado" : "Eliminar"}
                                </span>
                              </button>
                            );
                          }

                          // 3. INTERNAL PLATFORM ACTION BUTTON
                          if (btn.type === "action") {
                            return (
                              <button
                                key={bIdx}
                                type="button"
                                onClick={() => handleExecuteButton(btn, buttonKey)}
                                className="w-full group px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-900/50 via-indigo-900/40 to-black/50 border border-purple-500/30 hover:border-pink-400 hover:from-purple-800/60 text-white flex items-center justify-between gap-2.5 transition-all duration-200 cursor-pointer text-left shadow-md hover:scale-[1.01] active:scale-95"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                                    {btn.param1.includes("cart") ? (
                                      <ShoppingCart className="w-3.5 h-3.5 text-purple-300" />
                                    ) : btn.param1.includes("instagram") ? (
                                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                                    ) : btn.param1.includes("whatsapp") ? (
                                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Compass className="w-3.5 h-3.5 text-cyan-300" />
                                    )}
                                  </div>
                                  <span className="font-bold text-xs truncate">
                                    {btn.label}
                                  </span>
                                </div>
                                <span className="text-[10px] text-purple-200 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                                  <span>Abrir</span>
                                  <ArrowRight className="w-3 h-3" />
                                </span>
                              </button>
                            );
                          }

                          // 4. CLICKABLE EXTERNAL / CONFIGURED LINK BUTTON
                          return (
                            <button
                              key={bIdx}
                              type="button"
                              onClick={() => handleExecuteButton(btn, buttonKey)}
                              className="w-full group px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-blue-500/30 hover:border-cyan-400 hover:from-blue-800/50 text-white flex items-center justify-between gap-2.5 transition-all duration-200 cursor-pointer text-left shadow-md hover:scale-[1.01] active:scale-95"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                                  <ExternalLink className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="font-bold text-xs truncate">
                                  {btn.label}
                                </span>
                              </div>
                              <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-cyan-200 shrink-0">
                                Enlace ↗
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[9px] mt-1.5 text-right ${
                      isUser ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 border border-white/5 w-fit px-3 py-2 rounded-2xl rounded-bl-none animate-pulse">
              <span className="text-sm">🍪</span>
              <span className="text-[11px] font-medium text-pink-300">
                {botName} está horneando tu respuesta y preparando botones...
              </span>
              <div className="flex gap-1 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {isEnabled && messages.length <= 4 && (
          <div className="px-3 py-1.5 overflow-x-auto flex gap-1.5 no-scrollbar border-t border-white/5 bg-black/30">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-full px-2.5 py-1 text-[10px] text-gray-300 hover:text-white transition-all cursor-pointer shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 bg-black/60 border-t border-white/10 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={!isEnabled || isLoading}
              placeholder={
                isEnabled
                  ? `Pídele galletas o pregúntale a ${botName}...`
                  : "Agente IA desactivado temporalmente"
              }
              style={{
                fontSize: `${chatFontSize}px`,
                minHeight: "38px",
                maxHeight: "130px",
              }}
              className="flex-1 bg-white/10 border border-white/15 rounded-2xl px-3.5 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none overflow-y-auto leading-relaxed"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading || !isEnabled}
              className="p-2.5 h-[38px] w-[38px] flex items-center justify-center shrink-0 rounded-2xl text-white transition-all transform active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md mb-0.5"
              style={{
                backgroundColor: primaryColor,
              }}
              title="Enviar mensaje (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Footer Links */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5 px-1">
            {onOpenCart && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="text-pink-300 hover:text-pink-200 flex items-center gap-1 cursor-pointer font-bold"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>Ver Mi Pedido / Carrito</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {storeSettings.instagramMode !== false ? (
                <a
                  href={
                    storeSettings.instagramDmUrl ||
                    "https://ig.me/m/liacookies70"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-pink-400 flex items-center gap-0.5 transition-colors"
                >
                  <Instagram className="w-3 h-3" />
                  <span>Instagram</span>
                </a>
              ) : (
                <a
                  href={`https://wa.me/${contactInfo.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-0.5 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
