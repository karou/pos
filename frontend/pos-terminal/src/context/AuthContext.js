// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Check existing session
    useEffect(() => {
      const checkAuth = async () => {
        // Get token from storage
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          try {
            // Validate token with your auth service
            const response = await api.get('/api/auth/validate');
            if (response.data.success) {
              setUser(response.data.user);
              setIsAuthenticated(true);
            } else {
              // Invalid token
              localStorage.removeItem('auth_token');
              setIsAuthenticated(false);
              setUser(null);
            }
          } catch (error) {
            console.error('Auth validation failed:', error);
            localStorage.removeItem('auth_token');
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
        setIsLoading(false);
      };
      
      checkAuth();
    }, []);
    
    // Login function
    const login = async (credentials) => {
      try {
        // Make this a real API call, not mockup
        const response = await api.post('/api/auth/login', credentials);

        console.log('Login result:', response);
        
        if (response.data.status === "success") {
          const { tokens, user } = response.data.data;
          
          // Store token
          localStorage.setItem('auth_token', tokens.accessToken);
          
          // Update state
          setUser(user);
          setIsAuthenticated(true);
          
          return { success: true };
        } else {
          return { success: false, message: response.data.message };
        }
      } catch (error) {
        console.error('Login API error:', error);
        return { success: false, message: error.response?.data?.message || 'Authentication failed' };
      }
    };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};