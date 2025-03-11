import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatters';

/**
 * CartSummary component for displaying totals and checkout button
 */
const CartSummary = ({ 
  subtotal, 
  tax, 
  total, 
  onCheckout, 
  isCartEmpty,
  isOnline
}) => {
  return (
    <div className="cart-summary">
      <div className="summary-totals">
        <div className="summary-line">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="summary-line">
          <span>Tax ({(tax / subtotal * 100).toFixed(1)}%):</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="summary-line total-line">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
      
      <button
        className="checkout-button"
        onClick={onCheckout}
        disabled={isCartEmpty}
      >
        {isOnline ? 'Checkout' : 'Checkout (Offline)'}
      </button>
      
      {!isOnline && (
        <div className="offline-notice">
          <small>
            You are currently offline. Orders will be saved locally and synced when you reconnect.
          </small>
        </div>
      )}
    </div>
  );
};

CartSummary.propTypes = {
  subtotal: PropTypes.number.isRequired,
  tax: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onCheckout: PropTypes.func.isRequired,
  isCartEmpty: PropTypes.bool.isRequired,
  isOnline: PropTypes.bool
};

CartSummary.defaultProps = {
  isOnline: true
};

export default CartSummary;