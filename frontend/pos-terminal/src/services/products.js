import api from './api';
import { getCachedProducts, getCachedCategories, cacheProducts, cacheCategories } from './offline';
import config from '../config';

/**
 * Service for handling products
 */

// Fetch all products
export const fetchProducts = async (forceRefresh = false) => {
  try {
    // Check for cached products if not forcing refresh
    if (!forceRefresh) {
      const cachedProducts = await getCachedProducts();
      if (cachedProducts && cachedProducts.length > 0) {
        return cachedProducts;
      }
    }
    
    // Fetch from API
    const storeId = localStorage.getItem('storeId') || config.defaults.storeId;
    const response = await api.get(`/products?storeId=${storeId}`);
    const products = response.data.data || [];
    
    // Cache for offline use
    await cacheProducts(products);
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // If API fails, try to use cached data
    const cachedProducts = await getCachedProducts();
    if (cachedProducts && cachedProducts.length > 0) {
      return cachedProducts;
    }
    
    throw error;
  }
};

// Fetch product categories
export const fetchCategories = async (forceRefresh = false) => {
  try {
    // Check for cached categories if not forcing refresh
    if (!forceRefresh) {
      const cachedCategories = await getCachedCategories();
      if (cachedCategories && cachedCategories.length > 0) {
        return cachedCategories;
      }
    }
    
    // Fetch from API
    const storeId = localStorage.getItem('storeId') || config.defaults.storeId;
    const response = await api.get(`/products/categories?storeId=${storeId}`);
    const categories = response.data.data || [];
    
    // Cache for offline use
    await cacheCategories(categories);
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // If API fails, try to use cached data
    const cachedCategories = await getCachedCategories();
    if (cachedCategories && cachedCategories.length > 0) {
      return cachedCategories;
    }
    
    throw error;
  }
};

// Fetch a single product by ID
export const fetchProductById = async (productId) => {
  try {
    // Try to find in cache first
    const cachedProducts = await getCachedProducts();
    const cachedProduct = cachedProducts.find(p => p.id === productId);
    
    if (cachedProduct) {
      return cachedProduct;
    }
    
    // Fetch from API
    const response = await api.get(`/products/${productId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

// Calculate custom product price
export const calculateProductPrice = async (productId, variations, toppings) => {
  try {
    // Try offline calculation first
    const cachedProducts = await getCachedProducts();
    const product = cachedProducts.find(p => p.id === productId);
    
    if (product) {
      let price = product.basePrice || 0;
      
      // Add variation prices
      if (variations && product.variations) {
        Object.entries(variations).forEach(([variationId, optionId]) => {
          const variation = product.variations.find(v => v.id === variationId);
          if (variation) {
            const option = variation.options.find(o => o.id === optionId);
            if (option && option.priceAdjustment) {
              price += option.priceAdjustment;
            }
          }
        });
      }
      
      // Add topping prices
      if (toppings && toppings.length > 0 && product.toppings) {
        toppings.forEach(toppingId => {
          const topping = product.toppings.find(t => t.id === toppingId);
          if (topping && topping.price) {
            price += topping.price;
          }
        });
      }
      
      return price;
    }
    
    // If offline calculation fails, try API
    if (navigator.onLine) {
      const response = await api.post('/products/calculate-price', {
        productId,
        variations,
        toppings
      });
      
      return response.data.price;
    }
    
    throw new Error('Could not calculate product price');
  } catch (error) {
    console.error('Error calculating product price:', error);
    throw error;
  }
};

// Search products
export const searchProducts = async (query) => {
  try {
    // Try to search in cache first
    const cachedProducts = await getCachedProducts();
    
    if (cachedProducts && cachedProducts.length > 0) {
      // Simple search implementation
      const normalizedQuery = query.toLowerCase().trim();
      
      return cachedProducts.filter(product => 
        product.name.toLowerCase().includes(normalizedQuery) ||
        (product.description && product.description.toLowerCase().includes(normalizedQuery)) ||
        (product.category && product.category.name.toLowerCase().includes(normalizedQuery))
      );
    }
    
    // If not found in cache, search via API
    if (navigator.onLine) {
      const storeId = localStorage.getItem('storeId') || config.defaults.storeId;
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}&storeId=${storeId}`);
      return response.data.data || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Get popular products
export const getPopularProducts = async (limit = 10) => {
  try {
    const storeId = localStorage.getItem('storeId') || config.defaults.storeId;
    const response = await api.get(`/products/popular?limit=${limit}&storeId=${storeId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching popular products:', error);
    
    // If API fails, try to simulate popular products from cache
    try {
      const cachedProducts = await getCachedProducts();
      // Just return first few products if we can't get real popular ones
      return cachedProducts.slice(0, limit).map(product => ({
        ...product,
        isPopular: true
      }));
    } catch (cacheError) {
      return [];
    }
  }
};