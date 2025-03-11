/**
 * Mock API service with sample data
 * Used for development when the backend isn't available
 */

// Sample categories
export const categories = [
    { id: 'cat1', name: 'Milk Tea' },
    { id: 'cat2', name: 'Fruit Tea' },
    { id: 'cat3', name: 'Special Drinks' }
  ];
  
  // Sample products
  export const products = [
    {
      id: 'p1',
      name: 'Classic Milk Tea',
      description: 'Traditional milk tea with a rich taste',
      basePrice: 4.50,
      category: { id: 'cat1', name: 'Milk Tea' },
      image: 'https://via.placeholder.com/150',
      variations: [
        {
          id: 'size',
          name: 'Size',
          required: true,
          options: [
            { id: 'small', name: 'Small', priceAdjustment: -0.50 },
            { id: 'medium', name: 'Medium', priceAdjustment: 0 },
            { id: 'large', name: 'Large', priceAdjustment: 0.75 }
          ]
        },
        {
          id: 'sugar',
          name: 'Sugar Level',
          required: true,
          options: [
            { id: 'sugar0', name: '0%', priceAdjustment: 0 },
            { id: 'sugar30', name: '30%', priceAdjustment: 0 },
            { id: 'sugar50', name: '50%', priceAdjustment: 0 },
            { id: 'sugar80', name: '80%', priceAdjustment: 0 },
            { id: 'sugar100', name: '100%', priceAdjustment: 0 }
          ]
        },
        {
          id: 'ice',
          name: 'Ice Level',
          required: true,
          options: [
            { id: 'ice0', name: '0%', priceAdjustment: 0 },
            { id: 'ice30', name: '30%', priceAdjustment: 0 },
            { id: 'ice50', name: '50%', priceAdjustment: 0 },
            { id: 'ice80', name: '80%', priceAdjustment: 0 },
            { id: 'ice100', name: '100%', priceAdjustment: 0 }
          ]
        }
      ],
      toppings: [
        { id: 'top1', name: 'Boba/Tapioca', price: 0.75 },
        { id: 'top2', name: 'Grass Jelly', price: 0.75 },
        { id: 'top3', name: 'Pudding', price: 0.75 },
        { id: 'top4', name: 'Aloe Vera', price: 0.75 },
        { id: 'top5', name: 'Red Bean', price: 0.75 }
      ]
    },
    {
      id: 'p2',
      name: 'Taro Milk Tea',
      description: 'Milk tea with taro flavor',
      basePrice: 5.00,
      category: { id: 'cat1', name: 'Milk Tea' },
      image: 'https://via.placeholder.com/150',
      variations: [
        {
          id: 'size',
          name: 'Size',
          required: true,
          options: [
            { id: 'small', name: 'Small', priceAdjustment: -0.50 },
            { id: 'medium', name: 'Medium', priceAdjustment: 0 },
            { id: 'large', name: 'Large', priceAdjustment: 0.75 }
          ]
        },
        {
          id: 'sugar',
          name: 'Sugar Level',
          required: true,
          options: [
            { id: 'sugar0', name: '0%', priceAdjustment: 0 },
            { id: 'sugar30', name: '30%', priceAdjustment: 0 },
            { id: 'sugar50', name: '50%', priceAdjustment: 0 },
            { id: 'sugar80', name: '80%', priceAdjustment: 0 },
            { id: 'sugar100', name: '100%', priceAdjustment: 0 }
          ]
        },
        {
          id: 'ice',
          name: 'Ice Level',
          required: true,
          options: [
            { id: 'ice0', name: '0%', priceAdjustment: 0 },
            { id: 'ice30', name: '30%', priceAdjustment: 0 },
            { id: 'ice50', name: '50%', priceAdjustment: 0 },
            { id: 'ice80', name: '80%', priceAdjustment: 0 },
            { id: 'ice100', name: '100%', priceAdjustment: 0 }
          ]
        }
      ],
      toppings: [
        { id: 'top1', name: 'Boba/Tapioca', price: 0.75 },
        { id: 'top2', name: 'Grass Jelly', price: 0.75 },
        { id: 'top3', name: 'Pudding', price: 0.75 },
        { id: 'top4', name: 'Aloe Vera', price: 0.75 },
        { id: 'top5', name: 'Red Bean', price: 0.75 }
      ]
    },
    {
      id: 'p3',
      name: 'Mango Green Tea',
      description: 'Green tea with fresh mango',
      basePrice: 5.25,
      category: { id: 'cat2', name: 'Fruit Tea' },
      image: 'https://via.placeholder.com/150',
      variations: [
        {
          id: 'size',
          name: 'Size',
          required: true,
          options: [
            { id: 'small', name: 'Small', priceAdjustment: -0.50 },
            { id: 'medium', name: 'Medium', priceAdjustment: 0 },
            { id: 'large', name: 'Large', priceAdjustment: 0.75 }
          ]
        },
        {
          id: 'sugar',
          name: 'Sugar Level',
          required: true,
          options: [
            { id: 'sugar0', name: '0%', priceAdjustment: 0 },
            { id: 'sugar30', name: '30%', priceAdjustment: 0 },
            { id: 'sugar50', name: '50%', priceAdjustment: 0 },
            { id: 'sugar80', name: '80%', priceAdjustment: 0 },
            { id: 'sugar100', name: '100%', priceAdjustment: 0 }
          ]
        },
        {
          id: 'ice',
          name: 'Ice Level',
          required: true,
          options: [
            { id: 'ice0', name: '0%', priceAdjustment: 0 },
            { id: 'ice30', name: '30%', priceAdjustment: 0 },
            { id: 'ice50', name: '50%', priceAdjustment: 0 },
            { id: 'ice80', name: '80%', priceAdjustment: 0 },
            { id: 'ice100', name: '100%', priceAdjustment: 0 }
          ]
        }
      ],
      toppings: [
        { id: 'top1', name: 'Boba/Tapioca', price: 0.75 },
        { id: 'top2', name: 'Grass Jelly', price: 0.75 },
        { id: 'top6', name: 'Mango Jelly', price: 0.75 },
        { id: 'top4', name: 'Aloe Vera', price: 0.75 },
        { id: 'top7', name: 'Popping Boba', price: 1.00 }
      ]
    },
    {
      id: 'p4',
      name: 'Strawberry Green Tea',
      description: 'Green tea with strawberry flavor',
      basePrice: 5.25,
      category: { id: 'cat2', name: 'Fruit Tea' },
      image: 'https://via.placeholder.com/150',
      isPopular: true,
      variations: [
        {
          id: 'size',
          name: 'Size',
          required: true,
          options: [
            { id: 'small', name: 'Small', priceAdjustment: -0.50 },
            { id: 'medium', name: 'Medium', priceAdjustment: 0 },
            { id: 'large', name: 'Large', priceAdjustment: 0.75 }
          ]
        },
        {
          id: 'sugar',
          name: 'Sugar Level',
          required: true,
          options: [
            { id: 'sugar0', name: '0%', priceAdjustment: 0 },
            { id: 'sugar30', name: '30%', priceAdjustment: 0 },
            { id: 'sugar50', name: '50%', priceAdjustment: 0 },
            { id: 'sugar80', name: '80%', priceAdjustment: 0 },
            { id: 'sugar100', name: '100%', priceAdjustment: 0 }
          ]
        },
        {
          id: 'ice',
          name: 'Ice Level',
          required: true,
          options: [
            { id: 'ice0', name: '0%', priceAdjustment: 0 },
            { id: 'ice30', name: '30%', priceAdjustment: 0 },
            { id: 'ice50', name: '50%', priceAdjustment: 0 },
            { id: 'ice80', name: '80%', priceAdjustment: 0 },
            { id: 'ice100', name: '100%', priceAdjustment: 0 }
          ]
        }
      ],
      toppings: [
        { id: 'top1', name: 'Boba/Tapioca', price: 0.75 },
        { id: 'top2', name: 'Grass Jelly', price: 0.75 },
        { id: 'top8', name: 'Strawberry Popping', price: 1.00 },
        { id: 'top4', name: 'Aloe Vera', price: 0.75 }
      ]
    },
    {
      id: 'p5',
      name: 'Brown Sugar Boba Milk Tea',
      description: 'Milk tea with brown sugar syrup and boba',
      basePrice: 5.50,
      category: { id: 'cat3', name: 'Special Drinks' },
      image: 'https://via.placeholder.com/150',
      isPopular: true,
      variations: [
        {
          id: 'size',
          name: 'Size',
          required: true,
          options: [
            { id: 'small', name: 'Small', priceAdjustment: -0.50 },
            { id: 'medium', name: 'Medium', priceAdjustment: 0 },
            { id: 'large', name: 'Large', priceAdjustment: 0.75 }
          ]
        },
        {
          id: 'sugar',
          name: 'Sugar Level',
          required: true,
          options: [
            { id: 'sugar50', name: '50%', priceAdjustment: 0 },
            { id: 'sugar80', name: '80%', priceAdjustment: 0 },
            { id: 'sugar100', name: '100%', priceAdjustment: 0 }
          ]
        },
        {
          id: 'ice',
          name: 'Ice Level',
          required: true,
          options: [
            { id: 'ice0', name: '0%', priceAdjustment: 0 },
            { id: 'ice30', name: '30%', priceAdjustment: 0 },
            { id: 'ice50', name: '50%', priceAdjustment: 0 },
            { id: 'ice80', name: '80%', priceAdjustment: 0 },
            { id: 'ice100', name: '100%', priceAdjustment: 0 }
          ]
        }
      ],
      toppings: [
        { id: 'top1', name: 'Extra Boba', price: 0.75 },
        { id: 'top3', name: 'Pudding', price: 0.75 },
        { id: 'top9', name: 'Cream Cheese Foam', price: 1.50 }
      ]
    },
    {
      id: 'p6',
      name: 'Matcha Latte',
      description: 'Milk tea with premium matcha',
      basePrice: 5.75,
      category: { id: 'cat3', name: 'Special Drinks' },
      image: 'https://via.placeholder.com/150',
      variations: [
        {
          id: 'size',
          name: 'Size',
          required: true,
          options: [
            { id: 'small', name: 'Small', priceAdjustment: -0.50 },
            { id: 'medium', name: 'Medium', priceAdjustment: 0 },
            { id: 'large', name: 'Large', priceAdjustment: 0.75 }
          ]
        },
        {
          id: 'sugar',
          name: 'Sugar Level',
          required: true,
          options: [
            { id: 'sugar0', name: '0%', priceAdjustment: 0 },
            { id: 'sugar30', name: '30%', priceAdjustment: 0 },
            { id: 'sugar50', name: '50%', priceAdjustment: 0 },
            { id: 'sugar80', name: '80%', priceAdjustment: 0 }
          ]
        },
        {
          id: 'ice',
          name: 'Ice Level',
          required: true,
          options: [
            { id: 'ice0', name: '0%', priceAdjustment: 0 },
            { id: 'ice30', name: '30%', priceAdjustment: 0 },
            { id: 'ice50', name: '50%', priceAdjustment: 0 },
            { id: 'ice80', name: '80%', priceAdjustment: 0 },
            { id: 'ice100', name: '100%', priceAdjustment: 0 }
          ]
        }
      ],
      toppings: [
        { id: 'top1', name: 'Boba/Tapioca', price: 0.75 },
        { id: 'top3', name: 'Pudding', price: 0.75 },
        { id: 'top5', name: 'Red Bean', price: 0.75 },
        { id: 'top9', name: 'Cream Cheese Foam', price: 1.50 }
      ]
    }
  ];
  
  // Sample orders
  export const orders = [
    {
      _id: 'ord1',
      orderNumber: 'ORD-001',
      createdAt: '2025-03-09T10:30:00Z',
      status: 'completed',
      customerName: 'John Doe',
      items: [
        {
          product: 'p1',
          name: 'Classic Milk Tea',
          quantity: 2,
          basePrice: 4.50,
          variations: [
            { name: 'Size', value: 'Large', priceAdjustment: 0.75 },
            { name: 'Sugar Level', value: '50%', priceAdjustment: 0 },
            { name: 'Ice Level', value: '50%', priceAdjustment: 0 }
          ],
          toppings: [
            { name: 'Boba/Tapioca', price: 0.75 }
          ],
          subtotal: 12.00
        }
      ],
      subtotal: 12.00,
      tax: 0.84,
      total: 12.84,
      orderType: 'takeaway'
    },
    {
      _id: 'ord2',
      orderNumber: 'ORD-002',
      createdAt: '2025-03-10T15:45:00Z',
      status: 'pending',
      customerName: 'Jane Smith',
      items: [
        {
          product: 'p2',
          name: 'Taro Milk Tea',
          quantity: 1,
          basePrice: 5.00,
          variations: [
            { name: 'Size', value: 'Medium', priceAdjustment: 0 },
            { name: 'Sugar Level', value: '30%', priceAdjustment: 0 },
            { name: 'Ice Level', value: '30%', priceAdjustment: 0 }
          ],
          toppings: [
            { name: 'Pudding', price: 0.75 }
          ],
          subtotal: 5.75
        },
        {
          product: 'p3',
          name: 'Mango Green Tea',
          quantity: 1,
          basePrice: 5.25,
          variations: [
            { name: 'Size', value: 'Medium', priceAdjustment: 0 },
            { name: 'Sugar Level', value: '50%', priceAdjustment: 0 },
            { name: 'Ice Level', value: '50%', priceAdjustment: 0 }
          ],
          toppings: [
            { name: 'Popping Boba', price: 1.00 }
          ],
          subtotal: 6.25
        }
      ],
      subtotal: 12.00,
      tax: 0.84,
      total: 12.84,
      orderType: 'takeaway'
    }
  ];
  
  // Mock API response helper
  const mockResponse = (data, delay = 300) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            data
          },
          status: 200
        });
      }, delay);
    });
  };
  
  // Mock API endpoints
  const mockAPI = {
    // Products endpoints
    '/api/products': () => mockResponse(products),
    '/api/products/categories': () => mockResponse(categories),
    '/api/products/popular': () => mockResponse(products.filter(p => p.isPopular).slice(0, 5)),
    
    // Orders endpoints
    '/api/orders': () => mockResponse(orders),
    
    // Order creation with auto-generated ID
    '/api/orders/create': (orderData) => {
      const newOrder = {
        _id: `ord${Date.now()}`,
        orderNumber: `ORD-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
        ...orderData
      };
      
      return mockResponse(newOrder);
    }
  };
  
  export default mockAPI;