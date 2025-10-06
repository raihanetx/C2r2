import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const product = await db.product.create({
      data: {
        name: data.name,
        description: data.description,
        longDescription: data.long_description,
        image: data.image,
        category: data.category,
        categorySlug: data.category_slug,
        slug: data.slug,
        pricing: data.pricing,
        stockOut: data.stock_out || false,
        status: data.status || "active",
        featured: data.featured || false
      }
    });
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}