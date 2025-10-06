import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let products = await db.product.findMany({
      where: {
        status: 'active' // Only show active products to frontend users
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (category) {
      products = products.filter(p => p.categorySlug === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
      );
    }
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products from PostgreSQL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products from database' },
      { status: 500 }
    );
  }
}