# RupantorPay Payment Gateway Setup

This application now supports RupantorPay payment gateway for processing digital product payments according to the official RupantorPay API documentation.

## Quick Start

The application is currently running in **test mode** but will attempt to connect to the real RupantorPay API. To use real payments, you need to configure your API key.

## Production Setup

To use RupantorPay in production:

### 1. Get RupantorPay Account

1. Sign up at [RupantorPay](https://rupantorpay.com)
2. Get your **API Key** from the **Brands section** of your dashboard
3. Configure your website URL in the RupantorPay dashboard

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your RupantorPay API key:
   ```env
   RUPANTORPAY_API_KEY=your_actual_api_key_from_brands_section
   RUPANTORPAY_BASE_URL=https://payment.rupantorpay.com
   NEXT_PUBLIC_BASE_URL=https://yourwebsite.com
   NODE_ENV=production
   ```

### 3. Restart the Application

```bash
npm run dev
```

## Payment Flow (According to RupantorPay Documentation)

1. Customer adds products to cart
2. Customer proceeds to checkout and fills information
3. Customer clicks "Complete Payment with RupantorPay"
4. System creates payment via RupantorPay API: `/api/payment/checkout`
5. Customer is redirected to `https://payment.rupantorpay.com/api/execute/{payment_id}`
6. Customer completes payment on RupantorPay portal
7. RupantorPay redirects back to your success/cancel URL with parameters:
   - `transactionID`
   - `paymentMethod`
   - `paymentAmount`
   - `paymentFee`
   - `currency`
   - `status`
8. Webhook updates order status to "completed"

## API Endpoints (RupantorPay Official)

### Create Payment
- **URL**: `https://payment.rupantorpay.com/api/payment/checkout`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `X-API-KEY: your_api_key`
  - `X-CLIENT: your_domain`
- **Body**:
  ```json
  {
    "fullname": "John Doe",
    "email": "john@example.com",
    "amount": "10",
    "success_url": "https://yourdomain.com/success",
    "cancel_url": "https://yourdomain.com/cancel",
    "webhook_url": "https://yourdomain.com/webhook",
    "metadata": {
      "order_id": "12345"
    }
  }
  ```

### Verify Payment
- **URL**: `https://payment.rupantorpay.com/api/payment/verify-payment`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `X-API-KEY: your_api_key`
- **Body**:
  ```json
  {
    "transaction_id": "ABCDEFH"
  }
  ```

## Current Behavior

### Without API Key (Test Mode)
- System will attempt to connect to RupantorPay API
- Will show error: "Brand not found" or "Invalid API Request"
- Payment creation will fail with appropriate error message
- Customer will see error explaining API key is needed

### With API Key (Production Mode)
- Real payment flow will work
- Customer will be redirected to actual RupantorPay payment page
- Payment will be processed through RupantorPay's secure system
- Order will be completed after successful payment

## Webhook Configuration

Configure this webhook URL in your RupantorPay dashboard:
```
https://yourwebsite.com/api/payment/webhook
```

## Response Parameters

### Success Response (Payment Creation)
```json
{
    "status": true,
    "message": "Payment Link",
    "payment_url": "https://payment.rupantorpay.com/api/execute/b3217403"
}
```

### Payment Completion Parameters
RupantorPay will redirect to your success/cancel URLs with:
- `transactionID` - Unique transaction identifier
- `paymentMethod` - Payment method used
- `paymentAmount` - Amount paid by customer
- `paymentFee` - Transaction fee deducted
- `currency` - Currency used for payment
- `status` - Payment status (PENDING|COMPLETED|ERROR)

## Troubleshooting

### "Brand not found" Error
- **Cause**: Missing or incorrect API key
- **Solution**: Configure `RUPANTORPAY_API_KEY` with correct key from Brands section

### Payment Creation Fails
1. Check your RupantorPay API key
2. Verify your account is active
3. Check if your domain is configured in RupantorPay dashboard

### Webhook Not Working
1. Ensure webhook URL is accessible from internet
2. Check SSL certificate (required for production)
3. Verify webhook configuration in RupantorPay dashboard

### Test Mode Issues
- Configure real API key to test actual payment flow
- Check browser console for API errors
- Verify all form fields are filled correctly

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your API key secure
- Use HTTPS in production
- Regularly monitor your RupantorPay dashboard
- Check webhook logs for suspicious activity

## Support

For RupantorPay-specific issues:
- Contact RupantorPay support
- Check their official documentation
- Ensure your account is properly configured

For application issues:
- Check the application logs
- Verify environment variables
- Ensure API key is correctly configured