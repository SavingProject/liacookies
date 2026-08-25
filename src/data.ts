import { MenuItem, MenuCategory } from "./types";
import storeConfig from "./store_config.json";

export const CATEGORIES: MenuCategory[] = (storeConfig?.categories as MenuCategory[]) || [
  { id: "entradas", name: "Entrando Crujiente", tagline: "Entradas caribeñas y bien crujientes para empezar el mambo" },
  { id: "tajos", name: "Los Tajo's Solos", tagline: "Los mejores cortes sazonados por 24 hrs y fritos a la perfección" },
  { id: "fuertes", name: "Pa' los Fuertes", tagline: "Platos contundentes para quedar con la barriga llena y el corazón contento" },
  { id: "coro", name: "Pa' los del Coro", tagline: "Combos grandes e ideales para compartir con los panas" },
  { id: "panes", name: "Los Panes del Puerco", tagline: "Sándwiches y panes con todo el sabor urbano de Monte Pork" },
  { id: "guarniciones", name: "Guarniciones", tagline: "Los acompañamientos perfectos para armar tu plato" },
  { id: "bebidas", name: "Bebidas", tagline: "Refrescos fríos, tragos de autor y las cervezas más frías de la región" }
];

export const MENU_ITEMS: MenuItem[] = (storeConfig?.menuItems as MenuItem[]) || [
  // 1. ENTRADAS
  {
    id: "papa_suprema",
    name: "Papa Suprema (Puerco Supremo)",
    description: "Papas fritas cubiertas con mezcla irresistible de queso fundido, salsa Montepork y topping de chicharrón.",
    price: 300,
    subCategory: "entradas"
  },
  {
    id: "catibias_chicharron",
    name: "Catibias de Chicharrón",
    description: "Empanadas de yuca monteplatense con picadillo de chicharrón, topping de guacamole o salsa pork y cebolla encurtida. 3 und.",
    price: 250,
    unit: "3 und",
    subCategory: "entradas"
  },
  {
    id: "los_carnales",
    name: "Los Carnales",
    description: "Tortilla de tacos rellena de chicharrón, queso y encurtidos. 3 und.",
    price: 350,
    unit: "3 und",
    subCategory: "entradas"
  },
  {
    id: "deditos_queso",
    name: "Deditos de Queso",
    description: "Deditos de queso mozzarella empanizados mas Salsa MONTEPORK.",
    price: 250,
    subCategory: "entradas"
  },
  {
    id: "el_ceviche",
    name: "El Ceviche",
    description: "Ceviche de chicharrón crujiente o longaniza, macerado en cítricos y vegetales. Frescor y crujido dominicano.",
    price: 400,
    popular: true,
    subCategory: "entradas"
  },
  {
    id: "las_conchitas",
    name: "Las Conchitas",
    description: "Canastas de plátano verde rellenas de chicharrón crujiente macerado en cítrico, topping de guacamole y cebolla. 3 und.",
    price: 350,
    unit: "3 und",
    subCategory: "entradas"
  },

  // 2. TAJO'S SOLOS
  {
    id: "chicharron_solo",
    name: "Chicharrón solo",
    description: "Chicharrón macerado en cítricos por 24 hrs, frito al momento y servido con su viagra (limón y cebollita). por libra",
    price: 600,
    unit: "lb",
    subCategory: "tajos"
  },
  {
    id: "longaniza_criolla",
    name: "Longaniza Criolla",
    description: "Longaniza artesanal monteplatense con un toque sazonado delicioso, por libra.",
    price: 450,
    unit: "lb",
    subCategory: "tajos"
  },
  {
    id: "tocino_solo",
    name: "Tocino artesanal",
    description: "Tocino artesanal macerado en cítricos por 24 hrs, por libra con ese sabor ahumado y crujiente único.",
    price: 450,
    unit: "lb",
    subCategory: "tajos"
  },

  // 3. PA' LOS FUERTES
  {
    id: "mofongo_mp",
    name: "Mofongo Mp",
    description: "Mofongo de plátano/guineíto/yuca con ajo confitado y chicharrón, acompañado de chicharrón/longaniza/tocino y topping de queso fundido.",
    price: 400,
    subCategory: "fuertes"
  },
  {
    id: "la_canoa",
    name: "La Canoa",
    description: "Canoa de plátano verde dulce, frito y relleno de abundante chicharrón y longaniza artesanal encebollada.",
    price: 500,
    subCategory: "fuertes"
  },
  {
    id: "la_picalonga",
    name: "La Picalonga",
    description: "Longaniza artesanal, chicharrón, tocino, acompañado de yuca hervida con nuestro mojito especial de la casa, tostones crujientes al ajillo y guacamole fresco.",
    price: 1200,
    popular: true,
    subCategory: "fuertes"
  },
  {
    id: "alitas_fritas",
    name: "Alitas Fritas",
    description: "Cinco alitas crujientes por fuera, jugosas por dentro, sazonadas con nuestro toque único. Servidas con salsa a tu preferencia y guarnición.",
    price: 350,
    subCategory: "fuertes"
  },
  {
    id: "pechuga_plancha",
    name: "Pechuga a la Plancha",
    description: "Pechuga de pollo súper jugosa, marinada en finas hierbas dominicanas y cocinada a la plancha. Incluye guarnición a elegir.",
    price: 400,
    subCategory: "fuertes"
  },

  // 4. PA' LOS DEL CORO
  {
    id: "combo_corito",
    name: "Corito",
    description: "1lb chicharrón + 1lb longaniza + 1lb tocino + 3 guarniciones a tu elección. Ideal para 2-3 panas.",
    price: 1800,
    unit: "Para compartir",
    subCategory: "coro"
  },
  {
    id: "combo_chacho",
    name: "Chacho",
    description: "2lb chicharrón + 1lb longaniza + 1lb tocino + 3 guarniciones a tu elección. Ideal para 4 panas hambrientos.",
    price: 2300,
    unit: "Para compartir",
    subCategory: "coro"
  },
  {
    id: "combo_se_armo",
    name: "Se Armó",
    description: "El combo definitivo: 2lb chicharrón + 2lb longaniza + 2lb tocino + guacamole fresco abundante + 5 guarniciones a tu elección.",
    price: 3600,
    popular: true,
    unit: "Para compartir",
    subCategory: "coro"
  },

  // 5. LOS PANES DEL PUERCO
  {
    id: "pan_pierna",
    name: "El de Pierna",
    description: "Sándwich de pierna crujiente, ensalada de repollo en conserva en su punto, tomate fresco, pepinillos, cebolla, puerro y salsa tropical trufada.",
    price: 450,
    subCategory: "panes"
  },
  {
    id: "pan_barraca",
    name: "La Barraca",
    description: "Pan brioche tostado con mantequilla, jugosa carne de cerdo de 6oz, tocino ahumado caramelizado, pepinillos, tomate, cebolla morada y salsa pork insignia.",
    price: 450,
    subCategory: "panes"
  },
  {
    id: "hot_dog_pork",
    name: "Hot Dog (Perro Pork)",
    description: "Pan suave artesanal con salchicha premium de cerdo, acompañado de salsas tradicionales con el inconfundible toque MontePork.",
    price: 200,
    subCategory: "panes"
  },

  // 6. GUARNICIONES
  { id: "g_yuca_mojo", name: "Yuca / Guineo en Mojo", price: 100, subCategory: "guarniciones" },
  { id: "g_yuca_frita", name: "Yuca Frita", price: 100, subCategory: "guarniciones" },
  { id: "g_tostones", name: "Tostones crujientes", price: 100, subCategory: "guarniciones" },
  { id: "g_papas_fritas", name: "Papas Fritas sazonadas", price: 100, subCategory: "guarniciones" },
  { id: "g_casabe", name: "Casabe tostado en ajo", price: 100, subCategory: "guarniciones" },
  { id: "g_batata", name: "Batata Frita crujiente", price: 100, subCategory: "guarniciones" },

  // 7. BEBIDAS (with subCategory indicating the type)
  { id: "b_agua", name: "Agua purificada", price: 25, subCategory: "bebidas", description: "Bebidas sin alcohol" },
  { id: "b_refresco", name: "Refresco", price: 60, subCategory: "bebidas", description: "Bebidas sin alcohol" },
  { id: "b_jugos", name: "Jugos Naturales", price: 100, subCategory: "bebidas", description: "Bebidas sin alcohol" },
  { id: "b_soda_amarga", name: "Soda Amarga", price: 60, subCategory: "bebidas", description: "Bebidas sin alcohol" },
  { id: "b_tonica", name: "Tónica", price: 60, subCategory: "bebidas", description: "Bebidas sin alcohol" },
  { id: "b_zumo_limon", name: "Zumo de Limón natural", price: 100, subCategory: "bebidas", description: "Bebidas sin alcohol" },

  // Tragos
  { id: "t_whisky", name: "Whisky 12 Años", price: 350, subCategory: "bebidas", description: "Tragos de Autor y Licores" },
  { id: "t_brugal_doble", name: "Brugal Doble Reserva", price: 250, subCategory: "bebidas", description: "Tragos de Autor y Licores" },
  { id: "t_brugal_extraviejo", name: "Brugal Extra Viejo", price: 200, subCategory: "bebidas", description: "Tragos de Autor y Licores" },
  { id: "t_vodka", name: "Vodka Premium", price: 300, subCategory: "bebidas", description: "Tragos de Autor y Licores" },
  { id: "t_ginebra", name: "Ginebra", price: 300, subCategory: "bebidas", description: "Tragos de Autor y Licores" },
  { id: "t_tequila", name: "Tequila Gold/Silver", price: 400, subCategory: "bebidas", description: "Tragos de Autor y Licores" },
  { id: "t_margarita", name: "Margarita Clásica", price: 350, subCategory: "bebidas", description: "Tragos de Autor y Licores" },
  { id: "t_aperol", name: "Aperol Spritz", price: 400, subCategory: "bebidas", description: "Tragos de Autor y Licores" },
  { id: "t_rosa_pork", name: "Rosa Pork (Trago de la Casa)", price: 400, subCategory: "bebidas", description: "Tragos de Autor y Licores", popular: true },

  // Cervezas
  { id: "c_presidente_light", name: "Presidente Light", price: 150, subCategory: "bebidas", description: "Cervezas Extra Frías" },
  { id: "c_presidente_dura", name: "Presidente Dura", price: 150, subCategory: "bebidas", description: "Cervezas Extra Frías" },
  { id: "c_corona", name: "Corona Extra", price: 200, subCategory: "bebidas", description: "Cervezas Extra Frías" },
  { id: "c_original_five", name: "5,0 Original", price: 250, subCategory: "bebidas", description: "Cervezas Extra Frías" },
  { id: "c_brahma", name: "Brahma Light", price: 130, subCategory: "bebidas", description: "Cervezas Extra Frías" },
  { id: "c_stella", name: "Stella Artois", price: 200, subCategory: "bebidas", description: "Cervezas Extra Frías" },
  { id: "c_modelo", name: "Modelo Especial", price: 200, subCategory: "bebidas", description: "Cervezas Extra Frías" },
  { id: "c_coors", name: "Coors Light", price: 200, subCategory: "bebidas", description: "Cervezas Extra Frías" },
  { id: "c_galicia", name: "Estrella Galicia", price: 180, subCategory: "bebidas", description: "Cervezas Extra Frías" },
  { id: "c_heineken", name: "Heineken", price: 200, subCategory: "bebidas", description: "Cervezas Extra Frías" }
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
  instagram: "monteporkrd"
};

export const STORE_SETTINGS = storeConfig?.storeSettings || {
  heroTitle: "MONTE PORK",
  heroSubtitle: "El Más Crujiente de la Región",
  heroDescription: "Chicharrón de verdad, macerado por 24 horas y explotado al momento. Mofongos, combos del coro y las cervezas más frías de la comarca.",
  heroButton1Text: "Ver Menú",
  heroButton2Text: "Escríbenos",
  titleDisplayType: "text",
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
  footerDisclaimer: "",
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
  backgroundType: "image",
  backgroundImageUrl: "",
  backgroundSolidColor: "#0A0A0B",
  backgroundGradientPreset: "fucsia_noir",
  backgroundGradientColor1: "#2B0017",
  backgroundGradientColor2: "#0A0A0B",
  backgroundGradientDirection: "to bottom"
};

export const ADMIN_PASSWORD_HASH = storeConfig?.adminPasswordHash || "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
