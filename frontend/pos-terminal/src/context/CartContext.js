import React, { createContext, useState, useContext, useEffect } from 'react';
import { saveOfflineOrder } from '../services/offline';

// Create cart context
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Cart state
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [orderType, setOrderType] = useState('takeaway'); // 'takeaway', 'dine-in', 'delivery'
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Store ID from localStorage or default
  const storeId = localStorage.getItem('storeId') || '1';
  
  // Tax rate (can be fetched from API or settings)
  const taxRate = 0.07; // 7%
  
  // Update totals when items change
  useEffect(() => {
    calculateTotals();
  }, [items]);
  
  // Calculate order totals
  const calculateTotals = () => {
    const subtotalValue = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const taxValue = subtotalValue * taxRate;
    
    setSubtotal(subtotalValue);
    setTax(taxValue);
    setTotal(subtotalValue + taxValue);
  };
  
  // Add item to cart
  const addItem = (item) => {
    // Generate a unique cartId for this item
    const cartId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    const newItem = {
      ...item,
      cartId
    };
    
    setItems(prevItems => [...prevItems, newItem]);
  };
  
  // Remove item from cart
  const removeItem = (cartId) => {
    setItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
  };
  
  // Update item quantity
  const updateItemQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeItem(cartId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.cartId === cartId) {
          const newTotalPrice = (item.totalPrice / item.quantity) * quantity;
          return { ...item, quantity, totalPrice: newTotalPrice };
        }
        return item;
      })
    );
  };
  
  // Clear cart
  const clearCart = () => {
    setItems([]);
    setCustomerName('');
    setTableNumber('');
    setSpecialInstructions('');
  };
  
  // Create an order from the cart
  const createOrder = async (isOffline = false) => {
    if (items.length === 0) {
      throw new Error('Cannot create an order with an empty cart');
    }
    
    const orderData = {
      store: storeId,
      items: items.map(item => ({
        product: item.productId,
        name: item.name,
        quantity: item.quantity,
        basePrice: item.basePrice,
        variations: item.variations || [],
        toppings: item.toppings || [],
        subtotal: item.totalPrice
      })),
      subtotal,
      tax,
      total,
      orderType,
      customerName: customerName || undefined,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      specialInstructions: specialInstructions || undefined,
      createdAt: new Date().toISOString()
    };
    
    if (isOffline) {
      // Save order locally for later sync
      const offlineOrder = await saveOfflineOrder(orderData);
      clearCart();
      return offlineOrder;
    }
    
    // When online, we'll return the order data to be processed by the API
    return orderData;
  };
  
  // Context value
  const value = {
    items,
    subtotal,
    tax,
    total,
    orderType,
    customerName,
    tableNumber,
    specialInstructions,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    setOrderType,
    setCustomerName,
    setTableNumber,
    setSpecialInstructions,
    createOrder
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;