/**
 * Utility functions for authentication
 */

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

/**
 * Store authentication token in localStorage
 * @param {string} token - JWT token
 */
export const storeAuthToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Get stored authentication token from localStorage
 * @returns {string|null} - JWT token or null if not found
 */
export const getStoredAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Clear authentication token from localStorage
 */
export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Check if auth token exists and is valid
 * @returns {boolean} - Whether user is authenticated
 */
export const isAuthenticated = () => {
  const token = getStoredAuthToken();
  if (!token) return false;
  
  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    return Date.now() < expiry;
  } catch (error) {
    console.error('Error parsing token:', error);
    return false;
  }
};

/**
 * Store user data in localStorage
 * @param {Object} user - User data
 */
export const storeUserData = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get stored user data from localStorage
 * @returns {Object|null} - User data or null if not found
 */
export const getStoredUserData = () => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Clear user data from localStorage
 */
export const clearUserData = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Store authentication data (token and user)
 * @param {Object} authData - Authentication data containing token and user
 */
export const storeAuthData = (authData) => {
  storeAuthToken(authData.token);
  storeUserData(authData.user);
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  clearAuthToken();
  clearUserData();
};

/**
 * Check if user has required role
 * @param {string|string[]} requiredRole - Required role(s)
 * @returns {boolean} - Whether user has required role
 */
export const hasRole = (requiredRole) => {
  const user = getStoredUserData();
  if (!user || !user.role) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user.role === requiredRole;
};