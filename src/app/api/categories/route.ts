import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: {
        status: 'active' // Only show active categories
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });
    
    return NextResponse.json({
      categories: categories,
      total: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories from PostgreSQL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories from database' },
      { status: 500 }
    );
  }
}