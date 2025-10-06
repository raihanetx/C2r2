const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_l16yPNHWqpGO@ep-restless-lab-a147eavy-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

async function testConnection() {
  try {
    console.log('🔍 Testing Neon PostgreSQL connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Connected to Neon PostgreSQL successfully!');
    
    // Test creating a table
    console.log('📊 Testing database operations...');
    
    // Test creating an order
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: 'TEST-' + Date.now(),
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '+8801234567890',
        subtotal: 5.00,
        total: 5.00,
        currency: 'USD',
        status: 'pending',
        deliveryType: 'digital',
        items: {
          create: [
            {
              productId: 'test-product-1',
              productName: 'Test Product',
              quantity: 1,
              price: 5.00,
              duration: '1 Month'
            }
          ]
        }
      }
    });
    
    console.log('✅ Test order created:', testOrder.orderNumber);
    
    // Test reading the order
    const retrievedOrder = await prisma.order.findUnique({
      where: { id: testOrder.id },
      include: { items: true }
    });
    
    console.log('✅ Test order retrieved:', retrievedOrder.orderNumber);
    console.log('📦 Order items:', retrievedOrder.items.length);
    
    // Clean up
    await prisma.order.delete({
      where: { id: testOrder.id }
    });
    
    console.log('🧹 Test data cleaned up');
    console.log('🎉 Neon PostgreSQL is working perfectly!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();