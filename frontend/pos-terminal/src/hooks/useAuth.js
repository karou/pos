import { useState, useEffect } from 'react';

/**
 * Custom hook for authentication
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real implementation, verify token with server
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // In a real implementation, call API
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ email, password })
      // });
      
      // Mock successful login
      const mockUser = {
        id: '1',
        name: 'Demo User',
        email: email,
        role: 'cashier',
        store: '1',
        token: 'mock-jwt-token'
      };
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setError(null);
      
      return mockUser;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  
  return {
    user,
    loading,
    error,
    login,
    logout
  };
};

export default useAuth;
