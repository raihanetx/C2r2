// Test script to verify admin dashboard fixes
// This script can be run in the browser console to test the fixes

// Create sample order data with missing/undefined values
const sampleOrders = [
  {
    id: 'test-order-1',
    date: new Date().toISOString(),
    status: 'completed',
    customer: {
      name: 'Test Customer 1',
      email: 'test1@example.com',
      phone: '+1234567890'
    },
    items: [
      {
        name: 'Test Product',
        quantity: 1,
        price: 10,
        duration: '1 Month'
      }
    ],
    // Missing total property - this should be handled by our fix
    subtotal: 10,
    currency: 'USD',
    deliveryType: 'digital'
  },
  {
    id: 'test-order-2',
    date: new Date().toISOString(),
    status: 'pending',
    customer: {
      name: 'Test Customer 2',
      email: 'test2@example.com',
      phone: '+1234567890'
    },
    items: [
      {
        name: 'Test Product 2',
        quantity: 2,
        price: 25,
        duration: '3 Months'
      }
    ],
    // Has total property
    total: 50,
    subtotal: 50,
    currency: 'USD',
    deliveryType: 'digital'
  },
  {
    id: 'test-order-3',
    date: new Date().toISOString(),
    status: 'processing',
    customer: {
      name: 'Test Customer 3',
      email: 'test3@example.com',
      phone: '+1234567890'
    },
    items: [
      {
        name: 'Test Product 3',
        quantity: 1,
        price: 30,
        duration: '6 Months'
      }
    ],
    // Undefined total - this should be handled by our fix
    total: undefined,
    subtotal: 30,
    currency: 'USD',
    deliveryType: 'digital'
  }
];

// Save to localStorage
localStorage.setItem('orderHistory', JSON.stringify(sampleOrders));

console.log('Test orders saved to localStorage. You can now visit /admin/dashboard to test the fixes.');
console.log('The dashboard should handle orders with missing/undefined total values gracefully.');