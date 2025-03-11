// MongoDB initialization script
// Create databases and add initial data

// Admin user for all databases
db.createUser({
  user: 'pos_admin',
  pwd: 'pos_password',
  roles: [
    { role: 'root', db: 'admin' }
  ]
});

// Create databases for each service
const dbs = [
  'pos_auth',
  'pos_products',
  'pos_inventory',
  'pos_orders',
  'pos_payments',
  'pos_stores',
  'pos_sync',
  'pos_notifications'
];

dbs.forEach(dbName => {
  db = db.getSiblingDB(dbName);
  
  // Create service user for this database
  db.createUser({
    user: dbName + '_user',
    pwd: dbName + '_password',
    roles: [
      { role: 'readWrite', db: dbName }
    ]
  });
});

// Add initial data to stores database
db = db.getSiblingDB('pos_stores');

// Create initial store
db.stores.insertOne({
  name: 'Main Store',
  address: '123 Main St',
  city: 'Anytown',
  state: 'CA',
  zip: '12345',
  phone: '555-123-4567',
  email: 'mainstore@example.com',
  taxRate: 0.07,
  active: true,
  createdAt: new Date()
});

// Add initial data to products database
db = db.getSiblingDB('pos_products');

// Create product categories
const categories = [
  {
    _id: ObjectId(),
    name: 'Milk Tea',
    displayOrder: 1,
    active: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Fruit Tea',
    displayOrder: 2,
    active: true,
    createdAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Special Drinks',
    displayOrder: 3,
    active: true,
    createdAt: new Date()
  }
];

db.categories.insertMany(categories);

// Create initial products with variations
db.products.insertOne({
  name: 'Classic Milk Tea',
  description: 'Traditional milk tea with a rich taste',
  basePrice: 4.50,
  category: categories[0]._id,
  variations: [
    {
      name: 'Size',
      required: true,
      options: [
        { name: 'Small', priceAdjustment: -0.50 },
        { name: 'Medium', priceAdjustment: 0 },
        { name: 'Large', priceAdjustment: 0.75 }
      ],
      displayOrder: 1
    },
    {
      name: 'Sugar Level',
      required: true,
      options: [
        { name: '0%', priceAdjustment: 0 },
        { name: '30%', priceAdjustment: 0 },
        { name: '50%', priceAdjustment: 0 },
        { name: '80%', priceAdjustment: 0 },
        { name: '100%', priceAdjustment: 0 }
      ],
      displayOrder: 2
    },
    {
      name: 'Ice Level',
      required: true,
      options: [
        { name: '0%', priceAdjustment: 0 },
        { name: '30%', priceAdjustment: 0 },
        { name: '50%', priceAdjustment: 0 },
        { name: '80%', priceAdjustment: 0 },
        { name: '100%', priceAdjustment: 0 }
      ],
      displayOrder: 3
    }
  ],
  toppings: [
    { name: 'Boba/Tapioca', price: 0.75 },
    { name: 'Grass Jelly', price: 0.75 },
    { name: 'Pudding', price: 0.75 },
    { name: 'Aloe Vera', price: 0.75 },
    { name: 'Red Bean', price: 0.75 }
  ],
  available: true,
  isPopular: true,
  displayOrder: 1,
  createdAt: new Date()
});

// Add initial users to auth database
db = db.getSiblingDB('pos_auth');

// Create admin user
db.users.insertOne({
  name: 'Admin User',
  email: 'admin@example.com',
  password: '.H3kXZMC.OFZxjG0GX5.WEEwGgKC6OVbVWkP6vIrNHV.UyC0/5W', // hashed 'password123'
  role: 'admin',
  active: true,
  createdAt: new Date()
});

// Create cashier user
db.users.insertOne({
  name: 'Cashier User',
  email: 'cashier@example.com',
  password: '.H3kXZMC.OFZxjG0GX5.WEEwGgKC6OVbVWkP6vIrNHV.UyC0/5W', // hashed 'password123'
  role: 'cashier',
  active: true,
  createdAt: new Date()
});
