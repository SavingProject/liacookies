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
