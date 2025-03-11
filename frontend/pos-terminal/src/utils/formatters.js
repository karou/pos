/**
 * Utility functions for formatting data
 */

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (defaults to USD)
 * @param {string} locale - Locale for formatting (defaults to en-US)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '$0.00';
    }
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount);
  };
  
  /**
   * Format date to locale date string
   * @param {string|Date} date - Date to format
   * @param {Object} options - Intl.DateTimeFormat options
   * @param {string} locale - Locale for formatting (defaults to en-US)
   * @returns {string} - Formatted date string
   */
  export const formatDate = (date, options = {}, locale = 'en-US') => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat(
      locale, 
      { ...defaultOptions, ...options }
    ).format(dateObj);
  };
  
  /**
   * Format date to locale time string
   * @param {string|Date} date - Date to format
   * @param {Object} options - Intl.DateTimeFormat options
   * @param {string} locale - Locale for formatting (defaults to en-US)
   * @returns {string} - Formatted time string
   */
  export const formatTime = (date, options = {}, locale = 'en-US') => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return new Intl.DateTimeFormat(
      locale, 
      { ...defaultOptions, ...options }
    ).format(dateObj);
  };
  
  /**
   * Format date and time
   * @param {string|Date} date - Date to format
   * @param {Object} options - Intl.DateTimeFormat options
   * @param {string} locale - Locale for formatting (defaults to en-US)
   * @returns {string} - Formatted date and time string
   */
  export const formatDateTime = (date, options = {}, locale = 'en-US') => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return new Intl.DateTimeFormat(
      locale, 
      { ...defaultOptions, ...options }
    ).format(dateObj);
  };
  
  /**
   * Format relative time (e.g. "2 hours ago")
   * @param {string|Date} date - Date to format
   * @param {string} locale - Locale for formatting (defaults to en-US)
   * @returns {string} - Formatted relative time string
   */
  export const formatRelativeTime = (date, locale = 'en-US') => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - dateObj;
    
    // Convert to seconds
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) {
      return diffSecs <= 5 ? 'just now' : `${diffSecs} seconds ago`;
    }
    
    // Convert to minutes
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Convert to hours
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Convert to days
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
    
    // Use standard date format for older dates
    return formatDate(dateObj);
  };
  
  /**
   * Format percentage
   * @param {number} value - Value to format as percentage
   * @param {number} decimals - Number of decimal places (defaults to 1)
   * @returns {string} - Formatted percentage string
   */
  export const formatPercentage = (value, decimals = 1) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0%';
    }
    
    return `${value.toFixed(decimals)}%`;
  };
  
  /**
   * Format phone number to (XXX) XXX-XXXX
   * @param {string} phone - Phone number to format
   * @returns {string} - Formatted phone number
   */
  export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid US phone number
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return phone;
  };
  
  /**
   * Format number with commas
   * @param {number} value - Value to format
   * @param {number} decimals - Number of decimal places (defaults to 0)
   * @returns {string} - Formatted number string
   */
  export const formatNumber = (value, decimals = 0) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0';
    }
    
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  /**
   * Truncate text and add ellipsis if needed
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} - Truncated text
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) {
      return text;
    }
    
    return text.slice(0, maxLength) + '...';
  };