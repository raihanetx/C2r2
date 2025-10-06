import { NextRequest, NextResponse } from 'next/server';
import { rupantorPayService } from '@/lib/rupantorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Verify payment with RupantorPay
    const verification = await rupantorPayService.verifyPayment(transaction_id);

    if (verification) {
      // Format response to match expected structure
      const paymentData = {
        status: verification.status,
        fullname: verification.fullname,
        email: verification.email,
        amount: verification.amount,
        transaction_id: verification.transaction_id,
        trx_id: verification.trx_id,
        currency: verification.currency,
        payment_method: verification.payment_method,
        meta_data: {
          ...verification.metadata,
          timestamp: new Date().toISOString()
        }
      };

      return NextResponse.json({
        success: true,
        data: paymentData,
        message: 'Payment verified successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const config = rupantorPayService.getConfig();
  return NextResponse.json({
    message: 'RupantorPay payment verification endpoint',
    configured: config.configured,
    merchantId: config.merchantId,
    isTest: config.isTest,
    usage: {
      method: 'POST',
      body: {
        transaction_id: 'string'
      }
    }
  });
}