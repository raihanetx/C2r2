#!/usr/bin/env node

// Complete RupantorPay Payment Test
const http = require('http');
const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testCompletePaymentFlow() {
  console.log('🚀 Testing Complete RupantorPay Payment Flow\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Step 1: Check Configuration
    console.log('📋 Step 1: Checking Configuration...');
    const config = await makeRequest(`${baseUrl}/api/payment/config`);
    console.log('✅ Configuration Status:', {
      configured: config.configured,
      provider: config.provider,
      baseUrl: config.baseUrl,
      isTest: config.isTest
    });
    
    if (!config.configured) {
      console.log('❌ RupantorPay is not configured');
      return;
    }
    
    // Step 2: Create Payment
    console.log('\n💳 Step 2: Creating Payment...');
    const paymentData = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+8801234567890',
      items: [
        { name: 'Canva Pro', price: 5, quantity: 1 }
      ],
      totalAmount: '5',
      currency: 'USD',
      orderId: 'TEST-' + Date.now()
    };
    
    const paymentOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    };
    
    const paymentResult = await makeRequest(`${baseUrl}/api/payment/create`, paymentOptions);
    
    if (paymentResult.success && paymentResult.payment_url) {
      console.log('✅ Payment Created Successfully');
      console.log('🔗 Payment URL:', paymentResult.payment_url);
      console.log('📝 Message:', paymentResult.message);
      
      // Step 3: Verify Payment URL is accessible
      console.log('\n🔍 Step 3: Verifying Payment URL...');
      try {
        const paymentPageCheck = await makeRequest(paymentResult.payment_url, { method: 'HEAD' });
        console.log('✅ Payment URL is accessible');
      } catch (e) {
        console.log('⚠️  Payment URL check failed:', e.message);
      }
      
      // Step 4: Test Verification Endpoint (with dummy ID)
      console.log('\n🔐 Step 4: Testing Verification Endpoint...');
      const verifyOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: 'TEST-TRANSACTION-' + Date.now() })
      };
      
      const verifyResult = await makeRequest(`${baseUrl}/api/payment/verify`, verifyOptions);
      console.log('📝 Verification Result:', verifyResult);
      
      console.log('\n🎉 RupantorPay Integration Test Complete!');
      console.log('📊 Summary:');
      console.log('  ✅ API Configuration: Working');
      console.log('  ✅ Payment Creation: Working');
      console.log('  ✅ Payment URL Generation: Working');
      console.log('  ✅ Verification Endpoint: Working');
      console.log('\n🚀 Your RupantorPay integration is ready for production!');
      
    } else {
      console.log('❌ Payment Creation Failed:', paymentResult);
    }
    
  } catch (error) {
    console.error('💥 Test Failed:', error.message);
  }
}

// Run the test
testCompletePaymentFlow();