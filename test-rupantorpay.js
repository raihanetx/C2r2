// Test RupantorPay API Configuration
const { rupantorPayService } = require('./src/lib/rupantorpay.ts');

async function testRupantorPay() {
  console.log('🔍 Testing RupantorPay Configuration...\n');
  
  // Check configuration
  const config = rupantorPayService.getConfig();
  console.log('📋 Configuration Status:');
  console.log('✅ Configured:', config.configured);
  console.log('🔑 API Key:', config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'Not set');
  console.log('🌐 Base URL:', config.baseUrl);
  console.log('🧪 Test Mode:', config.isTest);
  
  if (!config.configured) {
    console.log('\n❌ RupantorPay is not properly configured');
    return;
  }
  
  console.log('\n🚀 Testing payment creation...');
  
  try {
    const paymentRequest = {
      fullname: 'Test User',
      email: 'test@example.com',
      amount: '10',
      success_url: 'http://localhost:3000/payment/success',
      cancel_url: 'http://localhost:3000/payment/cancel',
      client: 'localhost:3000'
    };
    
    const result = await rupantorPayService.createPayment(paymentRequest);
    
    console.log('💳 Payment Creation Result:');
    console.log('Status:', result.status);
    console.log('Message:', result.message);
    
    if (result.status && result.payment_url) {
      console.log('✅ Payment URL:', result.payment_url);
      console.log('🎉 RupantorPay integration is working!');
    } else {
      console.log('❌ Payment creation failed:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testRupantorPay();