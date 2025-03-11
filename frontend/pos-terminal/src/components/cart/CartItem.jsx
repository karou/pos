import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatters';

/**
 * CartItem component for displaying and managing individual items in the cart
 */
const CartItem = ({ 
  item, 
  onRemove, 
  onQuantityChange 
}) => {
  // Handle quantity increase
  const handleIncrease = () => {
    onQuantityChange(item.cartId, item.quantity + 1);
  };
  
  // Handle quantity decrease
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.cartId, item.quantity - 1);
    }
  };
  
  return (
    <div className="cart-item">
      <div className="cart-item-details">
        <div className="cart-item-header">
          <h4 className="cart-item-name">{item.name}</h4>
          <button
            className="cart-item-remove"
            onClick={() => onRemove(item.cartId)}
            aria-label="Remove item"
          >
            &times;
          </button>
        </div>
        
        {/* Display variations if any */}
        {item.variations && item.variations.length > 0 && (
          <div className="cart-item-variations">
            {item.variations.map((variation, index) => (
              <span key={index} className="cart-item-variation">
                {variation.name}: {variation.value}
              </span>
            ))}
          </div>
        )}
        
        {/* Display toppings if any */}
        {item.toppings && item.toppings.length > 0 && (
          <div className="cart-item-toppings">
            {item.toppings.map((topping, index) => (
              <span key={index} className="cart-item-topping">
                + {topping.name}
              </span>
            ))}
          </div>
        )}
        
        {/* Display special instructions if any */}
        {item.specialInstructions && (
          <div className="cart-item-instructions">
            <small>{item.specialInstructions}</small>
          </div>
        )}
      </div>
      
      <div className="cart-item-controls">
        <div className="cart-item-quantity">
          <button
            className="quantity-button"
            onClick={handleDecrease}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="quantity-value">{item.quantity}</span>
          <button
            className="quantity-button"
            onClick={handleIncrease}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        
        <div className="cart-item-price">
          {formatCurrency(item.totalPrice)}
        </div>
      </div>
    </div>
  );
};

CartItem.propTypes = {
  item: PropTypes.shape({
    cartId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    totalPrice: PropTypes.number.isRequired,
    variations: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
      })
    ),
    toppings: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired
      })
    ),
    specialInstructions: PropTypes.string
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  onQuantityChange: PropTypes.func.isRequired
};

export default CartItem;