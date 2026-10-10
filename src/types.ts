export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  popular?: boolean;
  unit?: string; // e.g. "lb", "3 und", etc.
  subCategory?: string; // For Bebidas: "Bebidas sin alcohol", "Tragos", "Cervezas"
  image?: string; // Optional custom/Base64 image path or URL
}

export interface MenuCategory {
  id: string;
  name: string;
  tagline?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export interface StoreSettings {
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  heroButton1Text?: string;
  heroButton2Text?: string;
  titleDisplayType?: "text" | "image";
  titleImageUrl?: string;
  titleImageWidth?: number;
  specialtyBadge?: string;
  showSpecialtySection?: boolean;
  specialtyTitle?: string;
  specialtyTitleHighlight?: string;
  specialtyDescription?: string;
  specialtyPriceLabel?: string;
  specialtyPriceValue?: string;
  specialtyFlavorLabel?: string;
  specialtyFlavorValue?: string;
  specialtyButtonText?: string;
  specialtyImage?: string;
  specialtyPhotoBadge?: string;
  specialtyPhotoCaption?: string;
  paymentBadge?: string;
  paymentTitle?: string;
  paymentDescription?: string;
  footerDescription?: string;
  footerCopyright?: string;
  footerDisclaimer?: string;
  activeStatusLabel?: string;
  primaryColor?: string;
  primaryDarkColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  cardColor?: string;
  logoType?: string;
  logoValue?: string;
  tabTitle?: string;
  menuTagline?: string;
  backgroundType?: "image" | "solid" | "gradient";
  backgroundImageUrl?: string;
  backgroundSolidColor?: string;
  backgroundGradientPreset?: string;
  backgroundGradientColor1?: string;
  backgroundGradientColor2?: string;
  backgroundGradientDirection?: string;
  instagramMode?: boolean;
  instagramDmUrl?: string;
  instagramHandle?: string;
}

export interface ContactInfo {
  phone: string;
  instagram: string;
}

