/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORIES, MENU_ITEMS } from "./data";
import { MenuItem, MenuCategory, CartItem } from "./types";
import Logo from "./components/Logo";
import MenuItemCard from "./components/MenuItemCard";
import BankDetails, { BankAccountItem } from "./components/BankDetails";
import CartDrawer from "./components/CartDrawer";
import ImageDropUpload from "./components/ImageDropUpload";
import { safeSetLocalStorage } from "./utils/imageOptimizer";
import {
  Instagram,
  Phone,
  ShoppingBag,
  Search,
  ChevronDown,
  Sparkles,
  UtensilsCrossed,
  Clock,
  MapPin,
  MessageCircle,
  TrendingUp,
  X,
  Compass,
  Shield,
  Lock,
  Unlock,
  LogOut,
  Save,
  KeyRound,
  PlusCircle,
  Edit,
  Check,
  Trash2,
  Palette,
  Image as ImageIcon,
  Type,
  RotateCcw,
  Sliders,
  AlertCircle,
  Layers,
  Sparkle,
  Paintbrush,
  Globe
} from "lucide-react";

const COLOR_PRESETS = [
  {
    name: "Fuego Fucsia (Original)",
    primaryColor: "#E8005A",
    primaryDarkColor: "#C20042",
    accentColor: "#FFB800",
    backgroundColor: "#0A0A0B",
    cardColor: "#141416"
  },
  {
    name: "Oro Negro (Elegante)",
    primaryColor: "#D4AF37",
    primaryDarkColor: "#AA820A",
    accentColor: "#F59E0B",
    backgroundColor: "#0D0D0E",
    cardColor: "#161619"
  },
  {
    name: "Brasa Roja (Barbacoa)",
    primaryColor: "#EF4444",
    primaryDarkColor: "#DC2626",
    accentColor: "#F97316",
    backgroundColor: "#0F0A0A",
    cardColor: "#1C1414"
  },
  {
    name: "Bosque Ahumado (Hierbas)",
    primaryColor: "#84CC16",
    primaryDarkColor: "#65A30D",
    accentColor: "#EAB308",
    backgroundColor: "#090B06",
    cardColor: "#161A0F"
  },
  {
    name: "Carbón Eléctrico (Cian)",
    primaryColor: "#06B6D4",
    primaryDarkColor: "#0891B2",
    accentColor: "#3B82F6",
    backgroundColor: "#050B14",
    cardColor: "#0E1726"
  },
  {
    name: "Atardecer Criollo (Naranja)",
    primaryColor: "#F97316",
    primaryDarkColor: "#EA580C",
    accentColor: "#EAB308",
    backgroundColor: "#0F0B08",
    cardColor: "#1A130E"
  }
];

const GRADIENT_PRESETS = [
  {
    id: "fucsia_noir",
    name: "Fuego Fucsia & Carbón",
    color1: "#2B0017",
    color2: "#0A0A0B",
    direction: "to bottom",
    preview: "linear-gradient(to bottom, #2B0017, #0A0A0B)"
  },
  {
    id: "crimson_ember",
    name: "Brasa Carmesí & Humo",
    color1: "#300808",
    color2: "#0D0707",
    direction: "to bottom",
    preview: "linear-gradient(to bottom, #300808, #0D0707)"
  },
  {
    id: "golden_smoke",
    name: "Oro Tostado & Noche",
    color1: "#2B1D04",
    color2: "#0C0A06",
    direction: "to bottom",
    preview: "linear-gradient(to bottom, #2B1D04, #0C0A06)"
  },
  {
    id: "cyber_cyan",
    name: "Carbón Eléctrico & Medianoche",
    color1: "#04202C",
    color2: "#050C14",
    direction: "to bottom",
    preview: "linear-gradient(to bottom, #04202C, #050C14)"
  },
  {
    id: "emerald_deep",
    name: "Hierbas & Bosque Criollo",
    color1: "#122406",
    color2: "#080D04",
    direction: "to bottom",
    preview: "linear-gradient(to bottom, #122406, #080D04)"
  },
  {
    id: "purple_wine",
    name: "Ciruela Ahumada & Noche",
    color1: "#220526",
    color2: "#09050A",
    direction: "to bottom",
    preview: "linear-gradient(to bottom, #220526, #09050A)"
  }
];

function getGradientCss(settings: any): string {
  const c1 = settings.backgroundGradientColor1 || "#2B0017";
  const c2 = settings.backgroundGradientColor2 || "#0A0A0B";
  const dir = settings.backgroundGradientDirection || "to bottom";
  if (dir === "radial") {
    return `radial-gradient(circle at 50% 30%, ${c1} 0%, ${c2} 100%)`;
  }
  return `linear-gradient(${dir}, ${c1} 0%, ${c2} 100%)`;
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("entradas");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Admin Mode States & Helpers ---
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [isAdminLogged, setIsAdminLogged] = useState(() => {
    return localStorage.getItem("montepork_admin_logged") === "true";
  });
  const [isAdminPreviewMode, setIsAdminPreviewMode] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Modals
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [currentPassInput, setCurrentPassInput] = useState("");
  const [newPassInput, setNewPassInput] = useState("");
  const [confirmPassInput, setConfirmPassInput] = useState("");

  // Check if password remains the default "1234"
  const [isPassDefault, setIsPassDefault] = useState(false);

  // Editable configurations state (initialized from localStorage or file defaults)
  const [categories, setCategories] = useState<MenuCategory[]>(() => {
    const saved = localStorage.getItem("montepork_categories");
    return saved ? JSON.parse(saved) : CATEGORIES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem("montepork_menu_items");
    return saved ? JSON.parse(saved) : MENU_ITEMS;
  });

  const [bankAccounts, setBankAccounts] = useState(() => {
    const saved = localStorage.getItem("montepork_bank_accounts");
    const defaultAccounts = [
      {
        id: "rnc",
        bank: "RP2, SRL",
        type: "RNC (Registro Nacional de Contribuyentes)",
        number: "133410389",
        accent: "border-primary/20 bg-primary/5",
        logoType: "rnc"
      },
      {
        id: "bhd",
        bank: "Banco BHD",
        type: "Cuenta de Ahorros",
        number: "39729570017",
        accent: "border-emerald-500/20 bg-emerald-500/5",
        logoType: "bhd"
      },
      {
        id: "banreservas",
        bank: "Banreservas",
        type: "Cuenta de Ahorros",
        number: "9609051377",
        accent: "border-sky-500/20 bg-sky-500/5",
        logoType: "banreservas"
      }
    ];
    return saved ? JSON.parse(saved) : defaultAccounts;
  });

  const [rncHeader, setRncHeader] = useState(() => {
    return localStorage.getItem("montepork_rnc_header") || "RNC: 133-41038-9";
  });

  const [contactInfo, setContactInfo] = useState(() => {
    const saved = localStorage.getItem("montepork_contact_info");
    return saved ? JSON.parse(saved) : { phone: "18498140019", instagram: "monteporkrd" };
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [storeSettings, setStoreSettings] = useState(() => {
    const saved = localStorage.getItem("montepork_store_settings");
    const defaultSettings = {
      heroTitle: "MONTE PORK",
      heroSubtitle: "El Más Crujiente de la Región",
      heroDescription: "Chicharrón de verdad, macerado por 24 horas y explotado al momento. Mofongos, combos del coro y las cervezas más frías de la comarca.",
      heroButton1Text: "Ver Menú",
      heroButton2Text: "Escríbenos",
      titleDisplayType: "text" as "text" | "image",
      titleImageUrl: "",
      titleImageWidth: 320,
      specialtyBadge: "La Gloria en Pilón",
      specialtyTitle: "Nuestra Especialidad:",
      specialtyTitleHighlight: "Mofongo MP",
      specialtyDescription: "Majo de plátano verde o maduro y yuca con abundante ajo confitado tradicional, frito con tropezones de chicharrón crujientito. Coronado con su capa de queso fundido burbujeante y servido con porción de tocino, longaniza artesanal o más chicharrón.",
      specialtyPriceLabel: "Precio",
      specialtyPriceValue: "RD$ 400",
      specialtyFlavorLabel: "Sabor",
      specialtyFlavorValue: "100% Criollo 🇩🇴",
      specialtyButtonText: "Agregar al plato",
      specialtyImage: "",
      specialtyPhotoBadge: "Foto real de cocina",
      specialtyPhotoCaption: "El Mofongo MP recién salido del pilón",
      paymentBadge: "Soporte de pagos",
      paymentTitle: "Información de Transferencia",
      paymentDescription: "Pide en línea y transfiere de manera fácil. Copia los datos con un solo toque y envía tu captura por WhatsApp.",
      footerDescription: "Sazón monteplatense tradicional con crujido urbano. Sigue nuestro chicharrón en nuestras redes. ¡Buen provecho!",
      footerCopyright: "© 2026 MONTE PORK. Todos los derechos reservados.",
      footerDisclaimer: "IMPUESTOS NO INCLUIDOS",
      activeStatusLabel: "Activos en el horno 🇩🇴",
      primaryColor: "#E8005A",
      primaryDarkColor: "#C20042",
      accentColor: "#FFB800",
      backgroundColor: "#0A0A0B",
      cardColor: "#141416",
      logoType: "snout",
      logoValue: "",
      tabTitle: "MONTE PORK | El Más Crujiente de la Región",
      menuTagline: "El Más Crujiente",
      backgroundType: "image" as "image" | "solid" | "gradient",
      backgroundImageUrl: "",
      backgroundSolidColor: "#0A0A0B",
      backgroundGradientPreset: "fucsia_noir",
      backgroundGradientColor1: "#2B0017",
      backgroundGradientColor2: "#0A0A0B",
      backgroundGradientDirection: "to bottom",
    };
    
    // Ensure all default keys exist in parsed settings
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const handleUpdateSetting = (key: string, value: any) => {
    setHasUnsavedChanges(true);
    setStoreSettings((prev: any) => {
      const next = { ...prev, [key]: value };
      safeSetLocalStorage("montepork_store_settings", JSON.stringify(next));
      return next;
    });
  };

  const handleUpdateSettings = (updates: Record<string, any>) => {
    setHasUnsavedChanges(true);
    setStoreSettings((prev: any) => {
      const next = { ...prev, ...updates };
      safeSetLocalStorage("montepork_store_settings", JSON.stringify(next));
      return next;
    });
  };

  const handleUpdateContactInfo = (key: "phone" | "instagram", value: string) => {
    setHasUnsavedChanges(true);
    setContactInfo((prev: any) => {
      const next = { ...prev, [key]: value };
      safeSetLocalStorage("montepork_contact_info", JSON.stringify(next));
      return next;
    });
  };

  const handleUpdateRncHeader = (value: string) => {
    setHasUnsavedChanges(true);
    setRncHeader(value);
    safeSetLocalStorage("montepork_rnc_header", value);
  };

  // Synchronize CSS custom properties dynamically with storeSettings
  useEffect(() => {
    if (storeSettings.primaryColor) {
      document.documentElement.style.setProperty("--primary-color", storeSettings.primaryColor);
    }
    if (storeSettings.primaryDarkColor) {
      document.documentElement.style.setProperty("--primary-dark-color", storeSettings.primaryDarkColor);
    }
    if (storeSettings.backgroundColor) {
      document.documentElement.style.setProperty("--bg-color", storeSettings.backgroundColor);
    }
    if (storeSettings.cardColor) {
      document.documentElement.style.setProperty("--card-color", storeSettings.cardColor);
    }
    if (storeSettings.accentColor) {
      document.documentElement.style.setProperty("--accent-color", storeSettings.accentColor);
    }
  }, [
    storeSettings.primaryColor,
    storeSettings.primaryDarkColor,
    storeSettings.backgroundColor,
    storeSettings.cardColor,
    storeSettings.accentColor,
  ]);

  // Synchronize browser tab title dynamically with storeSettings
  useEffect(() => {
    if (storeSettings.tabTitle !== undefined && storeSettings.tabTitle.trim() !== "") {
      document.title = storeSettings.tabTitle;
    } else if (storeSettings.heroTitle) {
      document.title = `${storeSettings.heroTitle} | ${storeSettings.heroSubtitle || "El Más Crujiente de la Región"}`;
    } else {
      document.title = "MONTE PORK | El Más Crujiente de la Región";
    }
  }, [storeSettings.tabTitle, storeSettings.heroTitle, storeSettings.heroSubtitle]);

  // Server-saved SHA-256 password hash (default is "1234")
  const [adminPasswordHash, setAdminPasswordHash] = useState(() => {
    return localStorage.getItem("montepork_admin_pwd_hash") || "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
  });

  // Load configuration from local server disk
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data = await res.json();
          if (data.found) {
            if (data.categories) setCategories(data.categories);
            if (data.menuItems) setMenuItems(data.menuItems);
            if (data.bankAccounts) setBankAccounts(data.bankAccounts);
            if (data.rncHeader) setRncHeader(data.rncHeader);
            if (data.contactInfo) setContactInfo(data.contactInfo);
            if (data.storeSettings) setStoreSettings(data.storeSettings);
            if (data.adminPasswordHash) {
              setAdminPasswordHash(data.adminPasswordHash);
              safeSetLocalStorage("montepork_admin_pwd_hash", data.adminPasswordHash);
            }
          }
        }
      } catch (err) {
        console.error("Error loading config from server disk:", err);
      }
    };
    loadConfig();
  }, []);

  // Sync password default state reactively which works with both disk-backed or memoized state
  useEffect(() => {
    const defaultHash = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; // 1234
    setIsPassDefault(adminPasswordHash === defaultHash);
  }, [adminPasswordHash]);

  // Native cryptographical SHA-256 function
  const hashPassword = async (password: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  useEffect(() => {
    const checkPath = () => {
      const isPath = window.location.pathname.endsWith("/admin") || window.location.hash === "#admin" || window.location.search === "?admin";
      setIsAdminPath(isPath);
    };

    checkPath();
    window.addEventListener("hashchange", checkPath);

    return () => {
      window.removeEventListener("hashchange", checkPath);
    };
  }, []);

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminPasswordInput) {
      setLoginError("Por favor ingresa la contraseña.");
      return;
    }
    const defaultHash = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; // 1234
    const currentHash = adminPasswordHash;
    const computed = await hashPassword(adminPasswordInput);

    if (computed === currentHash) {
      localStorage.setItem("montepork_admin_logged", "true");
      setIsAdminLogged(true);
      setAdminPasswordInput("");
      setLoginError("");
      
      // Check if logged password is '1234'
      if (computed === defaultHash) {
        setIsPassDefault(true);
      } else {
        setIsPassDefault(false);
      }
      showToast("🔓 ¡Sesión administrativa iniciada! 🔥");
    } else {
      setLoginError("Contraseña incorrecta. Inténtalo de nuevo.");
      setAdminPasswordInput("");
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("montepork_admin_logged");
    setIsAdminLogged(false);
    setIsAdminPreviewMode(false);
    showToast("🚪 Sesión administrativa cerrada.");
  };

  const handleExitAdminPath = () => {
    setIsAdminPath(false);
    window.history.pushState({}, "", "/");
  };

  // State modification callbacks
  const handleUpdateItem = (itemId: string, updated: Partial<MenuItem>) => {
    setHasUnsavedChanges(true);
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updated } : item))
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setHasUnsavedChanges(true);
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
    showToast("Plato eliminado. ¡Recuerda guardar los cambios! 🗑️");
  };

  const handleAddItem = (catId: string) => {
    setHasUnsavedChanges(true);
    const defaultNewItem: MenuItem = {
      id: `custom_${Date.now()}`,
      name: "Nuevo Plato Crujiente",
      description: "Descripción tradicional.",
      price: 300,
      unit: "SERV",
      subCategory: catId,
    };
    setMenuItems((prev) => [...prev, defaultNewItem]);
    showToast("¡Has añadido un plato a la sección! Sube una foto o edita su información.");
  };

  const handleUpdateCategory = (catId: string, updated: Partial<MenuCategory>) => {
    setHasUnsavedChanges(true);
    setCategories((prev) =>
      prev.map((cat) => (cat.id === catId ? { ...cat, ...updated } : cat))
    );
  };

  const handleAddCategory = () => {
    setHasUnsavedChanges(true);
    const newCatId = `cat_${Date.now()}`;
    const newCat: MenuCategory = {
      id: newCatId,
      name: "Nueva Sección",
      tagline: "Sazón crujiente opcional"
    };
    setCategories((prev) => [...prev, newCat]);
    showToast("¡Nueva sección creada! Edítala a continuación y añade platos.");
  };

  const handleDeleteCategory = (catId: string) => {
    if (confirm("¿Estás seguro de eliminar esta sección entera y todos sus platos asociados?")) {
      setHasUnsavedChanges(true);
      setCategories((prev) => prev.filter((cat) => cat.id !== catId));
      setMenuItems((prev) => prev.filter((item) => item.subCategory !== catId));
      showToast("Sección y platos limpiados. ¡No olvides guardar!");
    }
  };

  const handleUpdateAccount = (accountId: string, updated: Partial<BankAccountItem>) => {
    setHasUnsavedChanges(true);
    setBankAccounts((prev: BankAccountItem[]) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, ...updated } : acc))
    );
  };

  const handleAddAccount = () => {
    setHasUnsavedChanges(true);
    const newAccount: BankAccountItem = {
      id: `acc_${Date.now()}`,
      bank: "Nuevo Banco o Cuenta",
      type: "Cuenta de Ahorros",
      number: "00000000000",
      accent: "border-primary/20 bg-primary/5",
      logoType: "general"
    };
    setBankAccounts((prev: BankAccountItem[]) => [...prev, newAccount]);
    showToast("¡Nuevo método de pago añadido! Edita los datos y guarda los cambios 💳");
  };

  const handleDeleteAccount = (accountId: string) => {
    setHasUnsavedChanges(true);
    setBankAccounts((prev: BankAccountItem[]) => prev.filter((acc) => acc.id !== accountId));
    showToast("Método de pago eliminado. ¡No olvides guardar los cambios! 🗑️");
  };

  const handleSaveAllChanges = async () => {
    // 1. Save to localStorage safely as fallback copy
    safeSetLocalStorage("montepork_categories", JSON.stringify(categories));
    safeSetLocalStorage("montepork_menu_items", JSON.stringify(menuItems));
    safeSetLocalStorage("montepork_bank_accounts", JSON.stringify(bankAccounts));
    safeSetLocalStorage("montepork_rnc_header", rncHeader);
    safeSetLocalStorage("montepork_contact_info", JSON.stringify(contactInfo));
    safeSetLocalStorage("montepork_store_settings", JSON.stringify(storeSettings));
    
    // 2. Submit to server disk file
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categories,
          menuItems,
          bankAccounts,
          rncHeader,
          contactInfo,
          storeSettings,
          adminPasswordHash
        }),
      });
      if (response.ok) {
        setHasUnsavedChanges(false);
        showToast("💾 ¡Todos los cambios han sido guardados con éxito en el servidor! 🔥");
      } else {
        // Still marked saved locally
        setHasUnsavedChanges(false);
        showToast("💾 Cambios guardados localmente con éxito.");
      }
    } catch (err) {
      console.warn("Server API sync fallback:", err);
      setHasUnsavedChanges(false);
      showToast("💾 Cambios guardados con éxito.");
    }
  };

  // Asset paths from generated assets
  const chicharronHeroImage = "/images/chicharron_hero_1780744755885.png";
  const mofongoImage = "/images/mofongo_plate_1780744771022.png";

  // Intersection observer refs for highlighting sticky active tabs on scroll
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setSelectedCategory(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    CATEGORIES.forEach((cat) => {
      const el = sectionRefs.current[cat.id];
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleScrollToSection = (id: string) => {
    setSelectedCategory(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 130; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.item.id === item.id);
      if (existing) {
        showToast(`Marcado otro ${item.name} en tu plato! ✨`);
        return prevCart.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      showToast(`¡Agregado ${item.name} al plato! 🍪`);
      return [...prevCart, { item, quantity: 1 }];
    });
  };

  const handleAddSpecialtyToCart = () => {
    // 1. Try to find the item in current state
    const foundItem = menuItems.find((i) => i.id === "mofongo_mp")
      || menuItems.find((i) => i.name.toLowerCase().includes("mofongo"))
      || menuItems.find((i) => i.subCategory === "fuertes");

    // Extract numeric price from storeSettings.specialtyPriceValue (e.g. "RD$ 400" -> 400)
    const priceDigits = (storeSettings.specialtyPriceValue || "").match(/\d+/g);
    const parsedPrice = priceDigits ? parseInt(priceDigits.join(""), 10) : (foundItem ? foundItem.price : 400);

    const specialtyName = storeSettings.specialtyTitleHighlight
      ? (storeSettings.specialtyTitle ? `${storeSettings.specialtyTitle} ${storeSettings.specialtyTitleHighlight}`.replace(/:\s*$/, "").trim() : storeSettings.specialtyTitleHighlight)
      : (foundItem?.name || "Mofongo MP");

    const specialtyDishItem: MenuItem = {
      id: foundItem ? foundItem.id : "mofongo_mp",
      name: foundItem?.name || specialtyName || "Mofongo MP",
      description: storeSettings.specialtyDescription || foundItem?.description || "Mofongo con chicharrón, queso fundido y sazón criollo.",
      price: parsedPrice > 0 ? parsedPrice : 400,
      subCategory: foundItem?.subCategory || "fuertes",
      image: storeSettings.specialtyImage || foundItem?.image || mofongoImage,
      popular: true,
    };

    handleAddToCart(specialtyDishItem);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return { ...ci, quantity: newQty };
          }
          return ci;
        })
        .filter((ci) => ci.quantity > 0);
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
    showToast("¡Vaciaste tu plato! Puedes rearmar tu pedido.");
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setCart((prevCart) =>
      prevCart.map((ci) => (ci.item.id === itemId ? { ...ci, notes } : ci))
    );
  };

  const getCartItemCount = (itemId: string) => {
    const found = cart.find((ci) => ci.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const totalCartCount = cart.reduce((acc, ci) => acc + ci.quantity, 0);
  const cartSubtotal = cart.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);

  // Filter items based on search query
  const filteredItems = (catId: string) => {
    const itemsOfCat = menuItems.filter((item) => item.subCategory === catId);
    if (!searchQuery.trim()) return itemsOfCat;
    return itemsOfCat.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  // Split beverages grouped nicely
  const getBebidasByGroup = (group: string) => {
    return menuItems.filter(
      (item) => item.subCategory === "bebidas" && item.description === group
    ).filter(
      (item) =>
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleChangePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassInput || !newPassInput || !confirmPassInput) {
      showToast("⚠️ Por favor completa todos los campos.");
      return;
    }

    const defaultHash = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; // 1234
    const currentHash = adminPasswordHash;
    const computedCurrent = await hashPassword(currentPassInput);

    if (computedCurrent !== currentHash) {
      showToast("❌ La contraseña actual ingresada es incorrecta.");
      return;
    }

    if (newPassInput === "1234") {
      showToast("⚠️ No puedes usar '1234' como tu nueva contraseña.");
      return;
    }

    if (newPassInput !== confirmPassInput) {
      showToast("❌ Las nuevas contraseñas no coinciden.");
      return;
    }

    if (newPassInput.length < 4) {
      showToast("⚠️ La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }

    // Set new password hash
    const computedNew = await hashPassword(newPassInput);
    setAdminPasswordHash(computedNew);
    safeSetLocalStorage("montepork_admin_pwd_hash", computedNew);
    setIsPassDefault(false);
    setShowChangePassModal(false);
    setCurrentPassInput("");
    setNewPassInput("");
    setConfirmPassInput("");

    // Auto-save the new password hash along with current layout config to the server disk immediately
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categories,
          menuItems,
          bankAccounts,
          rncHeader,
          contactInfo,
          storeSettings,
          adminPasswordHash: computedNew
        }),
      });
      showToast("🔒 ¡Contraseña modificada y respaldada en el servidor disk! 🔥");
    } catch (err) {
      console.error("Error auto-saving password to disk:", err);
      showToast("🔒 ¡Contraseña modificada! No se pudo actualizar en disco, recuerda guardar antes de salir.");
    }
  };

  if (isAdminPath && !isAdminLogged) {
    return (
      <div className="min-h-screen bg-dark-bg text-gray-100 font-sans flex flex-col justify-center items-center p-4 select-none relative overflow-hidden">
        {/* Neon lights background decoration */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-wine/25 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-dark-card border border-white/10 rounded-3xl p-8 relative shadow-2xl space-y-6 z-10">
          <div className="text-center space-y-3">
            <Logo 
              size="lg" 
              title={storeSettings.heroTitle} 
              logoType={storeSettings.logoType} 
              logoValue={storeSettings.logoValue}
              titleDisplayType={storeSettings.titleDisplayType}
              titleImageUrl={storeSettings.titleImageUrl}
              titleImageWidth={storeSettings.titleImageWidth}
            />
            <div className="space-y-1">
              <span className="text-primary text-xs font-black uppercase tracking-widest font-display block">Acceso Administrativo</span>
              <h1 className="text-2xl font-display font-black text-white">Panel Monte Pork</h1>
            </div>
            <p className="text-xs text-gray-400 font-light">
              Ingresa la clave de administración para realizar cambios instantáneos en la carta, fotos e información.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-400 block">Contraseña de Administrador (Inicial es 1234)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    if (loginError) setLoginError("");
                  }}
                  placeholder="••••"
                  className="w-full bg-black/35 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono tracking-widest text-center"
                  autoFocus
                />
              </div>
              {loginError && (
                <span className="text-xs text-primary font-medium animate-pulse block">
                  ⚠️ {loginError}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary hover:bg-primary-dark rounded-2xl text-white font-display font-black tracking-wider uppercase transition-all duration-300 transform active:scale-95 cursor-pointer shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <Unlock className="w-4 h-4 shrink-0" />
              <span>Entrar al Horno</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={handleExitAdminPath}
              className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer font-mono"
            >
              Cancelar y volver al menú
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isChangePasswordEnforced = isAdminLogged && isPassDefault;

  return (
    <div className="min-h-screen flex flex-col items-stretch overflow-x-hidden select-none bg-dark-bg text-gray-100 font-sans selection:bg-primary selection:text-white">
      
      {/* Dynamic Theme Color Stylesheet Overrides */}
      <style>{`
        :root {
          --primary-color: ${storeSettings.primaryColor || '#E8005A'};
          --primary-dark-color: ${storeSettings.primaryDarkColor || '#C20042'};
          --bg-color: ${storeSettings.backgroundColor || '#0A0A0B'};
          --card-color: ${storeSettings.cardColor || '#141416'};
          --accent-color: ${storeSettings.accentColor || '#FFB800'};
        }
        
        /* Ensure custom properties apply correctly with dynamic style injection */
        body {
          background-color: var(--color-dark-bg, #0A0A0B) !important;
        }
      `}</style>
      
      {/* Admin Action Panel Header */}
      {isAdminLogged && (
        <div className="bg-gradient-to-r from-dark-card to-black border-b border-primary/25 text-white py-3 px-4 sticky top-0 z-[60] shadow-xl flex flex-wrap items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse border border-primary/40 leading-none shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase font-display font-black tracking-widest text-primary block leading-tight">Panel Administrativo (Monte Pork)</span>
              <span className="text-[10px] text-gray-400 font-mono">Modo de Vista: {isAdminPreviewMode ? "👁️ Vista Cliente" : "✍️ Edición Directa"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAdminPreviewMode(!isAdminPreviewMode)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isAdminPreviewMode
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                  : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
              }`}
            >
              {isAdminPreviewMode ? "✍️ Volver a Editar" : "👁️ Probar Vista Cliente"}
            </button>

            <button
              onClick={() => setShowChangePassModal(true)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-primary" />
              <span>Cambiar Clave</span>
            </button>

            <button
              onClick={() => setShowBrandingModal(true)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-primary animate-pulse" style={{ color: "var(--color-primary)" }} />
              <span>Diseño y Colores</span>
            </button>

            <button
              onClick={handleSaveAllChanges}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
                hasUnsavedChanges
                  ? "bg-primary text-white shadow-primary/50 animate-pulse ring-2 ring-primary ring-offset-2 ring-offset-black font-extrabold"
                  : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/10"
              }`}
              style={hasUnsavedChanges ? { backgroundColor: "var(--color-primary, #E8005A)" } : {}}
            >
              {hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              )}
              <Save className="w-3.5 h-3.5" />
              <span>{hasUnsavedChanges ? "● Guardar Cambios (Pendientes)" : "Guardar Configuración"}</span>
            </button>

            <div className="h-6 w-px bg-white/10 mx-1"></div>

            <button
              onClick={handleAdminLogout}
              className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar</span>
            </button>
          </div>
        </div>
      )}

      {/* Forced Password Change Overlay Modal */}
      {(showChangePassModal || isChangePasswordEnforced) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-dark-card border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl relative">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto border border-primary/35">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-black text-white">
                {isChangePasswordEnforced ? "⚠️ CAMBIO DE CONTRASEÑA OBLIGATORIO" : "Cambiar Contraseña"}
              </h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                {isChangePasswordEnforced
                  ? "Estás con la contraseña inicial '1234'. Por motivos de seguridad, debes ingresar una clave nueva para activar las funciones del panel."
                  : "Ingresa tu clave actual y tu nueva clave secreta de administración."}
              </p>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 pt-1 font-sans">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500 font-bold block">Contraseña Actual ({isChangePasswordEnforced && "es 1234"})</label>
                <input
                  type="password"
                  value={currentPassInput}
                  onChange={(e) => setCurrentPassInput(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                  placeholder="Clave actual"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500 font-bold block">Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                  placeholder="Clave nueva"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500 font-bold block">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                  placeholder="Confirmar clave nueva"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                {!isChangePasswordEnforced && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassModal(false);
                      setCurrentPassInput("");
                      setNewPassInput("");
                      setConfirmPassInput("");
                    }}
                    className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary rounded-xl text-xs font-black text-white hover:opacity-95 uppercase tracking-wide cursor-pointer transition-all shadow-md shadow-primary/20"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Registar Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Branding and Store Customizer Modal */}
      {showBrandingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-dark-card border border-white/10 p-6 md:p-8 rounded-3xl w-full max-w-lg space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowBrandingModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto border border-primary/35">
                <Palette className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
              </div>
              <h3 className="text-lg font-display font-black text-white">
                Diseño y Colores del Negocio 🎨
              </h3>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Personaliza el nombre de tu marca y define las combinaciones de colores globales. Los cambios se verán reflejados de inmediato en la tienda.
              </p>
            </div>

            <div className="space-y-4 font-sans">
              {/* Title Mode Selection: Text or Centered Image */}
              <div className="space-y-3 bg-black/40 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider block">
                    Formato del Título / Encabezado
                  </span>
                  <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => handleUpdateSetting("titleDisplayType", "text")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        storeSettings.titleDisplayType !== "image"
                          ? "bg-primary text-white shadow-md shadow-primary/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Texto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSetting("titleDisplayType", "image")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        storeSettings.titleDisplayType === "image"
                          ? "bg-primary text-white shadow-md shadow-primary/30"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Imagen Centrada</span>
                    </button>
                  </div>
                </div>

                {storeSettings.titleDisplayType === "image" ? (
                  <div className="space-y-3 pt-1 animate-fadeIn">
                    <p className="text-[11px] text-gray-300 font-light">
                      Sube, arrastra o pega (Ctrl+V) una imagen con el logo o título de tu negocio (.png o .jpg) para mostrarlo centrado.
                    </p>
                    
                    <ImageDropUpload
                      currentImage={storeSettings.titleImageUrl}
                      onImageChange={(val) => handleUpdateSetting("titleImageUrl", val)}
                      label="Imagen del Título / Logo de Marca"
                      aspectRatio="wide"
                    />

                    {/* Width adjustment with up to +100% expansion */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">Tamaño / Ancho del Título:</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-primary font-bold text-xs">{storeSettings.titleImageWidth || 320}px</span>
                          <span className="text-[10px] text-gray-400">
                            ({(storeSettings.titleImageWidth || 320) > 520 ? `+${Math.round((((storeSettings.titleImageWidth || 320) - 520) / 520) * 100)}% más grande` : "Estándar"})
                          </span>
                        </div>
                      </div>

                      {/* Interactive Slider up to 1040px (+100% larger than 520px) */}
                      <input
                        type="range"
                        min="180"
                        max="1040"
                        step="20"
                        value={storeSettings.titleImageWidth || 320}
                        onChange={(e) => handleUpdateSetting("titleImageWidth", Number(e.target.value))}
                        className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-primary border border-white/10"
                      />

                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-[10px]">
                        {[
                          { label: "Compacto", val: 240 },
                          { label: "Normal", val: 320 },
                          { label: "Grande", val: 420 },
                          { label: "Extra", val: 520 },
                          { label: "Súper", val: 680 },
                          { label: "Mega", val: 840 },
                          { label: "Máx +100%", val: 1040 },
                        ].map((sz) => (
                          <button
                            key={sz.val}
                            type="button"
                            onClick={() => handleUpdateSetting("titleImageWidth", sz.val)}
                            className={`py-1 px-0.5 rounded-lg border text-center font-bold cursor-pointer transition-all ${
                              (storeSettings.titleImageWidth || 320) === sz.val
                                ? "bg-primary/20 border-primary text-white"
                                : "bg-black/30 border-white/5 text-gray-400 hover:bg-black/50"
                            }`}
                          >
                            <span className="block truncate">{sz.label}</span>
                            <span className="text-[8px] opacity-70 block">{sz.val}px</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fadeIn">
                    {/* Business Name Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-500 font-bold block">Nombre del Negocio (E.g. MONTE PORK)</label>
                      <input
                        type="text"
                        value={storeSettings.heroTitle}
                        onChange={(e) => handleUpdateSetting("heroTitle", e.target.value)}
                        className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-primary focus:outline-none text-center font-display font-black"
                        placeholder="Ej: MONTE PORK"
                      />
                    </div>

                    {/* Logo / Icon Customizer */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider block">Logotipo del Título (Ej: la "O" de MONTE PORK)</span>
                      
                      <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                        {[
                          { id: "snout", name: "Hocico 🐷", desc: "Original" },
                          { id: "emoji", name: "Emoji 🍗", desc: "Texto" },
                          { id: "image", name: "Imagen 🖼️", desc: "URL" },
                          { id: "none", name: "Quitar ❌", desc: "Texto Plano" }
                        ].map((option) => {
                          const isSelected = (storeSettings.logoType || "snout") === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleUpdateSetting("logoType", option.id)}
                              className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                                isSelected 
                                  ? "bg-primary/10 border-primary text-white font-bold" 
                                  : "bg-black/30 border-white/5 text-gray-400 hover:bg-black/50 hover:border-white/10"
                              }`}
                            >
                              <span>{option.name}</span>
                              <span className="text-[9px] text-gray-500 font-light mt-0.5">{option.desc}</span>
                            </button>
                          );
                        })}
                      </div>

                      {storeSettings.logoType === "emoji" && (
                        <div className="space-y-1.5 pt-1.5 animate-fadeIn">
                          <label className="text-[10px] uppercase text-gray-400 font-semibold block">Sustituir con un Emoji</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={storeSettings.logoValue || "🐷"}
                              onChange={(e) => handleUpdateSetting("logoValue", e.target.value)}
                              className="flex-1 bg-black/35 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
                              placeholder="Ej: 🐷, 🍗, 🔥, 🐽"
                            />
                            <div className="flex gap-1">
                              {["🐷", "🍗", "🔥", "🐽", "🍔", "🍺"].map((em) => (
                                <button
                                  key={em}
                                  type="button"
                                  onClick={() => handleUpdateSetting("logoValue", em)}
                                  className="w-7 h-7 flex items-center justify-center bg-black/40 border border-white/10 rounded-lg text-xs hover:border-primary cursor-pointer active:scale-95 transition-all"
                                >
                                  {em}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {storeSettings.logoType === "image" && (
                        <div className="space-y-1.5 pt-1.5 animate-fadeIn">
                          <label className="text-[10px] uppercase text-gray-400 font-semibold block">Sustituir con URL de Imagen</label>
                          <input
                            type="text"
                            value={storeSettings.logoValue || ""}
                            onChange={(e) => handleUpdateSetting("logoValue", e.target.value)}
                            className="w-full bg-black/35 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-primary focus:outline-none font-mono"
                            placeholder="https://ejemplo.com/mi-logo.png"
                          />
                          <div className="text-[9px] text-gray-500 font-light flex items-center gap-1.5">
                            <span>Sugerencia: Usa una imagen cuadrada para que se vea perfecta.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Background Settings Section (Image, Solid Color, Gradient) */}
              <div className="space-y-3 bg-black/40 border border-white/10 rounded-2xl p-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Fondo de la Página y Portada</span>
                  </span>
                  
                  {/* Selector of Mode */}
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-[11px]">
                    {[
                      { id: "image", label: "Foto / Imagen", icon: ImageIcon },
                      { id: "solid", label: "Color Sólido", icon: Paintbrush },
                      { id: "gradient", label: "Degradado", icon: Sparkles },
                    ].map((mode) => {
                      const isSel = (storeSettings.backgroundType || "image") === mode.id;
                      const IconComp = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => handleUpdateSetting("backgroundType", mode.id)}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isSel
                              ? "bg-primary text-white shadow-md shadow-primary/30"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          <IconComp className="w-3 h-3" />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-panels based on backgroundType */}
                {storeSettings.backgroundType === "solid" && (
                  <div className="space-y-2 pt-1 animate-fadeIn">
                    <p className="text-[11px] text-gray-300 font-light">
                      Elige un color liso uniforme para el fondo de la portada y la página.
                    </p>
                    <div className="flex items-center justify-between gap-3 bg-black/25 border border-white/10 p-3 rounded-xl">
                      <span className="text-xs text-gray-300 font-medium">Color de Fondo Sólido:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={storeSettings.backgroundSolidColor || storeSettings.backgroundColor || "#0A0A0B"}
                          onChange={(e) => handleUpdateSetting("backgroundSolidColor", e.target.value)}
                          className="w-24 bg-black/40 text-gray-200 text-xs font-mono border border-white/15 px-2 py-1 rounded-lg text-center focus:outline-none focus:border-primary"
                        />
                        <input
                          type="color"
                          value={storeSettings.backgroundSolidColor || storeSettings.backgroundColor || "#0A0A0B"}
                          onChange={(e) => handleUpdateSetting("backgroundSolidColor", e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-white/20 p-0 bg-transparent shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {storeSettings.backgroundType === "gradient" && (
                  <div className="space-y-3 pt-1 animate-fadeIn">
                    <p className="text-[11px] text-gray-300 font-light">
                      Selecciona una combinación degradada armónica o personaliza tus propios colores.
                    </p>

                    {/* Gradient Presets */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {GRADIENT_PRESETS.map((gp) => {
                        const isSelected = (storeSettings.backgroundGradientPreset || "fucsia_noir") === gp.id;
                        return (
                          <button
                            key={gp.id}
                            type="button"
                            onClick={() => handleUpdateSettings({
                              backgroundGradientPreset: gp.id,
                              backgroundGradientColor1: gp.color1,
                              backgroundGradientColor2: gp.color2,
                              backgroundGradientDirection: gp.direction
                            })}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                              isSelected
                                ? "border-primary bg-primary/10 shadow-md shadow-primary/20"
                                : "border-white/10 bg-black/30 hover:border-white/20"
                            }`}
                          >
                            <div className="w-full h-8 rounded-lg border border-white/20" style={{ background: gp.preview }}></div>
                            <span className="text-[10px] font-bold text-gray-200 truncate">{gp.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Gradient Controls */}
                    <div className="bg-black/30 border border-white/5 p-2.5 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase">
                        <span>Ajustar Colores del Degradado</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between bg-black/40 border border-white/10 p-1.5 rounded-lg">
                          <span className="text-[11px] text-gray-400">Color 1 (Arriba):</span>
                          <input
                            type="color"
                            value={storeSettings.backgroundGradientColor1 || "#2B0017"}
                            onChange={(e) => handleUpdateSetting("backgroundGradientColor1", e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                          />
                        </div>
                        <div className="flex items-center justify-between bg-black/40 border border-white/10 p-1.5 rounded-lg">
                          <span className="text-[11px] text-gray-400">Color 2 (Abajo):</span>
                          <input
                            type="color"
                            value={storeSettings.backgroundGradientColor2 || "#0A0A0B"}
                            onChange={(e) => handleUpdateSetting("backgroundGradientColor2", e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(!storeSettings.backgroundType || storeSettings.backgroundType === "image") && (
                  <div className="space-y-3 pt-1 animate-fadeIn">
                    <p className="text-[11px] text-gray-300 font-light">
                      Sube o arrastra una nueva imagen para el fondo de la portada. Se mantendrá el mismo formato y efecto visual.
                    </p>
                    <ImageDropUpload
                      currentImage={storeSettings.backgroundImageUrl || chicharronHeroImage}
                      onImageChange={(val) => handleUpdateSetting("backgroundImageUrl", val)}
                      label="Imagen de Fondo de Portada"
                      aspectRatio="wide"
                    />
                    {storeSettings.backgroundImageUrl && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleUpdateSetting("backgroundImageUrl", "")}
                          className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer underline"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restablecer a Foto Original de Chicharrón</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Presets Grid */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-gray-500 font-bold block">Preajustes / Combinaciones sugeridas</label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = storeSettings.primaryColor === preset.primaryColor && storeSettings.backgroundColor === preset.backgroundColor;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleUpdateSettings({
                          primaryColor: preset.primaryColor,
                          primaryDarkColor: preset.primaryDarkColor,
                          accentColor: preset.accentColor,
                          backgroundColor: preset.backgroundColor,
                          cardColor: preset.cardColor
                        })}
                        className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex flex-col gap-1 cursor-pointer ${
                          isSelected 
                            ? "bg-primary/10 border-primary text-white" 
                            : "bg-black/30 border-white/5 text-gray-300 hover:bg-black/50 hover:border-white/10"
                        }`}
                      >
                        <span className="font-display truncate text-[10px] block w-full">{preset.name}</span>
                        <div className="flex gap-1.5 mt-0.5">
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20 block" style={{ backgroundColor: preset.primaryColor }}></span>
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20 block" style={{ backgroundColor: preset.accentColor }}></span>
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20 block" style={{ backgroundColor: preset.backgroundColor }}></span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Colors Picker */}
              <div className="space-y-3 bg-black/40 border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider block">Personalizar colores específicos</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-between gap-2 bg-black/25 border border-white/10 p-2 rounded-xl">
                    <span className="text-gray-300 font-medium">Color Principal:</span>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text" 
                        value={storeSettings.primaryColor} 
                        onChange={(e) => handleUpdateSetting("primaryColor", e.target.value)}
                        className="w-16 bg-transparent text-gray-300 text-[11px] font-mono border-b border-white/15 text-center focus:outline-none"
                      />
                      <input 
                        type="color" 
                        value={storeSettings.primaryColor} 
                        onChange={(e) => handleUpdateSetting("primaryColor", e.target.value)}
                        className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 bg-transparent shrink-0" 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-black/25 border border-white/10 p-2 rounded-xl">
                    <span className="text-gray-300 font-medium">Color Oscuro:</span>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text" 
                        value={storeSettings.primaryDarkColor} 
                        onChange={(e) => handleUpdateSetting("primaryDarkColor", e.target.value)}
                        className="w-16 bg-transparent text-gray-300 text-[11px] font-mono border-b border-white/15 text-center focus:outline-none"
                      />
                      <input 
                        type="color" 
                        value={storeSettings.primaryDarkColor} 
                        onChange={(e) => handleUpdateSetting("primaryDarkColor", e.target.value)}
                        className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 bg-transparent shrink-0" 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-black/25 border border-white/10 p-2 rounded-xl">
                    <span className="text-gray-300 font-medium">Color de Acento:</span>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text" 
                        value={storeSettings.accentColor} 
                        onChange={(e) => handleUpdateSetting("accentColor", e.target.value)}
                        className="w-16 bg-transparent text-gray-300 text-[11px] font-mono border-b border-white/15 text-center focus:outline-none"
                      />
                      <input 
                        type="color" 
                        value={storeSettings.accentColor} 
                        onChange={(e) => handleUpdateSetting("accentColor", e.target.value)}
                        className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 bg-transparent shrink-0" 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-black/25 border border-white/10 p-2 rounded-xl">
                    <span className="text-gray-300 font-medium">Color de Fondo:</span>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text" 
                        value={storeSettings.backgroundColor} 
                        onChange={(e) => handleUpdateSetting("backgroundColor", e.target.value)}
                        className="w-16 bg-transparent text-gray-300 text-[11px] font-mono border-b border-white/15 text-center focus:outline-none"
                      />
                      <input 
                        type="color" 
                        value={storeSettings.backgroundColor} 
                        onChange={(e) => handleUpdateSetting("backgroundColor", e.target.value)}
                        className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 bg-transparent shrink-0" 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-black/25 border border-white/10 p-2 rounded-xl sm:col-span-2">
                    <span className="text-gray-300 font-medium">Color de Tarjetas del Menú:</span>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text" 
                        value={storeSettings.cardColor} 
                        onChange={(e) => handleUpdateSetting("cardColor", e.target.value)}
                        className="w-16 bg-transparent text-gray-300 text-[11px] font-mono border-b border-white/15 text-center focus:outline-none"
                      />
                      <input 
                        type="color" 
                        value={storeSettings.cardColor} 
                        onChange={(e) => handleUpdateSetting("cardColor", e.target.value)}
                        className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 bg-transparent shrink-0" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tagline / Slogan below specialty setting */}
              <div className="space-y-1.5 bg-black/40 border border-white/5 rounded-2xl p-3.5 text-xs">
                <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider block">
                  Texto / Lema debajo de Nuestra Especialidad (Barra del Menú)
                </span>
                <input
                  type="text"
                  value={storeSettings.menuTagline !== undefined ? storeSettings.menuTagline : "El Más Crujiente"}
                  onChange={(e) => handleUpdateSetting("menuTagline", e.target.value)}
                  className="w-full bg-black/35 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-primary"
                  placeholder="El Más Crujiente"
                />
              </div>

              {/* Browser Tab Title Customization */}
              <div className="space-y-2 bg-black/40 border border-white/10 rounded-2xl p-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <span>Título de la Pestaña del Navegador</span>
                  </span>
                  {storeSettings.tabTitle && storeSettings.tabTitle !== "MONTE PORK | El Más Crujiente de la Región" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateSetting("tabTitle", "MONTE PORK | El Más Crujiente de la Región")}
                      className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer underline"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Restablecer</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-300 font-light">
                  Edita el título que los visitantes ven en la pestaña superior de su navegador web (Google Chrome, Safari, etc.).
                </p>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={storeSettings.tabTitle !== undefined ? storeSettings.tabTitle : "MONTE PORK | El Más Crujiente de la Región"}
                      onChange={(e) => handleUpdateSetting("tabTitle", e.target.value)}
                      className="w-full bg-black/45 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:border-primary focus:outline-none pr-8"
                      placeholder="MONTE PORK | El Más Crujiente de la Región"
                    />
                    <Globe className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                  </div>

                  {/* Live Tab Preview Card */}
                  <div className="bg-black/50 border border-white/10 rounded-xl p-2 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 bg-[#1e1f22] text-gray-300 px-3 py-1.5 rounded-lg border border-white/10 max-w-full truncate shadow-inner">
                      <span className="text-xs">🐷</span>
                      <span className="text-[11px] font-mono text-white truncate max-w-[200px] sm:max-w-[340px]">
                        {storeSettings.tabTitle || `${storeSettings.heroTitle || "MONTE PORK"} | ${storeSettings.heroSubtitle || "El Más Crujiente de la Región"}`}
                      </span>
                      <span className="text-[10px] text-gray-500 ml-1">✕</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">Vista previa en tiempo real</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowBrandingModal(false);
                  showToast("✨ Cambios aplicados en tiempo real. ¡No olvides guardarlos!");
                }}
                className="w-full py-3 bg-primary rounded-xl text-xs font-black text-white hover:opacity-95 uppercase tracking-wide cursor-pointer transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                <Check className="w-4 h-4" />
                <span>Aplicar y Cerrar</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Visual Toast Notification Overlay */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-black/95 text-white border border-primary/50 text-sm font-display font-medium px-5 py-3 rounded-2xl shadow-2xl shadow-primary/20 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-[92vh] flex flex-col justify-end items-center px-4 py-16 overflow-hidden md:px-8 border-b border-white/5"
      >
        {/* Background Layer: Image, Solid Color, or Gradient */}
        {storeSettings.backgroundType === "solid" ? (
          <div 
            className="absolute inset-0 transition-colors duration-700"
            style={{ backgroundColor: storeSettings.backgroundSolidColor || storeSettings.backgroundColor || "#0A0A0B" }}
          >
            {/* Atmospheric subtle vignette for perfect contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-black/60"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
          </div>
        ) : storeSettings.backgroundType === "gradient" ? (
          <div 
            className="absolute inset-0 transition-all duration-700"
            style={{ background: getGradientCss(storeSettings) }}
          >
            {/* Atmospheric subtle vignette for perfect contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-black/50"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-black/60"></div>
          </div>
        ) : (
          /* Default: Image Background with identical aesthetic format */
          <div className="absolute inset-0 bg-black">
            <img
              src={storeSettings.backgroundImageUrl || chicharronHeroImage}
              alt="Monte Pork Chicharrón"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105 transition-all duration-1000 transform hover:scale-100"
            />
            {/* Intense vignette & custom fucsia gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/70 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-black/85"></div>
          </div>
        )}

        {/* Floating status bubble */}
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs z-20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {isAdminLogged && !isAdminPreviewMode ? (
            <input
              type="text"
              value={storeSettings.activeStatusLabel}
              onChange={(e) => handleUpdateSetting("activeStatusLabel", e.target.value)}
              className="bg-black/45 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-gray-200 focus:outline-none focus:border-primary font-bold uppercase tracking-wider max-w-[170px]"
            />
          ) : (
            <span className="font-display font-bold uppercase tracking-wider text-[10px] text-gray-300">
              {storeSettings.activeStatusLabel}
            </span>
          )}
        </div>

        {/* Content Container */}
        <div className="relative max-w-4xl text-center space-y-6 z-10 w-full">
          
          {/* Admin Header & Background Toolbar */}
          {isAdminLogged && !isAdminPreviewMode && (
            <div className="bg-black/80 backdrop-blur-md border border-primary/40 rounded-2xl p-4 max-w-2xl mx-auto space-y-3 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                <span className="text-[11px] font-display font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Personalizar Portada & Fondo</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Title type selector */}
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => handleUpdateSetting("titleDisplayType", "text")}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        storeSettings.titleDisplayType !== "image"
                          ? "bg-primary text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Type className="w-3 h-3" />
                      <span>Texto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSetting("titleDisplayType", "image")}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        storeSettings.titleDisplayType === "image"
                          ? "bg-primary text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Imagen Centrada</span>
                    </button>
                  </div>

                  {/* Open full branding modal button */}
                  <button
                    type="button"
                    onClick={() => setShowBrandingModal(true)}
                    className="px-2.5 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/40 text-white rounded-xl text-[11px] font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    <span>Fondo & Colores</span>
                  </button>
                </div>
              </div>

              {/* Title image size & upload controls */}
              {storeSettings.titleDisplayType === "image" ? (
                <div className="space-y-3 text-left">
                  <p className="text-[11px] text-gray-300">
                    Sube, arrastra o pega (Ctrl+V) una imagen con el logo o título de tu negocio (.png o .jpg) para mostrarlo centrado.
                  </p>
                  <ImageDropUpload
                    currentImage={storeSettings.titleImageUrl}
                    onImageChange={(val) => handleUpdateSetting("titleImageUrl", val)}
                    label="Imagen del Título / Logo de Portada"
                    aspectRatio="wide"
                  />

                  {/* Size slider up to 100% larger (1040px) */}
                  <div className="space-y-1.5 pt-1 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 text-[11px] font-medium">Tamaño del Título de Imagen:</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-primary font-bold">{storeSettings.titleImageWidth || 320}px</span>
                        <span className="text-[10px] text-gray-400">
                          ({(storeSettings.titleImageWidth || 320) > 520 ? `+${Math.round((((storeSettings.titleImageWidth || 320) - 520) / 520) * 100)}% más grande` : "Estándar"})
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="180"
                      max="1040"
                      step="20"
                      value={storeSettings.titleImageWidth || 320}
                      onChange={(e) => handleUpdateSetting("titleImageWidth", Number(e.target.value))}
                      className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-primary border border-white/10"
                    />

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-[10px]">
                      {[
                        { label: "Compacto", val: 240 },
                        { label: "Normal", val: 320 },
                        { label: "Grande", val: 420 },
                        { label: "Extra", val: 520 },
                        { label: "Súper", val: 680 },
                        { label: "Mega", val: 840 },
                        { label: "Máx +100%", val: 1040 },
                      ].map((sz) => (
                        <button
                          key={sz.val}
                          type="button"
                          onClick={() => handleUpdateSetting("titleImageWidth", sz.val)}
                          className={`py-1 px-0.5 rounded-lg border text-center font-bold cursor-pointer transition-all ${
                            (storeSettings.titleImageWidth || 320) === sz.val
                              ? "bg-primary text-white border-primary"
                              : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                          }`}
                        >
                          <span className="block truncate">{sz.label}</span>
                          <span className="text-[8px] opacity-70 block">{sz.val}px</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-left">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={storeSettings.heroTitle}
                      onChange={(e) => handleUpdateSetting("heroTitle", e.target.value)}
                      className="flex-1 bg-black/45 border border-white/10 rounded-xl px-3 py-1.5 text-sm font-display font-black text-white focus:outline-none focus:border-primary text-center"
                      placeholder="Nombre del Negocio (ej: MONTE PORK)"
                    />
                  </div>
                </div>
              )}

              {/* Quick Background Selector in Hero */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-gray-400 text-[11px] flex items-center gap-1">
                  <Layers className="w-3 h-3 text-primary" />
                  <span>Fondo actual:</span>
                </span>
                
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-[11px]">
                  {[
                    { id: "image", label: "Foto", icon: ImageIcon },
                    { id: "solid", label: "Color Sólido", icon: Paintbrush },
                    { id: "gradient", label: "Degradado", icon: Sparkles },
                  ].map((mode) => {
                    const isSel = (storeSettings.backgroundType || "image") === mode.id;
                    const IconComp = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleUpdateSetting("backgroundType", mode.id)}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isSel
                            ? "bg-primary text-white shadow-sm"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <IconComp className="w-3 h-3" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Live Hero Title Render */}
          <div className="space-y-2 animate-fadeIn flex flex-col items-center justify-center">
            <Logo 
              size="xl" 
              title={storeSettings.heroTitle} 
              logoType={storeSettings.logoType} 
              logoValue={storeSettings.logoValue}
              titleDisplayType={storeSettings.titleDisplayType}
              titleImageUrl={storeSettings.titleImageUrl}
              titleImageWidth={storeSettings.titleImageWidth}
            />
            {isAdminLogged && !isAdminPreviewMode ? (
              <input
                type="text"
                value={storeSettings.heroSubtitle}
                onChange={(e) => handleUpdateSetting("heroSubtitle", e.target.value)}
                className="text-xl md:text-3xl font-display font-black text-white/95 uppercase tracking-wide italic bg-black/45 border border-white/10 rounded-xl px-4 py-2 w-full text-center focus:outline-none focus:border-primary font-sans max-w-2xl mx-auto block"
                placeholder="Subtítulo de portada"
              />
            ) : (
              <h2 className="text-xl md:text-3xl font-display font-black text-white/95 uppercase tracking-wide italic">
                {storeSettings.heroSubtitle}
              </h2>
            )}
            <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
          </div>

          {isAdminLogged && !isAdminPreviewMode ? (
            <textarea
              rows={3}
              value={storeSettings.heroDescription}
              onChange={(e) => handleUpdateSetting("heroDescription", e.target.value)}
              className="max-w-xl mx-auto text-sm md:text-base text-gray-300 font-light leading-relaxed bg-black/45 border border-white/10 rounded-xl p-3 w-full text-center focus:outline-none focus:border-primary font-sans block"
              placeholder="Descripción de portada"
            />
          ) : (
            <p className="max-w-xl mx-auto text-sm md:text-lg text-gray-300 font-light leading-relaxed">
              {storeSettings.heroDescription}
            </p>
          )}

          {/* Social connections bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-mono font-medium text-gray-400 py-3 px-4 bg-white/5 border border-white/5 rounded-2xl max-w-md mx-auto backdrop-blur-md">
            {isAdminLogged && !isAdminPreviewMode ? (
              <div className="flex flex-col gap-2 w-full">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold text-center">Ajustes de Contacto</span>
                <div className="flex items-center gap-2 bg-black/35 border border-white/10 rounded-xl px-3 py-1.5 w-full">
                  <Instagram className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-gray-500">instagram.com/</span>
                  <input
                    type="text"
                    value={contactInfo.instagram}
                    onChange={(e) => handleUpdateContactInfo("instagram", e.target.value)}
                    className="bg-transparent text-gray-200 focus:outline-none w-full font-sans text-xs"
                    placeholder="monteporkrd"
                  />
                </div>
                <div className="flex items-center gap-2 bg-black/35 border border-white/10 rounded-xl px-3 py-1.5 w-full">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-gray-500">WhatsApp:</span>
                  <input
                    type="text"
                    value={contactInfo.phone}
                    onChange={(e) => handleUpdateContactInfo("phone", e.target.value)}
                    className="bg-transparent text-gray-200 focus:outline-none w-full font-sans text-xs"
                    placeholder="18498140019"
                  />
                </div>
              </div>
            ) : (
              <>
                <a
                  href={`https://instagram.com/${contactInfo.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                >
                  <Instagram className="w-4 h-4 text-primary" />
                  <span>@{contactInfo.instagram}</span>
                </a>
                <span className="text-white/20 hidden sm:inline">|</span>
                <a
                  href={`https://wa.me/${contactInfo.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>+{contactInfo.phone}</span>
                </a>
              </>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full max-w-md mx-auto">
            {isAdminLogged && !isAdminPreviewMode ? (
              <div className="flex flex-col gap-3 w-full">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Textos de Botones</span>
                <div className="flex items-center gap-2 bg-black/45 border border-white/10 rounded-xl px-3 py-2 w-full">
                  <span className="text-xs text-gray-400 font-mono">Boton 1:</span>
                  <input
                    type="text"
                    value={storeSettings.heroButton1Text}
                    onChange={(e) => handleUpdateSetting("heroButton1Text", e.target.value)}
                    className="bg-transparent text-white focus:outline-none w-full text-xs font-bold font-display"
                    placeholder="Ver Menú"
                  />
                </div>
                <div className="flex items-center gap-2 bg-black/45 border border-white/10 rounded-xl px-3 py-2 w-full">
                  <span className="text-xs text-gray-400 font-mono">Boton 2:</span>
                  <input
                    type="text"
                    value={storeSettings.heroButton2Text}
                    onChange={(e) => handleUpdateSetting("heroButton2Text", e.target.value)}
                    className="bg-transparent text-white focus:outline-none w-full text-xs font-bold font-display"
                    placeholder="Escríbenos"
                  />
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleScrollToSection("menu")}
                  style={{ backgroundColor: "var(--color-primary)" }}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl font-display font-black text-white tracking-wide uppercase shadow-lg shadow-primary/30 transform transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UtensilsCrossed className="w-5 h-5 shrink-0" />
                  <span>{storeSettings.heroButton1Text}</span>
                </button>

                <a
                  href={`https://wa.me/${contactInfo.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-10 py-4 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white font-display font-black tracking-wide uppercase border border-white/10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 shrink-0 text-emerald-400 fill-emerald-400/10" />
                  <span>{storeSettings.heroButton2Text}</span>
                </a>
              </>
            )}
          </div>

          <div className="pt-6 animate-pulse">
            <ChevronDown className="w-6 h-6 mx-auto text-gray-500 hover:text-primary transition-colors cursor-pointer" onClick={() => handleScrollToSection("menu")} />
          </div>
        </div>

        {/* Left decoration watermark */}
        <div className="absolute left-6 bottom-6 hidden md:block text-left opacity-30 select-none pointer-events-none">
          <span className="font-mono text-[10px] tracking-wider block text-gray-500">MONTE PORK DE RD SRL</span>
          <span className="font-mono text-[10px] tracking-wider block text-gray-500">SANTO DOMINGO, RD</span>
        </div>
      </section>

      {/* Signature Dishes Showcase (Nuestra Especialidad) */}
      <section className="bg-gradient-to-b from-dark-bg to-dark-card py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-black/45 rounded-3xl p-6 md:p-10 border border-white/5 relative overflow-hidden">
          {/* Neon lights */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-wine/20 rounded-full blur-3xl"></div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/30 px-3 py-1 rounded-full text-xs font-display font-black text-primary uppercase tracking-wider animate-pulse">
              <Sparkles className="w-3.5 h-3.5 fill-primary" />
              {isAdminLogged && !isAdminPreviewMode ? (
                <input
                  type="text"
                  value={storeSettings.specialtyBadge}
                  onChange={(e) => handleUpdateSetting("specialtyBadge", e.target.value)}
                  className="bg-transparent text-primary focus:outline-none text-xs font-black uppercase tracking-wider font-display max-w-[150px]"
                />
              ) : (
                <span>{storeSettings.specialtyBadge}</span>
              )}
            </div>
            
            {isAdminLogged && !isAdminPreviewMode ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={storeSettings.specialtyTitle}
                  onChange={(e) => handleUpdateSetting("specialtyTitle", e.target.value)}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-3 py-1.5 text-lg font-display font-bold text-white focus:outline-none focus:border-primary font-sans"
                  placeholder="Título de la especialidad..."
                />
                <input
                  type="text"
                  value={storeSettings.specialtyTitleHighlight}
                  onChange={(e) => handleUpdateSetting("specialtyTitleHighlight", e.target.value)}
                  className="w-full bg-black/45 border border-white/10 rounded-xl px-3 py-1.5 text-lg font-display font-bold text-primary focus:outline-none focus:border-primary font-sans"
                  style={{ color: "var(--color-primary)" }}
                  placeholder="Destacado (fucsia)..."
                />
              </div>
            ) : (
              <h2 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">
                {storeSettings.specialtyTitle} <span className="text-primary text-pulse-glow" style={{ color: "var(--color-primary)" }}>{storeSettings.specialtyTitleHighlight}</span>
              </h2>
            )}
            
            {isAdminLogged && !isAdminPreviewMode ? (
              <textarea
                rows={3}
                value={storeSettings.specialtyDescription}
                onChange={(e) => handleUpdateSetting("specialtyDescription", e.target.value)}
                className="w-full bg-black/45 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-primary font-sans"
                placeholder="Descripción de la especialidad..."
              />
            ) : (
              <p className="text-sm md:text-base text-gray-300 font-light leading-relaxed">
                {storeSettings.specialtyDescription}
              </p>
            )}

            <div className="flex items-center gap-6 py-2 border-t border-b border-white/5 my-4 font-sans">
              <div>
                {isAdminLogged && !isAdminPreviewMode ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={storeSettings.specialtyPriceLabel}
                      onChange={(e) => handleUpdateSetting("specialtyPriceLabel", e.target.value)}
                      className="bg-black/45 border border-white/10 rounded-lg px-2 py-0.5 text-[10px] text-gray-500 font-mono focus:outline-none w-24 block"
                    />
                    <input
                      type="text"
                      value={storeSettings.specialtyPriceValue}
                      onChange={(e) => handleUpdateSetting("specialtyPriceValue", e.target.value)}
                      className="bg-black/45 border border-white/10 rounded-lg px-2 py-0.5 text-xs font-bold text-white focus:outline-none w-24 block"
                    />
                  </div>
                ) : (
                  <>
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-display block">{storeSettings.specialtyPriceLabel}</span>
                    <span className="text-2xl font-black font-mono text-white">{storeSettings.specialtyPriceValue}</span>
                  </>
                )}
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div>
                {isAdminLogged && !isAdminPreviewMode ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={storeSettings.specialtyFlavorLabel}
                      onChange={(e) => handleUpdateSetting("specialtyFlavorLabel", e.target.value)}
                      className="bg-black/45 border border-white/10 rounded-lg px-2 py-0.5 text-[10px] text-gray-500 font-mono focus:outline-none w-28 block"
                    />
                    <input
                      type="text"
                      value={storeSettings.specialtyFlavorValue}
                      onChange={(e) => handleUpdateSetting("specialtyFlavorValue", e.target.value)}
                      className="bg-black/45 border border-white/10 rounded-lg px-2 py-0.5 text-xs font-bold text-white focus:outline-none w-28 block"
                    />
                  </div>
                ) : (
                  <>
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-display block">{storeSettings.specialtyFlavorLabel}</span>
                    <span className="text-sm font-bold text-gray-300">{storeSettings.specialtyFlavorValue}</span>
                  </>
                )}
              </div>
            </div>

            {isAdminLogged && !isAdminPreviewMode ? (
              <div className="flex items-center gap-2 bg-black/45 border border-white/10 rounded-xl px-3 py-2">
                <span className="text-xs text-gray-400 font-mono">Boton Especialidad:</span>
                <input
                  type="text"
                  value={storeSettings.specialtyButtonText || "Agregar al plato"}
                  onChange={(e) => handleUpdateSetting("specialtyButtonText", e.target.value)}
                  className="bg-transparent text-white focus:outline-none text-xs font-bold font-sans"
                  placeholder="Agregar al plato"
                />
              </div>
            ) : (
              <button
                id="btn-specialty-add-to-cart"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddSpecialtyToCart();
                }}
                style={{ backgroundColor: "var(--color-primary)" }}
                className="px-6 py-3 rounded-xl font-display font-bold text-sm text-white hover:opacity-90 transform active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>{storeSettings.specialtyButtonText || "Agregar al plato"}</span>
              </button>
            )}
          </div>

          {/* Photo & Custom Photo Editor */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden aspect-square border border-white/10 shadow-2xl shadow-black group">
              <img
                src={storeSettings.specialtyImage || mofongoImage}
                alt="Mofongo Monte Pork"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-auto">
                {isAdminLogged && !isAdminPreviewMode ? (
                  <div className="space-y-1 bg-black/70 backdrop-blur-md p-2 rounded-xl border border-white/10">
                    <input
                      type="text"
                      value={storeSettings.specialtyPhotoBadge || "Foto real de cocina"}
                      onChange={(e) => handleUpdateSetting("specialtyPhotoBadge", e.target.value)}
                      className="text-[10px] font-display font-medium text-primary uppercase tracking-wider block bg-transparent focus:outline-none w-full"
                      placeholder="Etiqueta (ej: Foto real de cocina)"
                    />
                    <input
                      type="text"
                      value={storeSettings.specialtyPhotoCaption || "El Mofongo MP recién salido del pilón"}
                      onChange={(e) => handleUpdateSetting("specialtyPhotoCaption", e.target.value)}
                      className="text-xs font-bold text-white block bg-transparent focus:outline-none w-full"
                      placeholder="Pie de foto"
                    />
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-display font-medium text-gray-400 uppercase tracking-wider block">
                      {storeSettings.specialtyPhotoBadge || "Foto real de cocina"}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {storeSettings.specialtyPhotoCaption || "El Mofongo MP recién salido del pilón"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* In Admin Mode: Photo Uploader / Replacer */}
            {isAdminLogged && !isAdminPreviewMode && (
              <div className="bg-black/60 border border-white/10 rounded-2xl p-3">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">
                  Cambiar / Sustituir Foto de la Especialidad (.png o .jpg)
                </span>
                <ImageDropUpload
                  currentImage={storeSettings.specialtyImage}
                  onImageChange={(val) => handleUpdateSetting("specialtyImage", val)}
                  label="Foto de la Especialidad"
                  aspectRatio="square"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sticky Top Menu Navigator & Search Bar wrapper */}
      <div id="sticky-header" className="sticky top-0 bg-dark-bg/95 backdrop-blur-lg border-b border-white/5 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            
            {/* Logo and Tagline representation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo 
                  size="sm" 
                  title={storeSettings.heroTitle} 
                  logoType={storeSettings.logoType} 
                  logoValue={storeSettings.logoValue}
                  titleDisplayType={storeSettings.titleDisplayType}
                  titleImageUrl={storeSettings.titleImageUrl}
                  titleImageWidth={storeSettings.titleImageWidth}
                />
                {isAdminLogged && !isAdminPreviewMode ? (
                  <div className="flex items-center gap-1.5 bg-black/40 border border-primary/30 px-2 py-0.5 rounded-lg">
                    <span className="text-[10px] text-primary font-mono hidden sm:inline font-bold">Lema:</span>
                    <input
                      type="text"
                      value={storeSettings.menuTagline !== undefined ? storeSettings.menuTagline : "El Más Crujiente"}
                      onChange={(e) => handleUpdateSetting("menuTagline", e.target.value)}
                      className="bg-transparent text-xs font-mono text-white focus:outline-none focus:border-primary border-b border-white/20 w-28 sm:w-36"
                      placeholder="El Más Crujiente"
                      title="Editar texto debajo de Nuestra Especialidad"
                    />
                  </div>
                ) : (
                  <span className="hidden sm:inline text-xs border-l border-white/10 pl-3 text-gray-400 font-mono">
                    {storeSettings.menuTagline !== undefined ? storeSettings.menuTagline : "El Más Crujiente"}
                  </span>
                )}
              </div>
              
              {/* Responsive Quick Cart icon trigger if items in cart */}
              {totalCartCount > 0 && (
                <button
                  id="float-cart-mobile"
                  onClick={() => setIsCartOpen(true)}
                  className="md:hidden flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-xl font-display font-black text-xs shadow-lg shadow-primary/20 animate-pulse cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{totalCartCount}</span>
                </button>
              )}
            </div>

            {/* Smart Search box layout */}
            <div className="relative flex-1 md:max-w-xs xl:max-w-md">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                id="menu-search-input"
                type="text"
                placeholder="Busca por plato, ingrediente o bebida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/35 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary transition-all font-sans"
              />
              {searchQuery && (
                <button
                  id="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tab Categories scroller */}
          <div className="flex items-center gap-2 overflow-x-auto mt-3 py-2 scrollbar-none snap-x touch-pan-x -mx-4 px-4">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleScrollToSection(cat.id)}
                  className={`relative snap-center px-4 py-2 rounded-xl text-xs md:text-sm font-display font-black tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "text-white shadow-md shadow-primary/25 translate-y-0"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryTab"
                      className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-lg shadow-primary/30"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Menu List Section */}
      <main id="menu" className="flex-1 max-w-7xl mx-auto px-4 py-8 md:px-8 space-y-16">
        
        {/* If searching and no results */}
        {searchQuery && categories.every(cat => filteredItems(cat.id).length === 0) && (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-gray-500 border border-white/5">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-display font-medium text-lg text-white">No encontramos ningún "crujido" similar</h4>
              <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
                No hay resultados para "{searchQuery}". Intenta con otros términos como chicharrón, tocino, mofongo o Presidente.
              </p>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="text-primary hover:text-primary-dark font-medium underline text-sm cursor-pointer"
            >
              Ver menú completo
            </button>
          </div>
        )}

        {/* Render Sections Dynamically */}
        {categories.map((cat) => {
          const items = filteredItems(cat.id);
          
          // In admin mode, we want to show category blocks even if they don't have items so administrators can add items to them!
          const showSection = items.length > 0 || (isAdminLogged && !isAdminPreviewMode);
          if (!showSection) return null;
          
          return (
            <motion.section
              id={cat.id}
              key={cat.id}
              ref={(el) => { sectionRefs.current[cat.id] = el; }}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
              className="scroll-mt-32 space-y-6 pt-4"
            >
              {/* Category Header */}
              <div className="border-b border-white/5 pb-4">
                {isAdminLogged && !isAdminPreviewMode ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={cat.name}
                        onChange={(e) => handleUpdateCategory(cat.id, { name: e.target.value })}
                        className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tight bg-black/45 border border-white/10 rounded-xl px-4 py-1.5 focus:outline-none focus:border-primary font-sans"
                        placeholder="Nombre de la Sección"
                      />
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 rounded-xl transition-all cursor-pointer"
                        title="Eliminar Sección"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={cat.tagline || ""}
                      onChange={(e) => handleUpdateCategory(cat.id, { tagline: e.target.value })}
                      className="text-xs text-gray-400 font-light italic bg-black/25 border border-white/5 rounded-lg px-3 py-1.5 w-full max-w-lg focus:outline-none focus:border-primary font-sans"
                      placeholder="Tagline opcional..."
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-3">
                      <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tight">
                        {cat.name}
                      </h2>
                      <span className="text-xs font-mono font-bold text-primary" style={{ color: "var(--color-primary)" }}>
                        ({items.length} {items.length === 1 ? "ítem" : "ítems"})
                      </span>
                    </div>
                    {cat.tagline && (
                      <p className="text-sm text-gray-400 mt-1 font-light italic">
                        {cat.tagline}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Special rendering for Bebidas divided internally */}
              {cat.id === "bebidas" ? (
                <div className="space-y-10">
                  {/* Category groups inside beverages */}
                  {["Bebidas sin alcohol", "Tragos de Autor y Licores", "Cervezas Extra Frías"].map((groupName) => {
                    const groupItems = groupName === "Bebidas sin alcohol" 
                      ? getBebidasByGroup(groupName).concat(menuItems.filter(i => i.subCategory === "bebidas" && (!i.description || i.description === "Bebidas sin alcohol" || i.description === "Descripción tradicional.")).filter(i => !["Tragos de Autor y Licores", "Cervezas Extra Frías"].includes(i.description || "")))
                      : getBebidasByGroup(groupName);

                    if (groupItems.length === 0 && !(isAdminLogged && !isAdminPreviewMode)) return null;

                    return (
                      <div key={groupName} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary" style={{ backgroundColor: "var(--color-primary)" }}></span>
                          <h3 className="font-display font-bold text-lg text-white/90">
                            {groupName}
                          </h3>
                        </div>
                        
                        <motion.div 
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35 }}
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                          {groupItems.map((item) => (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                              onAdd={handleAddToCart}
                              count={getCartItemCount(item.id)}
                              isAdminMode={isAdminLogged && !isAdminPreviewMode}
                              onUpdateItem={handleUpdateItem}
                              onDeleteItem={handleDeleteItem}
                            />
                          ))}
                        </motion.div>
                      </div>
                    );
                  })}
                  
                  {isAdminLogged && !isAdminPreviewMode && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => handleAddItem("bebidas")}
                        className="px-5 py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-2xl text-xs font-display font-black text-primary uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4 shrink-0" />
                        <span>Añadir Bebida o Trago</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Standard grid layout for entries, tajos, fuertes, coro, etc. */
                <div className="space-y-6">
                  {items.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-white/5 bg-white/5 rounded-2xl text-xs text-gray-500">
                      Esta sección se encuentra vacía. Agrega un plato ingresando abajo.
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {items.map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          onAdd={handleAddToCart}
                          count={getCartItemCount(item.id)}
                          isAdminMode={isAdminLogged && !isAdminPreviewMode}
                          onUpdateItem={handleUpdateItem}
                          onDeleteItem={handleDeleteItem}
                        />
                      ))}
                    </motion.div>
                  )}

                  {isAdminLogged && !isAdminPreviewMode && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => handleAddItem(cat.id)}
                        className="px-5 py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-2xl text-xs font-display font-black text-primary uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4 shrink-0" />
                        <span>Añadir Plato a {cat.name}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          );
        })}

        {/* Section Adder for Administrators */}
        {isAdminLogged && !isAdminPreviewMode && (
          <div className="text-center pt-6 pb-2 border-t border-white/5">
            <button
              onClick={handleAddCategory}
              className="px-6 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl text-xs font-display font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mx-auto transition-all cursor-pointer"
            >
              <PlusCircle className="w-4.5 h-4.5 shrink-0" />
              <span>Añadir Nueva Sección / Categoría 🌱</span>
            </button>
          </div>
        )}

        {/* Bank transfer Section */}
        <section id="pagos" className="pt-8">
          <BankDetails
            onNotify={showToast}
            isAdminMode={isAdminLogged && !isAdminPreviewMode}
            accountsData={bankAccounts}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
            onAddAccount={handleAddAccount}
            rncHeader={rncHeader}
            onUpdateRncHeader={handleUpdateRncHeader}
            paymentBadge={storeSettings.paymentBadge}
            paymentTitle={storeSettings.paymentTitle}
            paymentDescription={storeSettings.paymentDescription}
            onUpdateSectionText={handleUpdateSetting}
          />
        </section>
      </main>

      {/* Floating Save Reminder for Admin when changes are pending */}
      {hasUnsavedChanges && isAdminLogged && !isAdminPreviewMode && (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce">
          <button
            onClick={handleSaveAllChanges}
            className="px-4 py-3 bg-primary text-white rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-2xl shadow-primary/60 flex items-center gap-2 cursor-pointer border border-white/20 hover:scale-105 transition-transform"
            style={{ backgroundColor: "var(--color-primary, #E8005A)" }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <Save className="w-4 h-4" />
            <span>Guardar Cambios Pendientes</span>
          </button>
        </div>
      )}

      {/* Sticky Bottom Quick-Plate / Mini Cart trigger for desktop and mobile */}
      {totalCartCount > 0 && (
        <div id="sticky-bottom-cart" className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 max-w-lg w-[90%] font-sans animate-slideUp">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-primary text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-primary/40 transform transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] select-none cursor-pointer"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-xs block text-white/80 uppercase font-display font-black tracking-wider">
                  Ir a pagar
                </span>
                <span className="text-sm font-bold block leading-none">
                  {totalCartCount} {totalCartCount === 1 ? "Artículo" : "Artículos"} añadidos
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/25 px-4 py-2 rounded-xl text-sm font-mono font-black border border-white/5">
              <span>Subtotal:</span>
              <span className="text-white">RD$ {cartSubtotal.toLocaleString()}</span>
            </div>
          </button>
        </div>
      )}

      {/* Sticky Floating WhatsApp Help widget on bottom-right */}
      {totalCartCount === 0 && (
        <a
          id="whatsapp-floating-ball"
          href={`https://wa.me/${contactInfo.phone}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-40 bg-emerald-500 text-white p-4 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer shadow-emerald-500/20 group"
        >
          {/* Chat Bubble Help effect */}
          <span className="absolute right-14 bg-black/90 text-white border border-white/5 text-[10px] font-display font-bold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            ¡Dime de qué tienes deseos! 👋
          </span>
          <MessageCircle className="w-6 h-6 fill-white text-emerald-500" />
        </a>
      )}

      {/* Cart Drawer Component */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onUpdateNotes={handleUpdateNotes}
        whatsappPhone={contactInfo.phone}
        storeName={storeSettings.heroTitle}
        storeSubtitle={storeSettings.heroSubtitle}
      />

      {/* Brand Footer */}
      <footer className="bg-black/95 border-t border-white/5 pt-16 pb-8 px-4 md:px-8 text-center space-y-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Logo 
            size="lg" 
            title={storeSettings.heroTitle} 
            logoType={storeSettings.logoType} 
            logoValue={storeSettings.logoValue}
            titleDisplayType={storeSettings.titleDisplayType}
            titleImageUrl={storeSettings.titleImageUrl}
            titleImageWidth={storeSettings.titleImageWidth}
          />
          {isAdminLogged && !isAdminPreviewMode ? (
            <textarea
              rows={2}
              value={storeSettings.footerDescription}
              onChange={(e) => handleUpdateSetting("footerDescription", e.target.value)}
              className="max-w-md mx-auto text-sm text-gray-500 font-light bg-black/45 border border-white/10 rounded-xl p-3 w-full text-center focus:outline-none focus:border-primary font-sans block"
              placeholder="Descripción del pie de página"
            />
          ) : (
            <p className="max-w-md mx-auto text-sm text-gray-500 font-light leading-relaxed">
              {storeSettings.footerDescription}
            </p>
          )}

          <div className="flex items-center justify-center gap-6">
            <a
              href={`https://instagram.com/${contactInfo.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="w-11 h-11 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={`https://wa.me/${contactInfo.phone}`}
              target="_blank"
              rel="noreferrer"
              className="w-11 h-11 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
            >
              <Phone className="w-5 h-5 text-emerald-400" />
            </a>
          </div>
        </div>

        <div className="max-w-md mx-auto h-px bg-white/5"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto text-xs text-gray-600 font-mono">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            {isAdminLogged && !isAdminPreviewMode ? (
              <input
                type="text"
                value={storeSettings.footerCopyright}
                onChange={(e) => handleUpdateSetting("footerCopyright", e.target.value)}
                className="bg-black/45 border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-500 focus:outline-none focus:border-primary min-w-[280px]"
                placeholder="Derechos de autor"
              />
            ) : (
              <span>{storeSettings.footerCopyright}</span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {isAdminLogged && !isAdminPreviewMode ? (
              <input
                type="text"
                value={storeSettings.footerDisclaimer}
                onChange={(e) => handleUpdateSetting("footerDisclaimer", e.target.value)}
                className="bg-black/45 border border-white/10 rounded-lg px-2 py-1 text-xs text-red-500/80 font-bold uppercase focus:outline-none focus:border-primary w-48 text-center"
                placeholder="Impuestos no incluidos"
              />
            ) : (
              <span className="text-red-500/80 font-bold bg-red-500/5 border border-red-500/10 px-3 py-1 rounded-md uppercase tracking-wider text-[10px]">
                {storeSettings.footerDisclaimer}
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
