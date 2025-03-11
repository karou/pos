import { useState, useEffect } from 'react';
import useOfflineSync from './useOfflineSync';

/**
 * Custom hook for managing products with offline support
 */
export const useProducts = (categoryId = null) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOnline } = useOfflineSync();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        if (isOnline) {
          // Fetch from API in a real implementation
          // const response = await fetch('/api/products');
          // const data = await response.json();
          
          // Mock data for bubble tea products
          const mockCategories = [
            { id: 'category1', name: 'Milk Tea' },
            { id: 'category2', name: 'Fruit Tea' },
            { id: 'category3', name: 'Special Drinks' }
          ];
          
          const mockProducts = [
            {
              id: 'product1',
              name: 'Classic Milk Tea',
              description: 'Traditional milk tea with a rich taste',
              basePrice: 4.50,
              category: { id: 'category1', name: 'Milk Tea' },
              image: 'https://via.placeholder.com/150',
              variations: [
                {
                  id: 'size',
                  name: 'Size',
                  required: true,
                  options: [
                    { id: 'small', name: 'Small', priceAdjustment: -0.50 },
                    { id: 'medium', name: 'Medium', priceAdjustment: 0 },
                    { id: 'large', name: 'Large', priceAdjustment: 0.75 }
                  ]
                },
                {
                  id: 'sugar',
                  name: 'Sugar Level',
                  required: true,
                  options: [
                    { id: 'sugar0', name: '0%', priceAdjustment: 0 },
                    { id: 'sugar30', name: '30%', priceAdjustment: 0 },
                    { id: 'sugar50', name: '50%', priceAdjustment: 0 },
                    { id: 'sugar80', name: '80%', priceAdjustment: 0 },
                    { id: 'sugar100', name: '100%', priceAdjustment: 0 }
                  ]
                },
                {
                  id: 'ice',
                  name: 'Ice Level',
                  required: true,
                  options: [
                    { id: 'ice0', name: '0%', priceAdjustment: 0 },
                    { id: 'ice30', name: '30%', priceAdjustment: 0 },
                    { id: 'ice50', name: '50%', priceAdjustment: 0 },
                    { id: 'ice80', name: '80%', priceAdjustment: 0 },
                    { id: 'ice100', name: '100%', priceAdjustment: 0 }
                  ]
                }
              ],
              toppings: [
                { id: 'topping1', name: 'Boba/Tapioca', price: 0.75 },
                { id: 'topping2', name: 'Grass Jelly', price: 0.75 },
                { id: 'topping3', name: 'Pudding', price: 0.75 },
                { id: 'topping4', name: 'Aloe Vera', price: 0.75 },
                { id: 'topping5', name: 'Red Bean', price: 0.75 }
              ]
            },
            {
              id: 'product2',
              name: 'Taro Milk Tea',
              description: 'Milk tea with taro flavor',
              basePrice: 5.00,
              category: { id: 'category1', name: 'Milk Tea' },
              image: 'https://via.placeholder.com/150',
              variations: [
                {
                  id: 'size',
                  name: 'Size',
                  required: true,
                  options: [
                    { id: 'small', name: 'Small', priceAdjustment: -0.50 },
                    { id: 'medium', name: 'Medium', priceAdjustment: 0 },
                    { id: 'large', name: 'Large', priceAdjustment: 0.75 }
                  ]
                },
                {
                  id: 'sugar',
                  name: 'Sugar Level',
                  required: true,
                  options: [
                    { id: 'sugar0', name: '0%', priceAdjustment: 0 },
                    { id: 'sugar30', name: '30%', priceAdjustment: 0 },
                    { id: 'sugar50', name: '50%', priceAdjustment: 0 },
                    { id: 'sugar80', name: '80%', priceAdjustment: 0 },
                    { id: 'sugar100', name: '100%', priceAdjustment: 0 }
                  ]
                },
                {
                  id: 'ice',
                  name: 'Ice Level',
                  required: true,
                  options: [
                    { id: 'ice0', name: '0%', priceAdjustment: 0 },
                    { id: 'ice30', name: '30%', priceAdjustment: 0 },
                    { id: 'ice50', name: '50%', priceAdjustment: 0 },
                    { id: 'ice80', name: '80%', priceAdjustment: 0 },
                    { id: 'ice100', name: '100%', priceAdjustment: 0 }
                  ]
                }
              ],
              toppings: [
                { id: 'topping1', name: 'Boba/Tapioca', price: 0.75 },
                { id: 'topping2', name: 'Grass Jelly', price: 0.75 },
                { id: 'topping3', name: 'Pudding', price: 0.75 },
                { id: 'topping4', name: 'Aloe Vera', price: 0.75 },
                { id: 'topping5', name: 'Red Bean', price: 0.75 }
              ]
            },
            {
              id: 'product3',
              name: 'Mango Green Tea',
              description: 'Green tea with fresh mango',
              basePrice: 5.25,
              category: { id: 'category2', name: 'Fruit Tea' },
              image: 'https://via.placeholder.com/150',
              variations: [
                {
                  id: 'size',
                  name: 'Size',
                  required: true,
                  options: [
                    { id: 'small', name: 'Small', priceAdjustment: -0.50 },
                    { id: 'medium', name: 'Medium', priceAdjustment: 0 },
                    { id: 'large', name: 'Large', priceAdjustment: 0.75 }
                  ]
                },
                {
                  id: 'sugar',
                  name: 'Sugar Level',
                  required: true,
                  options: [
                    { id: 'sugar0', name: '0%', priceAdjustment: 0 },
                    { id: 'sugar30', name: '30%', priceAdjustment: 0 },
                    { id: 'sugar50', name: '50%', priceAdjustment: 0 },
                    { id: 'sugar80', name: '80%', priceAdjustment: 0 },
                    { id: 'sugar100', name: '100%', priceAdjustment: 0 }
                  ]
                },
                {
                  id: 'ice',
                  name: 'Ice Level',
                  required: true,
                  options: [
                    { id: 'ice0', name: '0%', priceAdjustment: 0 },
                    { id: 'ice30', name: '30%', priceAdjustment: 0 },
                    { id: 'ice50', name: '50%', priceAdjustment: 0 },
                    { id: 'ice80', name: '80%', priceAdjustment: 0 },
                    { id: 'ice100', name: '100%', priceAdjustment: 0 }
                  ]
                }
              ],
              toppings: [
                { id: 'topping1', name: 'Boba/Tapioca', price: 0.75 },
                { id: 'topping2', name: 'Grass Jelly', price: 0.75 },
                { id: 'topping6', name: 'Mango Jelly', price: 0.75 },
                { id: 'topping4', name: 'Aloe Vera', price: 0.75 },
                { id: 'topping7', name: 'Popping Boba', price: 1.00 }
              ]
            }
          ];
          
          // Filter by category if provided
          const filteredProducts = categoryId
            ? mockProducts.filter(p => p.category.id === categoryId)
            : mockProducts;
          
          setProducts(filteredProducts);
          setCategories(mockCategories);
        } else {
          // In a real implementation, fetch from IndexedDB
          // For this example, use mock data
          
          // Retrieve from localStorage for example
          const localProducts = localStorage.getItem('offlineProducts');
          const localCategories = localStorage.getItem('offlineCategories');
          
          if (localProducts && localCategories) {
            const parsedProducts = JSON.parse(localProducts);
            const parsedCategories = JSON.parse(localCategories);
            
            // Filter by category if provided
            const filteredProducts = categoryId
              ? parsedProducts.filter(p => p.category.id === categoryId)
              : parsedProducts;
            
            setProducts(filteredProducts);
            setCategories(parsedCategories);
          } else {
            setError(new Error('No offline data available'));
          }
        }
        
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [isOnline, categoryId]);
  
  return { products, categories, loading, error };
};
