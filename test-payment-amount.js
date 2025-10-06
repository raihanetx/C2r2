#!/usr/bin/env node

// Test payment amount calculation
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
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

async function testPaymentAmounts() {
  console.log('🧮 Testing Payment Amount Calculations\n');
  
  // Test USD payment
  console.log('💵 Testing USD Payment...');
  const usdPayment = {
    customerName: 'USD Test Customer',
    customerEmail: 'usd@test.com',
    customerPhone: '+8801234567890',
    items: [{"name": "Canva Pro", "price": 5, "quantity": 1}],
    totalAmount: "5.00",
    currency: "USD",
    orderId: "TEST-USD-" + Date.now()
  };
  
  try {
    const usdOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usdPayment)
    };
    
    const usdResult = await makeRequest('http://localhost:3000/api/payment/create', usdOptions);
    console.log('USD Payment Result:', usdResult);
  } catch (error) {
    console.error('USD Payment Error:', error.message);
  }
  
  // Test BDT payment
  console.log('\n🇧🇩 Testing BDT Payment...');
  const bdtPayment = {
    customerName: 'BDT Test Customer',
    customerEmail: 'bdt@test.com',
    customerPhone: '+8801234567890',
    items: [{"name": "Canva Pro", "price": 550, "quantity": 1}],
    totalAmount: "550",
    currency: "BDT",
    orderId: "TEST-BDT-" + Date.now()
  };
  
  try {
    const bdtOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bdtPayment)
    };
    
    const bdtResult = await makeRequest('http://localhost:3000/api/payment/create', bdtOptions);
    console.log('BDT Payment Result:', bdtResult);
  } catch (error) {
    console.error('BDT Payment Error:', error.message);
  }
}

testPaymentAmounts();