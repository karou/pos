import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { productsAPI, isMockMode } from '../services/api';
import { getCachedProducts, getCachedCategories, cacheProducts, cacheCategories } from '../services/offline';
import useOfflineSync from '../hooks/useOfflineSync';
import { useNotification } from './NotificationContext';
import { products as mockProducts, categories as mockCategories } from '../services/mockApi';

// Create product context
const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // For rate limiting and retry handling
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const retryTimeoutRef = useRef(null);
  
  const { isOnline } = useOfflineSync();
  const notificationContext = useNotification();
  const showError = notificationContext?.showError || console.error;
  const showWarning = notificationContext?.showWarning || console.warn;
  const showInfo = notificationContext?.showInfo || console.info;
  
  // Clear any pending retry timeout when component unmounts
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  
  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [isOnline]);
  
  // Automatically retry after rate limit cooldown
  useEffect(() => {
    if (rateLimited && retryAfter > 0) {
      showInfo(`API rate limited. Will retry in ${retryAfter} seconds...`, { autoHideDuration: 5000 });
      
      retryTimeoutRef.current = setTimeout(() => {
        console.log('Retrying after rate limit cooldown...');
        setRateLimited(false);
        fetchProducts(true);
      }, retryAfter * 1000);
      
      return () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
      };
    }
  }, [rateLimited, retryAfter]);
  
  // Filter products based on category and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
                            (product.category && product.category.id === selectedCategory);
    const matchesSearch = !searchTerm || 
                         product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Debounce function to prevent too many API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  
  // Fetch products from API or cache with debounce for rate-limited environments
  const fetchProducts = debounce(async (forceRefresh = false) => {
    // Don't retry if we're currently rate limited
    if (rateLimited) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (isOnline && !forceRefresh) {
        // Check cache first if we're not forcing refresh
        const [cachedProducts, cachedCategories] = await Promise.all([
          getCachedProducts(),
          getCachedCategories()
        ]);
        
        if (cachedProducts.length > 0 && cachedCategories.length > 0) {
          setProducts(cachedProducts);
          setCategories(cachedCategories);
          setLoading(false);
          
          // Refresh in background
          fetchFromApi(false);
          return;
        }
      }
      
      await fetchFromApi(true);
      
    } catch (error) {
      console.error('Error in product fetch logic:', error);
      
      // Check for rate limiting error
      if (error.isRateLimited) {
        setRateLimited(true);
        setRetryAfter(error.retryAfter || 5);
        showWarning('Too many requests. Will retry automatically.', { autoHideDuration: 5000 });
      } else {
        setError('An unexpected error occurred while fetching products.');
        if (showError) {
          showError('An unexpected error occurred while fetching products.');
        }
      }
      
      setLoading(false);
    }
  }, 300);
  
  // Fetch from API with error handling
  const fetchFromApi = async (updateUI = true) => {
    try {
      // Fetch from API
      const [productsResponse, categoriesResponse] = await Promise.all([
        productsAPI.getAllProducts(),
        productsAPI.getCategories()
      ]);
      
      const fetchedProducts = productsResponse?.data?.data || [];
      const fetchedCategories = categoriesResponse?.data?.data || [];
      
      if (updateUI) {
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        setLoading(false);
      }
      
      // Reset rate limited status if successful
      setRateLimited(false);
      
      // Cache for offline use
      await cacheProducts(fetchedProducts);
      await cacheCategories(fetchedCategories);
      
    } catch (error) {
      console.error('Error fetching from API:', error);
      
      // Check for rate limiting error
      if (error.isRateLimited) {
        throw error; // Let the calling function handle rate limiting
      }
      
      // If API fails and we need to update UI, try to use cached data
      if (updateUI) {
        const [cachedProducts, cachedCategories] = await Promise.all([
          getCachedProducts(),
          getCachedCategories()
        ]);
        
        if (cachedProducts.length > 0) {
          setProducts(cachedProducts);
          if (showWarning) {
            showWarning('Using cached products. Some data may not be up to date.', { autoHideDuration: 3000 });
          }
        } else if (isMockMode()) {
          // Use mock data as last resort if in mock mode
          setProducts(mockProducts);
          if (showWarning) {
            showWarning('Using sample product data for development.', { autoHideDuration: 3000 });
          }
        } else {
          setError('Failed to load products. Please try again later.');
          if (showError) {
            showError('Failed to load products. Please try again later.');
          }
        }
        
        if (cachedCategories.length > 0) {
          setCategories(cachedCategories);
        } else if (isMockMode()) {
          setCategories(mockCategories);
        } else {
          // Create a default "All" category if nothing else is available
          setCategories([{ id: 'all', name: 'All Products' }]);
        }
        
        setLoading(false);
      }
      
      if (updateUI && !isOnline) {
        setError('You are currently offline. Using cached products.');
      }
      
      throw error; // Re-throw to allow further handling
    }
  };
  
  // Get a single product by ID
  const getProductById = (productId) => {
    return products.find(product => product.id === productId);
  };
  
  // Calculate custom product price
  const calculateCustomProductPrice = async (productId, variations, toppings) => {
    if (!isOnline) {
      // Offline calculation
      let basePrice = 0;
      const product = getProductById(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      basePrice = product.basePrice;
      
      // Add variation prices
      let variationTotal = 0;
      if (variations && product.variations) {
        Object.entries(variations).forEach(([variationId, optionId]) => {
          const variation = product.variations.find(v => v.id === variationId);
          if (variation) {
            const option = variation.options.find(o => o.id === optionId);
            if (option && option.priceAdjustment) {
              variationTotal += option.priceAdjustment;
            }
          }
        });
      }
      
      // Add topping prices
      let toppingTotal = 0;
      if (toppings && toppings.length > 0 && product.toppings) {
        toppings.forEach(toppingId => {
          const topping = product.toppings.find(t => t.id === toppingId);
          if (topping && topping.price) {
            toppingTotal += topping.price;
          }
        });
      }
      
      return basePrice + variationTotal + toppingTotal;
    } else {
      // Online calculation via API
      try {
        const response = await productsAPI.calculatePrice(productId, variations, toppings);
        return response.data.price;
      } catch (error) {
        console.error('Error calculating price:', error);
        // Fallback to offline calculation
        return calculateCustomProductPrice(productId, variations, toppings);
      }
    }
  };
  
  // Force reload products
  const refreshProducts = () => {
    // Reset rate limiting status to allow a fresh attempt
    setRateLimited(false);
    return fetchProducts(true);
  };
  
  // Context value
  const value = {
    products,
    categories,
    filteredProducts,
    selectedCategory,
    searchTerm,
    loading,
    error,
    rateLimited,
    setSelectedCategory,
    setSearchTerm,
    fetchProducts,
    refreshProducts,
    getProductById,
    calculateCustomProductPrice
  };
  
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

// Custom hook to use product context
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export default ProductContext;