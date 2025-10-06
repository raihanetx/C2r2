import { Product, Category, SiteConfig, HotDeal } from '@/types';

export const mockCategories: Category[] = [
  { name: 'Design Tools', slug: 'design-tools', icon: 'fas fa-palette' },
  { name: 'Productivity', slug: 'productivity', icon: 'fas fa-tasks' },
  { name: 'Development', slug: 'development', icon: 'fas fa-code' },
  { name: 'Marketing', slug: 'marketing', icon: 'fas fa-bullhorn' },
  { name: 'Education', slug: 'education', icon: 'fas fa-graduation-cap' }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Canva Pro',
    description: 'Professional design tool with premium templates',
    long_description: 'Canva Pro is a premium design tool that offers advanced features like brand kits, background remover, premium templates, and more. Perfect for professionals and businesses.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    category: 'Design Tools',
    category_slug: 'design-tools',
    slug: 'canva-pro',
    pricing: [
      { duration: '1 Month', price: 5 },
      { duration: '3 Months', price: 12 },
      { duration: '6 Months', price: 20 },
      { duration: '1 Year', price: 35 }
    ]
  },
  {
    id: '2',
    name: 'ChatGPT Plus',
    description: 'Advanced AI assistant with GPT-4',
    long_description: 'ChatGPT Plus gives you access to GPT-4, faster response times, and access to new features. Perfect for professionals, students, and anyone who needs advanced AI assistance.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    category: 'Productivity',
    category_slug: 'productivity',
    slug: 'chatgpt-plus',
    pricing: [
      { duration: '1 Month', price: 20 },
      { duration: '3 Months', price: 55 },
      { duration: '6 Months', price: 100 },
      { duration: '1 Year', price: 180 }
    ]
  },
  {
    id: '3',
    name: 'Figma Pro',
    description: 'Collaborative design interface tool',
    long_description: 'Figma Pro is a powerful design tool that allows teams to collaborate in real-time. Features include advanced prototyping, version history, and team libraries.',
    image: 'https://images.unsplash.com/photo-1563087340-9bb9e5d81a95?w=400&h=300&fit=crop',
    category: 'Design Tools',
    category_slug: 'design-tools',
    slug: 'figma-pro',
    pricing: [
      { duration: '1 Month', price: 12 },
      { duration: '3 Months', price: 30 },
      { duration: '6 Months', price: 55 },
      { duration: '1 Year', price: 100 }
    ]
  },
  {
    id: '4',
    name: 'Adobe Creative Cloud',
    description: 'Complete suite of creative tools',
    long_description: 'Adobe Creative Cloud gives you access to all Adobe creative apps like Photoshop, Illustrator, Premiere Pro, and more. Perfect for designers, video editors, and creative professionals.',
    image: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=400&h=300&fit=crop',
    category: 'Design Tools',
    category_slug: 'design-tools',
    slug: 'adobe-creative-cloud',
    pricing: [
      { duration: '1 Month', price: 20 },
      { duration: '3 Months', price: 55 },
      { duration: '6 Months', price: 100 },
      { duration: '1 Year', price: 180 }
    ]
  },
  {
    id: '5',
    name: 'GitHub Pro',
    description: 'Advanced version control and collaboration',
    long_description: 'GitHub Pro offers advanced features like private repositories with unlimited collaborators, advanced code review tools, and more. Perfect for developers and teams.',
    image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=300&fit=crop',
    category: 'Development',
    category_slug: 'development',
    slug: 'github-pro',
    pricing: [
      { duration: '1 Month', price: 4 },
      { duration: '3 Months', price: 10 },
      { duration: '6 Months', price: 18 },
      { duration: '1 Year', price: 30 }
    ]
  },
  {
    id: '6',
    name: 'Notion Plus',
    description: 'All-in-one workspace for notes and tasks',
    long_description: 'Notion Plus is an all-in-one workspace where you can write, plan, collaborate, and organize. Features include unlimited file uploads, version history, and advanced permissions.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    category: 'Productivity',
    category_slug: 'productivity',
    slug: 'notion-plus',
    pricing: [
      { duration: '1 Month', price: 8 },
      { duration: '3 Months', price: 20 },
      { duration: '6 Months', price: 35 },
      { duration: '1 Year', price: 60 }
    ]
  }
];

export const mockHotDeals: HotDeal[] = [
  { productId: '1', customTitle: 'Canva Pro - 50% Off' },
  { productId: '2' },
  { productId: '3' },
  { productId: '4', customTitle: 'Adobe CC - Special Deal' }
];

export const mockSiteConfig: SiteConfig = {
  hero_banner: [],
  favicon: '',
  contact_info: {
    phone: '+880 1234-567890',
    whatsapp: '+880 1234-567890',
    email: 'info@submonth.com'
  },
  admin_password: 'password123',
  usd_to_bdt_rate: 110,
  site_logo: '',
  hero_slider_interval: 5000,
  hot_deals_speed: 40
};