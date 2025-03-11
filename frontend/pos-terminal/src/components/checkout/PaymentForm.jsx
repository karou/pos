import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Payment form component for handling order payments
 */
const PaymentForm = ({ 
  total, 
  isProcessing, 
  error, 
  onCancel, 
  onPaymentComplete,
  isOffline
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // Calculate change amount for cash payments
  const changeAmount = cashReceived 
    ? Math.max(0, parseFloat(cashReceived) - total).toFixed(2) 
    : '0.00';
  
  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    }
    
    return value;
  };
  
  // Format card expiry date (MM/YY)
  const formatCardExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };
  
  // Handle cash amount input
  const handleCashAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setCashReceived(value);
    }
  };
  
  // Handle card number input
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };
  
  // Handle card expiry input
  const handleCardExpiryChange = (e) => {
    const formattedValue = formatCardExpiry(e.target.value);
    setCardExpiry(formattedValue);
  };
  
  // Handle CVV input
  const handleCardCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardCvv(value);
    }
  };
  
  // Handle payment submission
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    // Validate payment details
    if (paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < total)) {
      // Show error message
      return;
    }
    
    if (paymentMethod === 'credit_card') {
      // In a real app, would validate card details
      if (cardNumber.replace(/\s/g, '').length < 16 || 
          !cardExpiry || 
          cardCvv.length < 3) {
        // Show error message
        return;
      }
    }
    
    // Process payment
    onPaymentComplete(paymentMethod);
  };
  
  // Determine if submit button should be disabled
  const isSubmitDisabled = () => {
    if (isProcessing) return true;
    
    if (paymentMethod === 'cash') {
      return !cashReceived || parseFloat(cashReceived) < total;
    }
    
    if (paymentMethod === 'credit_card') {
      return cardNumber.replace(/\s/g, '').length < 16 || 
             !cardExpiry || 
             cardCvv.length < 3;
    }
    
    return false;
  };
  
  return (
    <div className="payment-form">
      <h3>Payment</h3>
      
      {isOffline && (
        <div className="offline-warning">
          <p>You are currently offline. Payment will be processed when you're back online.</p>
        </div>
      )}
      
      <form onSubmit={handlePaymentSubmit}>
        <div className="form-group">
          <label>Payment Method</label>
          <div className="payment-method-options">
            <label className={`payment-method-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={handlePaymentMethodChange}
              />
              <span>Cash</span>
            </label>
            <label className={`payment-method-option ${paymentMethod === 'credit_card' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="credit_card"
                checked={paymentMethod === 'credit_card'}
                onChange={handlePaymentMethodChange}
              />
              <span>Credit Card</span>
            </label>
            <label className={`payment-method-option ${paymentMethod === 'mobile_pay' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="mobile_pay"
                checked={paymentMethod === 'mobile_pay'}
                onChange={handlePaymentMethodChange}
              />
              <span>Mobile Pay</span>
            </label>
          </div>
        </div>
        
        {paymentMethod === 'cash' && (
          <div className="cash-payment-section">
            <div className="form-group">
              <label htmlFor="cashReceived">Cash Received</label>
              <div className="cash-input-wrapper">
                <span className="cash-prefix">$</span>
                <input
                  type="text"
                  id="cashReceived"
                  value={cashReceived}
                  onChange={handleCashAmountChange}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div className="payment-summary">
              <div className="summary-line">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Cash Received:</span>
                <span>${cashReceived || '0.00'}</span>
              </div>
              <div className="summary-line change-line">
                <span>Change:</span>
                <span>${changeAmount}</span>
              </div>
            </div>
            
            {parseFloat(cashReceived || 0) < total && (
              <div className="error-message">Cash received must be at least equal to the total amount</div>
            )}
          </div>
        )}
        
        {paymentMethod === 'credit_card' && (
          <div className="card-payment-section">
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="XXXX XXXX XXXX XXXX"
                maxLength={19}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cardExpiry">Expiry Date</label>
                <input
                  type="text"
                  id="cardExpiry"
                  value={cardExpiry}
                  onChange={handleCardExpiryChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cardCvv">CVV</label>
                <input
                  type="text"
                  id="cardCvv"
                  value={cardCvv}
                  onChange={handleCardCvvChange}
                  placeholder="XXX"
                  maxLength={4}
                  required
                />
              </div>
            </div>
            
            <div className="payment-summary">
              <div className="summary-line total-line">
                <span>Total Amount:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        
        {paymentMethod === 'mobile_pay' && (
          <div className="mobile-payment-section">
            <div className="qr-code-container">
              <div className="qr-code-placeholder">
                QR Code for Payment
              </div>
              <p>Scan this code with your mobile payment app</p>
            </div>
            
            <div className="payment-summary">
              <div className="summary-line total-line">
                <span>Total Amount:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="payment-actions">
          <button type="button" className="back-button" onClick={onCancel} disabled={isProcessing}>
            Back
          </button>
          <button type="submit" className="complete-button" disabled={isSubmitDisabled()}>
            {isProcessing ? <LoadingSpinner size="small" /> : 'Complete Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

PaymentForm.propTypes = {
  total: PropTypes.number.isRequired,
  isProcessing: PropTypes.bool,
  error: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onPaymentComplete: PropTypes.func.isRequired,
  isOffline: PropTypes.bool
};

PaymentForm.defaultProps = {
  isProcessing: false,
  isOffline: false
};

export default PaymentForm;