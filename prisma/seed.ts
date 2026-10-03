import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Starting NearNeed development database seeding...');

  // 1. Ensure a Store Owner User exists for relations
  const ownerUser = await prisma.user.upsert({
    where: { email: 'marcus.owner@nearneed.com' },
    update: {
      name: 'Marcus Vance',
      role: 'STORE_OWNER',
    },
    create: {
      id: 'usr-dev-owner',
      email: 'marcus.owner@nearneed.com',
      password: '$2a$10$e8wJp/3D/e9V9w5D8G0gO.8L9S2L6l2l2l2l2l2l2l2l2l2l2l2l2', // dummy hashed pass
      name: 'Marcus Vance',
      role: 'STORE_OWNER',
      phone: '+1 (512) 555-8765',
      address: '1204 Main Street',
      city: 'Austin, TX',
    },
  });

  // 2. Define Stores
  const storesData = [
    {
      id: 'store-dev-urban-fashion',
      ownerId: ownerUser.id,
      name: 'Urban Fashion Store',
      description: 'Boutique clothing store specializing in formal wear, casual attire, and tailored apparel.',
      address: '408 Congress Ave',
      city: 'Austin, TX',
      zipCode: '78701',
      lat: 30.2669,
      lng: -97.7428,
      phone: '+1 (512) 555-0192',
      rating: 4.9,
      reviewCount: 48,
      category: 'Apparel & Fashion',
      logoUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
      isVerified: true,
      isActive: true,
    },
    {
      id: 'store-dev-tech-world',
      ownerId: ownerUser.id,
      name: 'Tech World',
      description: 'Your local destination for computer peripherals, office tech, and mobile accessories.',
      address: '1100 S Lamar Blvd',
      city: 'Austin, TX',
      zipCode: '78704',
      lat: 30.2520,
      lng: -97.7634,
      phone: '+1 (512) 555-0144',
      rating: 4.8,
      reviewCount: 89,
      category: 'Electronics & Gadgets',
      logoUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=1200',
      isVerified: true,
      isActive: true,
    },
    {
      id: 'store-dev-city-electronics',
      ownerId: ownerUser.id,
      name: 'City Electronics',
      description: 'High quality audio electronics, headphones, chargers, and portable battery gear.',
      address: '2200 E 7th St',
      city: 'Austin, TX',
      zipCode: '78702',
      lat: 30.2605,
      lng: -97.7170,
      phone: '+1 (512) 555-0821',
      rating: 4.7,
      reviewCount: 112,
      category: 'Electronics & Gadgets',
      logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
      isVerified: true,
      isActive: true,
    },
    {
      id: 'store-dev-smart-choice',
      ownerId: ownerUser.id,
      name: 'Smart Choice Store',
      description: 'One-stop shop for smartphones, wearables, smart home gadgets, and tech gadgets.',
      address: '500 W 5th St',
      city: 'Austin, TX',
      zipCode: '78701',
      lat: 30.2690,
      lng: -97.7490,
      phone: '+1 (512) 555-0377',
      rating: 4.6,
      reviewCount: 64,
      category: 'Electronics & Gadgets',
      logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=1200',
      isVerified: true,
      isActive: true,
    },
  ];

  for (const store of storesData) {
    await prisma.store.upsert({
      where: { id: store.id },
      update: store,
      create: store,
    });
  }
  console.log(`Upserted ${storesData.length} stores successfully.`);

  // 3. Define Products
  const productsData = [
    // Urban Fashion Store Products
    {
      id: 'prod-dev-black-formal-shirt',
      storeId: 'store-dev-urban-fashion',
      name: 'Black Formal Shirt',
      description: 'Crisp slim-fit black formal dress shirt crafted from 100% breathable Egyptian cotton. Ideal for business meetings and evening events.',
      category: 'Apparel & Fashion',
      price: 59.99,
      sku: 'UF-SHIRT-BLK-01',
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800',
      tags: ['black', 'shirt', 'formal', 'apparel', 'clothing', 'menswear'],
      isActive: true,
    },
    {
      id: 'prod-dev-blue-casual-shirt',
      storeId: 'store-dev-urban-fashion',
      name: 'Blue Casual Shirt',
      description: 'Comfortable light blue denim-texture casual shirt with button-down collar.',
      category: 'Apparel & Fashion',
      price: 45.00,
      sku: 'UF-SHIRT-BLU-02',
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
      tags: ['blue', 'shirt', 'casual', 'apparel', 'cotton'],
      isActive: true,
    },
    {
      id: 'prod-dev-black-formal-pant',
      storeId: 'store-dev-urban-fashion',
      name: 'Black Formal Pant',
      description: 'Tailored black formal trousers made with wrinkle-resistant stretch wool blend.',
      category: 'Apparel & Fashion',
      price: 69.99,
      sku: 'UF-PANT-BLK-03',
      stock: 12,
      imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800',
      tags: ['black', 'pant', 'trousers', 'formal', 'apparel'],
      isActive: true,
    },
    {
      id: 'prod-dev-mens-formal-shoes',
      storeId: 'store-dev-urban-fashion',
      name: "Men's Formal Shoes",
      description: 'Classic black oxford leather formal shoes with hand-finished polish and durable leather sole.',
      category: 'Apparel & Fashion',
      price: 119.99,
      sku: 'UF-SHOES-BLK-04',
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=800',
      tags: ['black', 'shoes', 'formal', 'footwear', 'leather', 'menswear'],
      isActive: true,
    },

    // Tech World Products
    {
      id: 'prod-dev-wireless-mouse',
      storeId: 'store-dev-tech-world',
      name: 'Wireless Mouse',
      description: 'Ergonomic 2.4GHz wireless optical mouse with quiet click mechanism and long battery life.',
      category: 'Electronics & Gadgets',
      price: 24.99,
      sku: 'TW-MOUSE-WLS-01',
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800',
      tags: ['mouse', 'wireless', 'electronics', 'computer', 'gadgets'],
      isActive: true,
    },
    {
      id: 'prod-dev-bluetooth-keyboard',
      storeId: 'store-dev-tech-world',
      name: 'Bluetooth Keyboard',
      description: 'Slim multi-device Bluetooth keyboard with low-profile quiet keys and rechargeable USB-C battery.',
      category: 'Electronics & Gadgets',
      price: 49.99,
      sku: 'TW-KEYBD-BT-02',
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
      tags: ['keyboard', 'bluetooth', 'electronics', 'gadgets', 'wireless'],
      isActive: true,
    },
    {
      id: 'prod-dev-usb-c-cable',
      storeId: 'store-dev-tech-world',
      name: 'USB-C Cable',
      description: '6ft braided nylon USB-C fast charging cable supporting up to 100W power delivery.',
      category: 'Electronics & Gadgets',
      price: 14.99,
      sku: 'TW-CABLE-USBC-03',
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
      tags: ['usb-c', 'cable', 'charger', 'electronics', 'accessories'],
      isActive: true,
    },
    {
      id: 'prod-dev-laptop-stand',
      storeId: 'store-dev-tech-world',
      name: 'Laptop Stand',
      description: 'Adjustable aluminum laptop stand for ergonomic heat dissipation and posture alignment.',
      category: 'Electronics & Gadgets',
      price: 39.99,
      sku: 'TW-STAND-LPT-04',
      stock: 22,
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800',
      tags: ['stand', 'laptop', 'electronics', 'accessories', 'desk'],
      isActive: true,
    },

    // City Electronics Products
    {
      id: 'prod-dev-bluetooth-earphones',
      storeId: 'store-dev-city-electronics',
      name: 'Bluetooth Earphones',
      description: 'True wireless Bluetooth earphones with active noise cancellation and IPX5 water resistance.',
      category: 'Electronics & Gadgets',
      price: 79.99,
      sku: 'CE-EARPH-BT-01',
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
      tags: ['bluetooth', 'earphones', 'audio', 'electronics', 'wireless'],
      isActive: true,
    },
    {
      id: 'prod-dev-power-bank',
      storeId: 'store-dev-city-electronics',
      name: 'Power Bank',
      description: '20,000mAh high-capacity portable power bank with dual USB-C fast charging ports.',
      category: 'Electronics & Gadgets',
      price: 44.99,
      sku: 'CE-PWRBNK-20K-02',
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&q=80&w=800',
      tags: ['power bank', 'battery', 'charger', 'electronics', 'portable'],
      isActive: true,
    },
    {
      id: 'prod-dev-mobile-charger',
      storeId: 'store-dev-city-electronics',
      name: 'Mobile Charger',
      description: 'Dual-port 30W USB-C wall charger adapter with intelligent power management.',
      category: 'Electronics & Gadgets',
      price: 19.99,
      sku: 'CE-CHG-30W-03',
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800',
      tags: ['charger', 'mobile', 'electronics', 'power', 'wall charger'],
      isActive: true,
    },
    {
      id: 'prod-dev-wireless-headphones',
      storeId: 'store-dev-city-electronics',
      name: 'Wireless Headphones',
      description: 'Over-ear wireless headphones with active noise cancelling, deep bass response, and 30-hour playback.',
      category: 'Electronics & Gadgets',
      price: 129.99,
      sku: 'CE-HEADPH-WLS-04',
      stock: 14,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      tags: ['headphones', 'wireless', 'audio', 'electronics', 'bluetooth'],
      isActive: true,
    },

    // Smart Choice Store Products
    {
      id: 'prod-dev-smartphone',
      storeId: 'store-dev-smart-choice',
      name: 'Smartphone',
      description: '6.7-inch AMOLED display smartphone with 128GB storage, 50MP triple camera, and 5G network capability.',
      category: 'Electronics & Gadgets',
      price: 699.99,
      sku: 'SC-PHONE-5G-01',
      stock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
      tags: ['smartphone', 'phone', 'electronics', '5g', 'mobile'],
      isActive: true,
    },
    {
      id: 'prod-dev-smart-watch',
      storeId: 'store-dev-smart-choice',
      name: 'Smart Watch',
      description: 'Fitness tracking smart watch with heart rate monitor, sleep tracking, GPS, and water resistance.',
      category: 'Electronics & Gadgets',
      price: 199.99,
      sku: 'SC-WATCH-SMT-02',
      stock: 16,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      tags: ['smart watch', 'watch', 'fitness', 'electronics', 'wearable'],
      isActive: true,
    },
    {
      id: 'prod-dev-bluetooth-speaker',
      storeId: 'store-dev-smart-choice',
      name: 'Bluetooth Speaker',
      description: 'Portable waterproof Bluetooth speaker with 360-degree surround sound and 12-hour battery life.',
      category: 'Electronics & Gadgets',
      price: 59.99,
      sku: 'SC-SPKR-BT-03',
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800',
      tags: ['bluetooth', 'speaker', 'audio', 'electronics', 'wireless'],
      isActive: true,
    },
    {
      id: 'prod-dev-usb-cable',
      storeId: 'store-dev-smart-choice',
      name: 'USB Cable',
      description: 'Durable 3ft USB-A to Lightning / USB-C sync and charging cable.',
      category: 'Electronics & Gadgets',
      price: 12.99,
      sku: 'SC-CBL-USB-04',
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
      tags: ['usb', 'cable', 'charger', 'electronics', 'accessories'],
      isActive: true,
    },
  ];

  for (const product of productsData) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }
  console.log(`Upserted ${productsData.length} products successfully.`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
