import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const orders = await db.order.findMany({
      include: {
        items: true,
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders from database' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const order = await db.order.create({
      data: {
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        status: data.status || 'pending',
        subtotal: data.subtotal,
        total: data.total,
        currency: data.currency || 'USD',
        deliveryType: data.deliveryType || 'digital',
        notes: data.notes,
        paymentId: data.paymentId,
        paymentStatus: data.paymentStatus || 'pending',
        items: {
          create: data.items || []
        }
      },
      include: {
        items: true,
        customer: true
      }
    });
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}