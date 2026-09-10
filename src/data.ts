import { MenuItem, MenuCategory } from "./types";
import storeConfig from "./store_config.json";

export const CATEGORIES: MenuCategory[] = (storeConfig?.categories as MenuCategory[]) || [
  { id: "cookies_rellenas", name: "Cookies Rellenas", tagline: "Hechas con amor, rellenas de felicidad y con el toque artesanal único" },
  { id: "combos_especiales", name: "Ofertas & Six Pack", tagline: "Lleva más, comparte más con nuestras promociones por tiempo limitado" }
];

export const MENU_ITEMS: MenuItem[] = (storeConfig?.menuItems as MenuItem[]) || [
  {
    id: "cookie_chocolate",
    name: "Cookie Chocolate",
    description: "Rellena de cremoso chocolate derretido con masa artesanal crujiente por fuera y suave por dentro.",
    price: 200,
    popular: true,
    subCategory: "cookies_rellenas"
  },
  {
    id: "cookie_dulce_de_leche",
    name: "Cookie Dulce de Leche",
    description: "Rellena de irresistible dulce de leche cremoso y tradicional que explota en cada bocado.",
    price: 200,
    popular: true,
    subCategory: "cookies_rellenas"
  },
  {
    id: "cookie_pistacho",
    name: "Cookie Pistacho",
    description: "Rellena de suave crema de pistacho puro con un equilibrio perfecto de dulzura.",
    price: 200,
    popular: true,
    subCategory: "cookies_rellenas"
  },
  {
    id: "cookie_coco",
    name: "Cookie Coco",
    description: "Rellena de deliciosa crema de coco artesanal con notas tropicales exquisitas.",
    price: 200,
    subCategory: "cookies_rellenas"
  },
  {
    id: "cookie_red_velvet",
    name: "Cookie Red Velvet",
    description: "Masa aterciopelada red velvet rellena de suave y cremoso queso crema.",
    price: 200,
    popular: true,
    subCategory: "cookies_rellenas"
  },
  {
    id: "cookie_cheese_cream_guayaba",
    name: "Cookie Cheese Cream & Guayaba",
    description: "¡NUEVO! Rellena de suave queso crema y dulce guayaba dominicana en perfecta armonía.",
    price: 200,
    popular: true,
    subCategory: "cookies_rellenas"
  },
  {
    id: "six_pack_cookies",
    name: "Six Pack de Cookies (6 Cookies)",
    description: "OFERTA DE APERTURA: 6 deliciosas cookies rellenas surtidas a tu gusto en caja especial de regalo. Ideal para compartir o darte un gusto completo.",
    price: 1100,
    popular: true,
    unit: "Caja 6 und",
    subCategory: "combos_especiales"
  }
];

export const BANK_ACCOUNTS = storeConfig?.bankAccounts || [
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

export const RNC_HEADER = storeConfig?.rncHeader || "RNC: 133-41038-9";

export const CONTACT_INFO = storeConfig?.contactInfo || {
  phone: "18498140019",
  instagram: "Liacookies70"
};

export const STORE_SETTINGS = storeConfig?.storeSettings || {
  heroTitle: "Lia Cookies",
  heroSubtitle: "Dulce Experiencia de Sabores",
  heroDescription: "Hechas con amor, rellenas de Felicidad. Todas nuestras cookies vienen rellenas con ingredientes de alta calidad para brindarte el mejor sabor en cada mordida.",
  heroButton1Text: "Ver Menú Dulce",
  heroButton2Text: "Pedir por WhatsApp",
  titleDisplayType: "text",
  titleImageUrl: "",
  titleImageWidth: 320,
  specialtyBadge: "Oferta de Apertura",
  showSpecialtySection: true,
  specialtyTitle: "Nuestra Estrella:",
  specialtyTitleHighlight: "Six Pack de Cookies",
  specialtyDescription: "Caja especial con 6 exquisitas cookies rellenas a tu elección: Chocolate cremoso, Dulce de Leche, Pistacho, Coco, Red Velvet y Cheese Cream con Guayaba. Hechas con ingredientes de primera calidad para una explosión de sabor inigualable.",
  specialtyPriceLabel: "Oferta Especial",
  specialtyPriceValue: "RD$ 1,100",
  specialtyFlavorLabel: "Sabor",
  specialtyFlavorValue: "100% Hechas con Amor 💖",
  specialtyButtonText: "Pedir Six Pack",
  specialtyImage: "/src/assets/images/lia_six_pack_box_1788791837137.jpg",
  specialtyPhotoBadge: "Lleva más, comparte más",
  specialtyPhotoCaption: "Six Pack de Cookies surtidas recién horneadas",
  paymentBadge: "Soporte de pagos",
  paymentTitle: "Información de Transferencia",
  paymentDescription: "Pide en línea y transfiere de manera fácil. Copia los datos con un solo toque y envía tu captura por WhatsApp.",
  footerDescription: "Hechas con amor, rellenas de Felicidad. Una dulce experiencia de sabores para endulzar tus momentos especiales. ¡Gracias por ser parte de nuestro inicio!",
  footerCopyright: "© 2026 Lia Cookies. Todos los derechos reservados.",
  footerDisclaimer: "IMPUESTOS NO INCLUIDOS",
  activeStatusLabel: "Horneando con amor 🍪💖",
  primaryColor: "#8A1C9E",
  primaryDarkColor: "#5A0C6B",
  accentColor: "#FF2A85",
  backgroundColor: "#14031E",
  cardColor: "#230A33",
  logoType: "emoji",
  logoValue: "🍪",
  tabTitle: "Lia Cookies | Dulce Experiencia de Sabores",
  menuTagline: "Dulce Experiencia de Sabores",
  backgroundType: "image",
  backgroundImageUrl: "/src/assets/images/lia_cookies_hero_1788791816585.jpg",
  backgroundSolidColor: "#14031E",
  backgroundGradientPreset: "morado_noir",
  backgroundGradientColor1: "#320645",
  backgroundGradientColor2: "#14031E",
  backgroundGradientDirection: "to bottom"
};

export const ADMIN_PASSWORD_HASH = storeConfig?.adminPasswordHash || "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
