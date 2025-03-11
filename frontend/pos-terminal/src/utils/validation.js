/**
 * Utility functions for form and data validation
 */

/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate that a string is not empty
   * @param {string} value - String to check
   * @returns {boolean} - Whether string is not empty
   */
  export const isNotEmpty = (value) => {
    return value !== null && value !== undefined && value.trim() !== '';
  };
  
  /**
   * Validate a phone number
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - Whether phone number is valid
   */
  export const isValidPhone = (phone) => {
    // Basic check for digits, spaces, dashes, and parentheses
    const phoneRegex = /^[0-9()\-\s+]{10,20}$/;
    return phoneRegex.test(phone);
  };
  
  /**
   * Validate a price/currency value
   * @param {string|number} price - Price to validate
   * @returns {boolean} - Whether price is valid
   */
  export const isValidPrice = (price) => {
    if (typeof price === 'number') {
      return price >= 0;
    }
    
    if (typeof price === 'string') {
      return /^\d+(\.\d{1,2})?$/.test(price);
    }
    
    return false;
  };
  
  /**
   * Validate credit card number using Luhn algorithm
   * @param {string} cardNumber - Credit card number to validate
   * @returns {boolean} - Whether card number is valid
   */
  export const isValidCreditCard = (cardNumber) => {
    // Remove spaces and non-digits
    const sanitized = cardNumber.replace(/\D/g, '');
    
    if (sanitized.length < 13 || sanitized.length > 19) {
      return false;
    }
    
    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  };
  
  /**
   * Validate credit card expiry date (MM/YY format)
   * @param {string} expiry - Expiry date to validate (MM/YY format)
   * @returns {boolean} - Whether expiry date is valid
   */
  export const isValidCardExpiry = (expiry) => {
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!expiryRegex.test(expiry)) {
      return false;
    }
    
    // Extract month and year
    const parts = expiry.split('/');
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10) + 2000; // Convert to 4-digit year
    
    // Create date objects for comparison
    const now = new Date();
    const expiryDate = new Date(year, month);
    
    // Set to first day of the month for accurate comparison
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    
    // Check if the card has expired
    return expiryDate >= now;
  };
  
  /**
   * Validate credit card CVV code
   * @param {string} cvv - CVV code to validate
   * @returns {boolean} - Whether CVV is valid
   */
  export const isValidCVV = (cvv) => {
    return /^[0-9]{3,4}$/.test(cvv);
  };
  
  /**
   * Validate a ZIP/Postal code (US or Canada)
   * @param {string} zip - ZIP/Postal code to validate
   * @returns {boolean} - Whether ZIP/Postal code is valid
   */
  export const isValidZipCode = (zip) => {
    // US ZIP code (5 digits or 5+4)
    const usZipRegex = /^\d{5}(-\d{4})?$/;
    
    // Canadian postal code (A1A 1A1)
    const caPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    
    return usZipRegex.test(zip) || caPostalRegex.test(zip);
  };
  
  /**
   * Validate order data before submission
   * @param {Object} order - Order data to validate
   * @returns {Object} - Validation result with isValid flag and errors object
   */
  export const validateOrder = (order) => {
    const errors = {};
    
    // Check for items
    if (!order.items || order.items.length === 0) {
      errors.items = 'Order must contain at least one item';
    }
    
    // Check for required fields
    if (order.orderType === 'dine-in' && !order.tableNumber) {
      errors.tableNumber = 'Table number is required for dine-in orders';
    }
    
    // Validate totals
    if (typeof order.subtotal !== 'number' || order.subtotal <= 0) {
      errors.subtotal = 'Invalid subtotal amount';
    }
    
    if (typeof order.total !== 'number' || order.total <= 0) {
      errors.total = 'Invalid total amount';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Validate login credentials
   * @param {Object} credentials - Login credentials
   * @returns {Object} - Validation result with isValid flag and errors object
   */
  export const validateLoginCredentials = (credentials) => {
    const errors = {};
    
    if (!isNotEmpty(credentials.username)) {
      errors.username = 'Username is required';
    }
    
    if (!isNotEmpty(credentials.password)) {
      errors.password = 'Password is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };