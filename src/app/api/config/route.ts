import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get the first config record or create default if not exists
    let config = await db.siteConfig.findFirst();
    
    if (!config) {
      // Create default config if none exists
      config = await db.siteConfig.create({
        data: {
          heroBanner: [],
          favicon: "",
          contactPhone: "+880 1234-567890",
          contactWhatsapp: "+880 1234-567890",
          contactEmail: "info@submonth.com",
          adminPassword: "password123",
          usdToBdtRate: 110,
          siteLogo: "",
          heroSliderInterval: 5000,
          hotDealsSpeed: 40
        }
      });
    }
    
    // Return in the expected format
    const configData = {
      hero_banner: config.heroBanner,
      favicon: config.favicon,
      contact_info: {
        phone: config.contactPhone,
        whatsapp: config.contactWhatsapp,
        email: config.contactEmail
      },
      admin_password: config.adminPassword,
      usd_to_bdt_rate: config.usdToBdtRate,
      site_logo: config.siteLogo,
      hero_slider_interval: config.heroSliderInterval,
      hot_deals_speed: config.hotDealsSpeed
    };
    
    return NextResponse.json(configData);
  } catch (error) {
    console.error('Error fetching config from PostgreSQL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch config from database' },
      { status: 500 }
    );
  }
}