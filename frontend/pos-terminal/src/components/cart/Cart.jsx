import React from 'react';
import PropTypes from 'prop-types';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import useOfflineSync from '../../hooks/useOfflineSync';

/**
 * Main Cart component that displays items and summary
 */
const Cart = ({ 
  items, 
  subtotal, 
  tax,
  total, 
  onRemoveItem, 
  onUpdateQuantity, 
  onCheckout 
}) => {
  const { isOnline } = useOfflineSync();
  
  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Current Order</h2>
        {!isOnline && (
          <div className="offline-badge">Offline Mode</div>
        )}
      </div>
      
      <div className="cart-content">
        {items.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <small>Add items from the product list to start an order</small>
          </div>
        ) : (
          <div className="cart-items-list">
            {items.map(item => (
              <CartItem
                key={item.cartId}
                item={item}
                onRemove={onRemoveItem}
                onQuantityChange={onUpdateQuantity}
              />
            ))}
          </div>
        )}
      </div>
      
      <CartSummary
        subtotal={subtotal}
        tax={tax}
        total={total}
        onCheckout={onCheckout}
        isCartEmpty={items.length === 0}
        isOnline={isOnline}
      />
    </div>
  );
};

Cart.propTypes = {
  items: PropTypes.array.isRequired,
  subtotal: PropTypes.number.isRequired,
  tax: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onCheckout: PropTypes.func.isRequired
};

export default Cart;