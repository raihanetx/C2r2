import { NextResponse } from 'next/server';
import { rupantorPayService } from '@/lib/rupantorpay';

export async function GET() {
  const config = rupantorPayService.getConfig();
  
  return NextResponse.json({
    message: 'RupantorPay payment configuration',
    configured: config.configured,
    provider: 'RupantorPay',
    merchantId: config.merchantId,
    isTest: config.isTest,
    baseUrl: config.baseUrl,
    features: {
      createPayment: true,
      verifyPayment: true,
      webhook: true
    },
    note: config.isTest ? 
      'RupantorPay is running in test mode. Payments will be simulated.' :
      'RupantorPay is configured for production use.'
  });
}