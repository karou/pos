import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Sample data
const sampleCategories = [
  { id: 'cat1', name: 'Milk Tea' },
  { id: 'cat2', name: 'Fruit Tea' },
  { id: 'cat3', name: 'Special Drinks' }
];

const sampleProducts = [
  {
    id: 'p1',
    name: 'Classic Milk Tea',
    description: 'Traditional milk tea with a rich taste',
    basePrice: 4.50,
    category: { id: 'cat1', name: 'Milk Tea' },
    image: '/placeholder-tea.png',
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
    image: '/placeholder-tea.png',
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
    image: '/placeholder-tea.png',
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
    image: '/placeholder-tea.png',
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
    name: 'Brown Sugar Boba Tea',
    description: 'Milk tea with brown sugar syrup and boba',
    basePrice: 5.50,
    category: { id: 'cat3', name: 'Special Drinks' },
    image: '/placeholder-tea.png',
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
    image: '/placeholder-tea.png',
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

const POSPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [categories] = useState(sampleCategories);
  const [products] = useState(sampleProducts);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isOnline] = useState(navigator.onLine);
  
  // Filter products based on category and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category.id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Handle product click
  const handleProductClick = (product) => {
    // Check if product has variations or toppings
    if (
      (product.variations && product.variations.length > 0) ||
      (product.toppings && product.toppings.length > 0)
    ) {
      setSelectedProduct(product);
      setShowCustomization(true);
    } else {
      // Simple product, add directly to cart
      addToCart({
        productId: product.id,
        name: product.name,
        quantity: 1,
        basePrice: product.basePrice,
        totalPrice: product.basePrice,
        variations: [],
        toppings: []
      });
    }
  };
  
  // Add customized product to cart
  const handleAddToCart = (customizedProduct) => {
    addToCart(customizedProduct);
    setShowCustomization(false);
    setSelectedProduct(null);
  };
  
  // Add product to cart
  const addToCart = (product) => {
    setCart(prevCart => [...prevCart, { ...product, cartId: Date.now() }]);
  };
  
  // Remove product from cart
  const removeFromCart = (cartId) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
  };
  
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + item.totalPrice, 0);
  
  // Handle checkout
  const handleCheckout = async () => {
    try {
      const order = {
        storeId: '1', // Replace with actual store ID from context or props
        items: cart.map(item => ({
          product: item.productId,
          name: item.name,
          quantity: item.quantity,
          basePrice: item.basePrice,
          variations: item.variations,
          toppings: item.toppings,
          specialInstructions: item.specialInstructions,
          subtotal: item.totalPrice
        })),
        subtotal: cartTotal,
        tax: cartTotal * 0.07, // 7% tax rate (should be configurable)
        total: cartTotal + (cartTotal * 0.07),
        orderType: 'takeaway', // Default to takeaway
        offlineCreated: !isOnline,
        offlineId: Date.now().toString(), // Unique ID for offline orders
        createdAt: new Date().toISOString()
      };
      
      if (isOnline) {
        // Send order to API
        // const response = await fetch('/api/orders', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${user.token}`
        //   },
        //   body: JSON.stringify(order)
        // });
        // const data = await response.json();
        console.log('Order created online', order);
        
        // Mock successful order
        alert('Order completed successfully!');
      } else {
        // Save order offline
        // In a real implementation, use IndexedDB
        const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        pendingOrders.push(order);
        localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
        
        console.log('Order saved offline', order);
        alert('Order saved offline. Will sync when online.');
      }
      
      // Clear cart
      setCart([]);
      
    } catch (error) {
      console.error('Error creating order', error);
      alert('Error creating order. Please try again.');
    }
  };
  
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>POS Terminal</h1>
        <div className="user-info">
          <span>{user?.name || 'User'}</span>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </header>
      
      <div className="pos-layout">
        {/* Product listing */}
        <div className="product-section">
          <div className="section-header">
            <h2>Products</h2>
            <div className="search-filter">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <div className="category-filters">
                <button
                  className={selectedCategory === 'all' ? 'active' : ''}
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={selectedCategory === category.id ? 'active' : ''}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="product-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card" onClick={() => handleProductClick(product)}>
                <h3>{product.name}</h3>
                <p className="product-price">${product.basePrice.toFixed(2)}</p>
                <p className="product-category">{product.category.name}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Cart section */}
        <div className="cart-section">
          <h2>Current Order</h2>
          
          {cart.length === 0 ? (
            <p className="empty-cart">No items in cart</p>
          ) : (
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.cartId} className="cart-item">
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                    
                    {/* Show variations */}
                    {item.variations && item.variations.length > 0 && (
                      <div className="item-variations">
                        {item.variations.map((variation, index) => (
                          <span key={index}>
                            {variation.name}: {variation.value}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Show toppings */}
                    {item.toppings && item.toppings.length > 0 && (
                      <div className="item-toppings">
                        {item.toppings.map((topping, index) => (
                          <span key={index}>
                            +{topping.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="item-actions">
                    <span className="item-price">${item.totalPrice.toFixed(2)}</span>
                    <button 
                      className="remove-item"
                      onClick={() => removeFromCart(item.cartId)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="cart-summary">
            <div className="cart-subtotal">
              <span>Subtotal:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="cart-tax">
              <span>Tax (7%):</span>
              <span>${(cartTotal * 0.07).toFixed(2)}</span>
            </div>
            <div className="cart-total">
              <span>Total:</span>
              <span>${(cartTotal + cartTotal * 0.07).toFixed(2)}</span>
            </div>
            
            <button 
              className="checkout-button"
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              {isOnline ? 'Complete Order' : 'Save Order Offline'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Product customization modal */}
      {showCustomization && selectedProduct && (
        <div className="customization-overlay">
          <div className="customization-panel">
            <div className="panel-header">
              <h3>Customize Your {selectedProduct.name}</h3>
              <button className="close-button" onClick={() => setShowCustomization(false)}>
                ×
              </button>
            </div>
            
            <div className="product-details">
              <p className="product-description">{selectedProduct.description}</p>
              <p className="base-price">Base Price: ${selectedProduct.basePrice.toFixed(2)}</p>
            </div>
            
            {/* Size, Sugar, Ice variations */}
            {selectedProduct.variations && selectedProduct.variations.map(variation => (
              <div key={variation.id} className="variation-group">
                <h4 className="variation-title">{variation.name}</h4>
                <div className="variation-options">
                  {variation.options.map(option => (
                    <div key={option.id} className="variation-option">
                      <span className="option-name">{option.name}</span>
                      {option.priceAdjustment !== 0 && (
                        <span className="price-adjustment">
                          {option.priceAdjustment > 0 ? '+' : ''}${option.priceAdjustment.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Toppings */}
            {selectedProduct.toppings && selectedProduct.toppings.length > 0 && (
              <div className="toppings-section">
                <h4>Add Toppings</h4>
                <div className="toppings-grid">
                  {selectedProduct.toppings.map(topping => (
                    <div key={topping.id} className="topping-item">
                      <span className="topping-name">{topping.name}</span>
                      <span className="topping-price">+${topping.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Special instructions */}
            <div className="special-instructions">
              <h4>Special Instructions</h4>
              <textarea
                placeholder="Add any special instructions here..."
                rows={3}
              ></textarea>
            </div>
            
            {/* Quantity */}
            <div className="quantity-selector">
              <h4>Quantity</h4>
              <div className="quantity-controls">
                <button className="quantity-button">−</button>
                <span className="quantity-value">1</span>
                <button className="quantity-button">+</button>
              </div>
            </div>
            
            {/* Add to cart button */}
            <div className="order-actions">
              <button 
                className="add-to-cart-button"
                onClick={() => {
                  // For now, we'll just add the base product since we haven't fully implemented the customization logic
                  handleAddToCart({
                    productId: selectedProduct.id,
                    name: selectedProduct.name,
                    quantity: 1,
                    basePrice: selectedProduct.basePrice,
                    totalPrice: selectedProduct.basePrice,
                    variations: [
                      { name: 'Size', value: 'Medium' },
                      { name: 'Sugar', value: '50%' },
                      { name: 'Ice', value: '100%' }
                    ],
                    toppings: []
                  });
                }}
              >
                Add to Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;