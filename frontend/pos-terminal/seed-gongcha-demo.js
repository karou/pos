/**
 * MongoDB Seed Script for Gong Cha POS Demo
 * 
 * This script populates the database with realistic data for a Gong Cha bubble tea shop demo.
 * Run this script using: node seed-gongcha-demo.js
 * 
 * Requires: mongodb package (npm install mongodb)
 */

const { MongoClient, ObjectId } = require('mongodb');

// Connection URL and Database Name
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'pos_system';

// Connect to MongoDB
async function seedDatabase() {
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB server');
    
    const db = client.db(dbName);
    
    // Clear existing data
    await clearCollections(db);
    
    // Seed stores
    const storeIds = await seedStores(db);
    
    // Seed users
    const userIds = await seedUsers(db, storeIds);
    
    // Seed categories
    const categoryIds = await seedCategories(db);
    
    // Seed variations
    const variations = await seedVariations(db);
    
    // Seed toppings
    const toppings = await seedToppings(db);
    
    // Seed products
    const productIds = await seedProducts(db, categoryIds, variations, toppings);
    
    // Seed orders
    await seedOrders(db, storeIds, userIds, productIds);
    
    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Clear existing collections
async function clearCollections(db) {
  console.log('Clearing existing collections...');
  
  const collections = [
    'stores', 'users', 'categories', 'variations', 'toppings',
    'products', 'orders', 'inventory'
  ];
  
  for (const collection of collections) {
    await db.collection(collection).deleteMany({});
  }
}

// Seed store data
async function seedStores(db) {
  console.log('Seeding stores...');
  
  const stores = [
    {
      name: 'Gong Cha Downtown',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      phone: '212-555-1234',
      email: 'downtown@gongcha.example.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Gong Cha Midtown',
      address: '456 Park Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10022',
      phone: '212-555-5678',
      email: 'midtown@gongcha.example.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Gong Cha Brooklyn',
      address: '789 Bedford Avenue',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11211',
      phone: '718-555-9012',
      email: 'brooklyn@gongcha.example.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const result = await db.collection('stores').insertMany(stores);
  console.log(`${result.insertedCount} stores inserted`);
  
  return Object.values(result.insertedIds);
}

// Seed user data
async function seedUsers(db, storeIds) {
  console.log('Seeding users...');
  
  const users = [
    {
      name: 'Admin User',
      email: 'admin@gongcha.example.com',
      password: '$2a$10$XQCuZrEBPbjsn1HElpWxBeZ1.GJEBuLEABzLZR7wn2PabRYKdlJC.', // hashed 'password123'
      role: 'admin',
      store: storeIds[0],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Manager User',
      email: 'manager@gongcha.example.com',
      password: '$2a$10$XQCuZrEBPbjsn1HElpWxBeZ1.GJEBuLEABzLZR7wn2PabRYKdlJC.',
      role: 'manager',
      store: storeIds[0],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Cashier 1',
      email: 'cashier1@gongcha.example.com',
      password: '$2a$10$XQCuZrEBPbjsn1HElpWxBeZ1.GJEBuLEABzLZR7wn2PabRYKdlJC.',
      role: 'cashier',
      store: storeIds[0],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Cashier 2',
      email: 'cashier2@gongcha.example.com',
      password: '$2a$10$XQCuZrEBPbjsn1HElpWxBeZ1.GJEBuLEABzLZR7wn2PabRYKdlJC.',
      role: 'cashier',
      store: storeIds[1],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Brooklyn Manager',
      email: 'brooklyn.manager@gongcha.example.com',
      password: '$2a$10$XQCuZrEBPbjsn1HElpWxBeZ1.GJEBuLEABzLZR7wn2PabRYKdlJC.',
      role: 'manager',
      store: storeIds[2],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const result = await db.collection('users').insertMany(users);
  console.log(`${result.insertedCount} users inserted`);
  
  return Object.values(result.insertedIds);
}

// Seed category data
async function seedCategories(db) {
  console.log('Seeding categories...');
  
  const categories = [
    {
      name: 'Milk Tea',
      description: 'Traditional milk teas with various flavors',
      image: 'milktea.jpg',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Fruit Tea',
      description: 'Refreshing fruit-flavored teas',
      image: 'fruittea.jpg',
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Slush',
      description: 'Frozen blended beverages',
      image: 'slush.jpg',
      isActive: true,
      sortOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Coffee',
      description: 'Coffee beverages with Gong Cha twist',
      image: 'coffee.jpg',
      isActive: true,
      sortOrder: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Seasonal',
      description: 'Limited-time seasonal offerings',
      image: 'seasonal.jpg',
      isActive: true,
      sortOrder: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const result = await db.collection('categories').insertMany(categories);
  console.log(`${result.insertedCount} categories inserted`);
  
  const categoryMap = {};
  Object.keys(result.insertedIds).forEach((index) => {
    categoryMap[categories[index].name] = result.insertedIds[index];
  });
  
  return categoryMap;
}

// Seed variation data
async function seedVariations(db) {
  console.log('Seeding variations...');
  
  const variations = [
    {
      id: 'size',
      name: 'Size',
      required: true,
      options: [
        { id: 'small', name: 'Small', priceAdjustment: -0.50 },
        { id: 'medium', name: 'Medium', priceAdjustment: 0 },
        { id: 'large', name: 'Large', priceAdjustment: 0.75 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'sugar',
      name: 'Sugar Level',
      required: true,
      options: [
        { id: 'sugar0', name: '0%', priceAdjustment: 0 },
        { id: 'sugar30', name: '30%', priceAdjustment: 0 },
        { id: 'sugar50', name: '50%', priceAdjustment: 0 },
        { id: 'sugar70', name: '70%', priceAdjustment: 0 },
        { id: 'sugar100', name: '100%', priceAdjustment: 0 },
        { id: 'sugarExtra', name: '120%', priceAdjustment: 0.25 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ice',
      name: 'Ice Level',
      required: true,
      options: [
        { id: 'ice0', name: '0%', priceAdjustment: 0 },
        { id: 'ice30', name: '30%', priceAdjustment: 0 },
        { id: 'ice50', name: '50%', priceAdjustment: 0 },
        { id: 'ice70', name: '70%', priceAdjustment: 0 },
        { id: 'ice100', name: '100%', priceAdjustment: 0 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'milkFoam',
      name: 'Milk Foam',
      required: false,
      options: [
        { id: 'noMilkFoam', name: 'No Milk Foam', priceAdjustment: 0 },
        { id: 'withMilkFoam', name: 'With Milk Foam', priceAdjustment: 0.75 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const result = await db.collection('variations').insertMany(variations);
  console.log(`${result.insertedCount} variations inserted`);
  
  return variations;
}

// Seed topping data
async function seedToppings(db) {
  console.log('Seeding toppings...');
  
  const toppings = [
    {
      id: 'pearls',
      name: 'Pearls (Boba)',
      price: 0.75,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'coconutJelly',
      name: 'Coconut Jelly',
      price: 0.75,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'herbalJelly',
      name: 'Herbal Jelly',
      price: 0.75,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'whitePearl',
      name: 'White Pearl',
      price: 0.75,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'grassJelly',
      name: 'Grass Jelly',
      price: 0.75,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'aloeVera',
      name: 'Aloe Vera',
      price: 0.75,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'redBean',
      name: 'Red Bean',
      price: 0.75,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'pudding',
      name: 'Pudding',
      price: 0.75,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'milkFoam',
      name: 'Milk Foam',
      price: 0.75,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'oreo',
      name: 'Oreo Crumbs',
      price: 0.90,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const result = await db.collection('toppings').insertMany(toppings);
  console.log(`${result.insertedCount} toppings inserted`);
  
  return toppings;
}

// Seed product data
async function seedProducts(db, categoryIds, variations, toppings) {
  console.log('Seeding products...');
  
  // Create array of just the topping IDs
  const toppingIds = toppings.map(topping => topping.id);
  
  const products = [
    {
      name: 'Classic Pearl Milk Tea',
      description: 'The original milk tea with pearls',
      basePrice: 5.25,
      category: categoryIds['Milk Tea'],
      image: 'classic-pearl-milk-tea.jpg',
      variations: ['size', 'sugar', 'ice'],
      toppings: toppingIds,
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Earl Grey Milk Tea',
      description: 'Milk tea made with Earl Grey tea',
      basePrice: 5.25,
      category: categoryIds['Milk Tea'],
      image: 'earl-grey-milk-tea.jpg',
      variations: ['size', 'sugar', 'ice'],
      toppings: toppingIds,
      isPopular: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Taro Milk Tea',
      description: 'Milk tea with taro flavor',
      basePrice: 5.50,
      category: categoryIds['Milk Tea'],
      image: 'taro-milk-tea.jpg',
      variations: ['size', 'sugar', 'ice'],
      toppings: toppingIds,
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Wintermelon Milk Tea',
      description: 'Milk tea with wintermelon flavor',
      basePrice: 5.25,
      category: categoryIds['Milk Tea'],
      image: 'wintermelon-milk-tea.jpg',
      variations: ['size', 'sugar', 'ice'],
      toppings: toppingIds,
      isPopular: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Brown Sugar Milk Tea',
      description: 'Milk tea with brown sugar syrup',
      basePrice: 5.75,
      category: categoryIds['Milk Tea'],
      image: 'brown-sugar-milk-tea.jpg',
      variations: ['size', 'sugar', 'ice'],
      toppings: toppingIds,
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Mango Green Tea',
      description: 'Green tea with mango flavor',
      basePrice: 5.50,
      category: categoryIds['Fruit Tea'],
      image: 'mango-green-tea.jpg',
      variations: ['size', 'sugar', 'ice'],
      toppings: toppingIds,
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Passion Fruit Green Tea',
      description: 'Green tea with passion fruit flavor',
      basePrice: 5.50,
      category: categoryIds['Fruit Tea'],
      image: 'passion-fruit-green-tea.jpg',
      variations: ['size', 'sugar', 'ice'],
      toppings: toppingIds,
      isPopular: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Lychee Oolong Tea',
      description: 'Oolong tea with lychee flavor',
      basePrice: 5.50,
      category: categoryIds['Fruit Tea'],
      image: 'lychee-oolong-tea.jpg',
      variations: ['size', 'sugar', 'ice'],
      toppings: toppingIds,
      isPopular: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Strawberry Green Tea',
      description: 'Green tea with strawberry flavor',
      basePrice: 5.50,
      category: categoryIds['Fruit Tea'],
      image: 'strawberry-green-tea.jpg',
      variations: ['size', 'sugar', 'ice'],
      toppings: toppingIds,
      isPopular: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Peach Green Tea',
      description: 'Green tea with peach flavor',
      basePrice: 5.50,
      category: categoryIds['Fruit Tea'],
      image: 'peach-green-tea.jpg',
      variations: ['size', 'sugar', 'ice'],
      toppings: toppingIds,
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Mango Slush',
      description: 'Frozen blended mango slush',
      basePrice: 6.00,
      category: categoryIds['Slush'],
      image: 'mango-slush.jpg',
      variations: ['size', 'sugar'],
      toppings: toppingIds,
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Taro Slush',
      description: 'Frozen blended taro slush',
      basePrice: 6.00,
      category: categoryIds['Slush'],
      image: 'taro-slush.jpg',
      variations: ['size', 'sugar'],
      toppings: toppingIds,
      isPopular: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Gong Cha Coffee',
      description: 'Signature Gong Cha coffee',
      basePrice: 5.75,
      category: categoryIds['Coffee'],
      image: 'gong-cha-coffee.jpg',
      variations: ['size', 'sugar', 'ice', 'milkFoam'],
      toppings: toppingIds.filter(id => id !== 'milkFoam'), // Remove milk foam from toppings since it's a variation
      isPopular: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Milk Coffee',
      description: 'Coffee with milk',
      basePrice: 5.75,
      category: categoryIds['Coffee'],
      image: 'milk-coffee.jpg',
      variations: ['size', 'sugar', 'ice', 'milkFoam'],
      toppings: toppingIds.filter(id => id !== 'milkFoam'),
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Brown Sugar Dirty Milk',
      description: 'Fresh milk with brown sugar and coffee jelly',
      basePrice: 6.25,
      category: categoryIds['Seasonal'],
      image: 'brown-sugar-dirty-milk.jpg',
      variations: ['size', 'sugar', 'ice'],
      toppings: toppingIds,
      isPopular: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const result = await db.collection('products').insertMany(products);
  console.log(`${result.insertedCount} products inserted`);
  
  // Seed inventory for each product
  await seedInventory(db, result.insertedIds);
  
  return Object.values(result.insertedIds);
}

// Seed inventory data
async function seedInventory(db, productIds) {
  console.log('Seeding inventory...');
  
  const inventory = [];
  
  // For each product, create inventory entries
  Object.values(productIds).forEach(productId => {
    inventory.push({
      product: productId,
      quantity: Math.floor(Math.random() * 100) + 50, // Random quantity between 50-150
      minQuantity: 20,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });
  
  const result = await db.collection('inventory').insertMany(inventory);
  console.log(`${result.insertedCount} inventory items inserted`);
}

// Generate a random date within the last 30 days
function getRandomDate() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
}

// Seed order data
async function seedOrders(db, storeIds, userIds, productIds) {
  console.log('Seeding orders...');
  
  const orders = [];
  const orderCount = 200; // Create 200 sample orders
  
  // Get all products for reference
  const products = await db.collection('products').find({}).toArray();
  
  // Create sample orders
  for (let i = 0; i < orderCount; i++) {
    // Generate a random number of items (1-5)
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const items = [];
    let subtotal = 0;
    
    // Generate random items for this order
    for (let j = 0; j < itemCount; j++) {
      // Pick a random product
      const product = products[Math.floor(Math.random() * products.length)];
      
      // Generate random variations
      const variations = [];
      if (product.variations.includes('size')) {
        const sizes = ['small', 'medium', 'large'];
        const sizeIndex = Math.floor(Math.random() * 3);
        const sizeOption = sizes[sizeIndex];
        const priceAdjustment = sizeIndex === 0 ? -0.50 : (sizeIndex === 2 ? 0.75 : 0);
        
        variations.push({
          name: 'Size',
          value: sizeOption === 'small' ? 'Small' : (sizeOption === 'medium' ? 'Medium' : 'Large'),
          priceAdjustment
        });
      }
      
      if (product.variations.includes('sugar')) {
        const sugarLevels = ['0%', '30%', '50%', '70%', '100%'];
        variations.push({
          name: 'Sugar Level',
          value: sugarLevels[Math.floor(Math.random() * sugarLevels.length)],
          priceAdjustment: 0
        });
      }
      
      if (product.variations.includes('ice')) {
        const iceLevels = ['0%', '30%', '50%', '70%', '100%'];
        variations.push({
          name: 'Ice Level',
          value: iceLevels[Math.floor(Math.random() * iceLevels.length)],
          priceAdjustment: 0
        });
      }
      
      // Random chance to add toppings (50%)
      const toppings = [];
      if (Math.random() > 0.5 && product.toppings && product.toppings.length > 0) {
        // Add 1-2 random toppings
        const toppingCount = Math.floor(Math.random() * 2) + 1;
        for (let k = 0; k < toppingCount; k++) {
          if (product.toppings[k]) {
            toppings.push({
              name: product.toppings[k] === 'pearls' ? 'Pearls (Boba)' : 
                    (product.toppings[k] === 'coconutJelly' ? 'Coconut Jelly' : 
                    (product.toppings[k] === 'grassJelly' ? 'Grass Jelly' : 'Pudding')),
              price: 0.75
            });
          }
        }
      }
      
      // Calculate item price
      const basePrice = product.basePrice;
      let totalPrice = basePrice;
      
      // Add variation price adjustments
      variations.forEach(variation => {
        totalPrice += variation.priceAdjustment || 0;
      });
      
      // Add topping prices
      toppings.forEach(topping => {
        totalPrice += topping.price || 0;
      });
      
      // Create the item
      const item = {
        product: product._id,
        name: product.name,
        quantity: Math.floor(Math.random() * 2) + 1, // 1 or 2 quantity
        basePrice,
        variations,
        toppings,
        subtotal: totalPrice
      };
      
      // Adjust for quantity
      item.subtotal = item.subtotal * item.quantity;
      
      items.push(item);
      subtotal += item.subtotal;
    }
    
    // Calculate tax and total
    const tax = subtotal * 0.08875; // NYC sales tax rate
    const total = subtotal + tax;
    
    // Determine order status
    const statuses = ['completed', 'completed', 'completed', 'completed', 'pending', 'preparing', 'ready'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Randomly determine order type
    const orderTypes = ['takeaway', 'takeaway', 'takeaway', 'dine-in', 'delivery'];
    const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    
    // Create random payment info
    const paymentMethods = ['cash', 'credit_card', 'mobile_pay'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // Create the order
    const orderDate = getRandomDate();
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Create a random user for the customer name
    const randomNames = [
      'John Smith', 'Emma Johnson', 'Michael Brown', 'Olivia Davis', 'James Wilson',
      'Sophia Martinez', 'William Anderson', 'Ava Taylor', 'Alexander Thomas', 'Isabella Jackson',
      '', '', '' // Some orders with no name
    ];
    
    // Create the order object
    const order = {
      orderNumber,
      store: storeIds[Math.floor(Math.random() * storeIds.length)],
      createdBy: userIds[Math.floor(Math.random() * userIds.length)],
      customerName: randomNames[Math.floor(Math.random() * randomNames.length)],
      items,
      subtotal,
      tax,
      total,
      orderType,
      status,
      paymentMethod,
      createdAt: orderDate,
      updatedAt: orderDate
    };
    
    // Add table number for dine-in orders
    if (orderType === 'dine-in') {
      order.tableNumber = `T${Math.floor(Math.random() * 20) + 1}`;
    }
    
    orders.push(order);
  }
  
  const result = await db.collection('orders').insertMany(orders);
  console.log(`${result.insertedCount} orders inserted`);
}

// Run the seeding process
seedDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });