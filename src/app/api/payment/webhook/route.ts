import { NextRequest, NextResponse } from 'next/server';
import { rupantorPayService } from '@/lib/rupantorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log webhook data for debugging
    console.log('RupantorPay webhook received:', body);
    
    // Extract payment information from webhook
    const { 
      transaction_id, 
      status, 
      order_id, 
      amount, 
      currency,
      payment_method,
      customer_name,
      customer_email,
      customer_phone
    } = body;

    if (!transaction_id || !status) {
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    // Update order status based on payment status
    if (order_id && status === 'COMPLETED') {
      try {
        // Load existing orders
        const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        
        // Find and update the order
        const orderIndex = existingOrders.findIndex((order: any) => order.id === order_id);
        if (orderIndex !== -1) {
          existingOrders[orderIndex].status = 'completed';
          existingOrders[orderIndex].paymentStatus = 'completed';
          existingOrders[orderIndex].paymentMethod = payment_method || 'RupantorPay';
          existingOrders[orderIndex].paidAmount = amount;
          existingOrders[orderIndex].completedAt = new Date().toISOString();
          
          // Save updated orders
          localStorage.setItem('orderHistory', JSON.stringify(existingOrders));
          
          console.log(`Order ${order_id} marked as completed via webhook`);
        }
      } catch (orderError) {
        console.error('Error updating order from webhook:', orderError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      transaction_id,
      status
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const config = rupantorPayService.getConfig();
  return NextResponse.json({
    message: 'RupantorPay payment webhook endpoint',
    configured: config.configured,
    merchantId: config.merchantId,
    isTest: config.isTest,
    note: 'This webhook handles payment status updates from RupantorPay'
  });
}