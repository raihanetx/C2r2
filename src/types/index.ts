export interface Product {
  id: string;
  name: string;
  description: string;
  long_description?: string;
  image: string;
  category: string;
  category_slug: string;
  slug: string;
  pricing: Pricing[];
  stock_out?: boolean;
}

export interface Pricing {
  duration: string;
  price: number;
}

export interface Category {
  name: string;
  slug: string;
  icon: string;
}

export interface SiteConfig {
  hero_banner: string[];
  favicon: string;
  contact_info: {
    phone: string;
    whatsapp: string;
    email: string;
  };
  admin_password: string;
  usd_to_bdt_rate: number;
  site_logo: string;
  hero_slider_interval: number;
  hot_deals_speed: number;
}

export interface HotDeal {
  productId: string;
  customTitle?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Modal {
  visible: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}