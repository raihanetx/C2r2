const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_l16yPNHWqpGO@ep-restless-lab-a147eavy-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

async function seedDatabase() {
  try {
    console.log('🌱 Seeding Neon PostgreSQL database...');
    
    // Create test products
    const products = [
      {
        name: 'Canva Pro',
        description: 'Professional design tool with premium templates',
        longDescription: 'Canva Pro is a premium design tool that offers advanced features like brand kits, background remover, premium templates, and more. Perfect for professionals and businesses.',
        image: 'https://via.placeholder.com/400x300.png?text=Canva+Pro',
        category: 'Design Tools',
        categorySlug: 'design-tools',
        slug: 'canva-pro',
        pricing: [
          { duration: '1 Month', price: 5 },
          { duration: '3 Months', price: 12 },
          { duration: '6 Months', price: 20 },
          { duration: '1 Year', price: 35 }
        ],
        stockOut: false
      },
      {
        name: 'ChatGPT Plus',
        description: 'Advanced AI assistant with GPT-4',
        longDescription: 'ChatGPT Plus gives you access to GPT-4, faster response times, and access to new features. Perfect for professionals, students, and anyone who needs advanced AI assistance.',
        image: 'https://via.placeholder.com/400x300.png?text=ChatGPT+Plus',
        category: 'Productivity',
        categorySlug: 'productivity',
        slug: 'chatgpt-plus',
        pricing: [
          { duration: '1 Month', price: 20 },
          { duration: '3 Months', price: 55 },
          { duration: '6 Months', price: 100 },
          { duration: '1 Year', price: 180 }
        ],
        stockOut: false
      },
      {
        name: 'Figma Pro',
        description: 'Collaborative design interface tool',
        longDescription: 'Figma Pro is a powerful design tool that allows teams to collaborate in real-time. Features include advanced prototyping, version history, and team libraries.',
        image: 'https://via.placeholder.com/400x300.png?text=Figma+Pro',
        category: 'Design Tools',
        categorySlug: 'design-tools',
        slug: 'figma-pro',
        pricing: [
          { duration: '1 Month', price: 12 },
          { duration: '3 Months', price: 30 },
          { duration: '6 Months', price: 55 },
          { duration: '1 Year', price: 100 }
        ],
        stockOut: false
      }
    ];
    
    for (const productData of products) {
      const product = await prisma.product.create({
        data: productData
      });
      console.log('✅ Created product:', product.name);
    }
    
    // Test reading products
    const allProducts = await prisma.product.findMany();
    console.log('📊 Total products in database:', allProducts.length);
    
    console.log('🎉 Neon PostgreSQL database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();