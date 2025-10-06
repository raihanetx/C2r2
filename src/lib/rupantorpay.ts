import { createHmac } from 'crypto';

interface RupantorPayConfig {
  apiKey: string;
  baseUrl: string;
  isTest: boolean;
}

interface PaymentRequest {
  fullname: string;
  email: string;
  amount: string;
  success_url: string;
  cancel_url: string;
  webhook_url?: string;
  metadata?: Record<string, any>;
  client?: string;
}

interface PaymentResponse {
  status: boolean;
  message: string;
  payment_url?: string;
  error?: string;
}

interface PaymentVerification {
  fullname: string;
  email: string;
  amount: string;
  transaction_id: string;
  trx_id: string;
  currency: string;
  metadata: Record<string, any>;
  payment_method: string;
  status: string;
}

class RupantorPayService {
  private config: RupantorPayConfig;

  constructor() {
    this.config = {
      apiKey: process.env.RUPANTORPAY_API_KEY || 'test_api_key_123',
      baseUrl: process.env.RUPANTORPAY_BASE_URL || 'https://payment.rupantorpay.com',
      isTest: process.env.NODE_ENV !== 'production'
    };
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Prepare payment data according to RupantorPay documentation
      const paymentData = {
        fullname: request.fullname,
        email: request.email,
        amount: request.amount,
        success_url: request.success_url,
        cancel_url: request.cancel_url,
        webhook_url: request.webhook_url,
        metadata: request.metadata || {}
      };

      console.log('RupantorPay - Creating payment with data:', paymentData);

      // Make API call to RupantorPay
      const response = await fetch(`${this.config.baseUrl}/api/payment/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.config.apiKey,
          'X-CLIENT': request.client || 'localhost'
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      console.log('RupantorPay - API Response:', result);

      if (result.status === true && result.payment_url) {
        return {
          status: true,
          message: result.message || 'Payment URL created successfully',
          payment_url: result.payment_url
        };
      } else {
        return {
          status: false,
          error: result.message || 'Failed to create payment',
          message: result.message
        };
      }

    } catch (error) {
      console.error('RupantorPay payment creation error:', error);
      
      // For development/testing without real API key, show appropriate message
      if (this.config.isTest || this.config.apiKey === 'test_api_key_123') {
        return {
          status: false,
          error: 'RupantorPay API key not configured',
          message: 'Please configure RUPANTORPAY_API_KEY in your environment variables to use real payments. Currently in test mode.'
        };
      }

      return {
        status: false,
        error: 'Payment service unavailable',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerification | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/payment/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.config.apiKey
        },
        body: JSON.stringify({
          transaction_id: transactionId
        })
      });

      const result = await response.json();

      console.log('RupantorPay - Verification Response:', result);

      if (result.status && result.transaction_id) {
        return {
          fullname: result.fullname,
          email: result.email,
          amount: result.amount,
          transaction_id: result.transaction_id,
          trx_id: result.trx_id,
          currency: result.currency,
          metadata: result.metadata || {},
          payment_method: result.payment_method,
          status: result.status
        };
      }

      return null;

    } catch (error) {
      console.error('RupantorPay payment verification error:', error);
      return null;
    }
  }

  getConfig() {
    return {
      configured: !!(this.config.apiKey && this.config.apiKey !== 'test_api_key_123'),
      apiKey: this.config.apiKey,
      isTest: this.config.isTest,
      baseUrl: this.config.baseUrl
    };
  }
}

export const rupantorPayService = new RupantorPayService();
export default rupantorPayService;