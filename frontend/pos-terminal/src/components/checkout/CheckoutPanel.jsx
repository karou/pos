import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useCart } from '../../context/CartContext';
import PaymentForm from './PaymentForm';
import { ordersAPI } from '../../services/api';
import useOfflineSync from '../../hooks/useOfflineSync';

/**
 * Checkout panel for finalizing orders
 */
const CheckoutPanel = ({ onClose, onOrderComplete }) => {
  const [step, setStep] = useState('details'); // 'details', 'payment', 'confirmation'
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  
  const { 
    items, 
    subtotal, 
    tax, 
    total, 
    orderType, 
    setOrderType, 
    customerName, 
    setCustomerName,
    tableNumber,
    setTableNumber,
    specialInstructions,
    setSpecialInstructions,
    createOrder,
    clearCart
  } = useCart();
  
  const { isOnline } = useOfflineSync();
  
  // Handle order type change
  const handleOrderTypeChange = (e) => {
    setOrderType(e.target.value);
  };
  
  // Move to payment step
  const proceedToPayment = () => {
    // Validate form if needed
    if (orderType === 'dine-in' && !tableNumber) {
      setError('Table number is required for dine-in orders');
      return;
    }
    
    setError(null);
    setStep('payment');
  };
  
  // Go back to order details
  const backToDetails = () => {
    setStep('details');
  };
  
  // Process payment and complete order
  const handlePayment = async (paymentMethod) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create order based on online/offline status
      let orderData;
      
      if (!isOnline) {
        // Create offline order
        orderData = await createOrder(true);
        
        setOrderNumber('OFFLINE-' + Date.now().toString().slice(-6));
        setStep('confirmation');
        
        if (onOrderComplete) {
          onOrderComplete({
            success: true,
            offline: true,
            orderNumber
          });
        }
      } else {
        // Create online order
        orderData = await createOrder(false);
        
        // Submit to API
        const response = await ordersAPI.createOrder(orderData);
        const createdOrder = response.data.data;
        
        // Process payment (in a real app, this would be a separate API call)
        // const paymentResponse = await paymentsAPI.processPayment({
        //   order: createdOrder._id,
        //   amount: total,
        //   paymentMethod,
        //   store: orderData.store
        // });
        
        setOrderNumber(createdOrder.orderNumber);
        setStep('confirmation');
        
        if (onOrderComplete) {
          onOrderComplete({
            success: true,
            offline: false,
            order: createdOrder
          });
        }
      }
      
      // Clear cart
      clearCart();
    } catch (error) {
      console.error('Error completing order:', error);
      setError(error.message || 'Failed to complete order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="checkout-panel">
      <div className="checkout-header">
        <h2>Checkout</h2>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>
      
      {step === 'details' && (
        <div className="checkout-details">
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-items">
              {items.map((item) => (
                <div key={item.cartId} className="summary-item">
                  <div className="item-info">
                    <span className="item-quantity">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                    
                    {/* Show variations */}
                    {item.variations && item.variations.length > 0 && (
                      <div className="item-variations">
                        {item.variations.map((variation, index) => (
                          <span key={index} className="item-variation">
                            {variation.name}: {variation.value}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Show toppings */}
                    {item.toppings && item.toppings.length > 0 && (
                      <div className="item-toppings">
                        {item.toppings.map((topping, index) => (
                          <span key={index} className="item-topping">
                            + {topping.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="item-price">${item.totalPrice.toFixed(2)}</div>
                </div>
              ))}
            </div>
            
            <div className="order-totals">
              <div className="total-line">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>Tax ({(tax / subtotal * 100).toFixed(1)}%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="total-line total-final">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="order-details-form">
            <div className="form-group">
              <label>Order Type</label>
              <div className="order-type-options">
                <label className={`order-type-option ${orderType === 'takeaway' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="orderType"
                    value="takeaway"
                    checked={orderType === 'takeaway'}
                    onChange={handleOrderTypeChange}
                  />
                  <span>Takeaway</span>
                </label>
                <label className={`order-type-option ${orderType === 'dine-in' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="orderType"
                    value="dine-in"
                    checked={orderType === 'dine-in'}
                    onChange={handleOrderTypeChange}
                  />
                  <span>Dine-in</span>
                </label>
                <label className={`order-type-option ${orderType === 'delivery' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="orderType"
                    value="delivery"
                    checked={orderType === 'delivery'}
                    onChange={handleOrderTypeChange}
                  />
                  <span>Delivery</span>
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="customerName">Customer Name (Optional)</label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>
            
            {orderType === 'dine-in' && (
              <div className="form-group">
                <label htmlFor="tableNumber">Table Number</label>
                <input
                  type="text"
                  id="tableNumber"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Enter table number"
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="specialInstructions">Special Instructions (Optional)</label>
              <textarea
                id="specialInstructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Add any special instructions..."
                rows={3}
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="checkout-actions">
              <button className="cancel-button" onClick={onClose}>
                Cancel
              </button>
              <button className="proceed-button" onClick={proceedToPayment}>
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
      
      {step === 'payment' && (
        <PaymentForm
          total={total}
          isProcessing={isProcessing}
          error={error}
          onCancel={backToDetails}
          onPaymentComplete={handlePayment}
          isOffline={!isOnline}
        />
      )}
      
      {step === 'confirmation' && (
        <div className="checkout-confirmation">
          <div className="confirmation-icon">✓</div>
          <h3>Order Completed!</h3>
          
          {isOnline ? (
            <p>Your order #{orderNumber} has been placed successfully.</p>
          ) : (
            <>
              <p>Your order has been saved offline.</p>
              <p>It will be processed when you're back online.</p>
              <p>Temporary order #: {orderNumber}</p>
            </>
          )}
          
          <div className="confirmation-actions">
            <button className="close-button" onClick={onClose}>
              Close
            </button>
            <button className="new-order-button" onClick={onClose}>
              New Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

CheckoutPanel.propTypes = {
  onClose: PropTypes.func.isRequired,
  onOrderComplete: PropTypes.func
};

export default CheckoutPanel;