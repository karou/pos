import React, { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import useOfflineSync from '../../hooks/useOfflineSync';
import { useNotification } from '../../context/NotificationContext';

// Import components
import ProductSearch from '../products/ProductSearch';
import CategoryList from '../products/CategoryList';
import ProductList from '../products/ProductList';
import CustomizationPanel from '../products/CustomizationPanel';
import Cart from '../cart/Cart';
import CheckoutPanel from '../checkout/CheckoutPanel';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../common/Button';

/**
 * Main POS Terminal component
 */
const POSTerminal = () => {
  // State
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Context hooks
  const { 
    products, 
    categories, 
    filteredProducts, 
    selectedCategory, 
    searchTerm, 
    loading, 
    error,
    setSelectedCategory, 
    setSearchTerm, 
    fetchProducts
  } = useProducts();
  
  const { 
    items, 
    subtotal, 
    tax, 
    total, 
    addItem, 
    removeItem, 
    updateItemQuantity,
    clearCart
  } = useCart();
  
  const { isOnline, pendingSyncCount } = useOfflineSync();
  const { showSuccess, showError, showWarning } = useNotification();
  
  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Handle product selection
  const handleProductClick = (product) => {
    // Check if product has variations or toppings
    if ((product.variations && product.variations.length > 0) || 
        (product.toppings && product.toppings.length > 0)) {
      setSelectedProduct(product);
      setShowCustomization(true);
    } else {
      // Simple product, add directly to cart
      addToCart({
        productId: product.id,
        name: product.name,
        quantity: 1,
        basePrice: product.basePrice,
        totalPrice: product.basePrice,
        variations: [],
        toppings: []
      });
      
      showSuccess(`Added ${product.name} to cart`, { autoHideDuration: 2000 });
    }
  };
  
  // Add customized product to cart
  const handleAddToCart = (customizedProduct) => {
    addToCart(customizedProduct);
    setShowCustomization(false);
    setSelectedProduct(null);
    
    showSuccess(`Added ${customizedProduct.name} to cart`, { autoHideDuration: 2000 });
  };
  
  // Add product to cart
  const addToCart = (product) => {
    addItem(product);
  };
  
  // Handle checkout
  const handleCheckout = () => {
    if (items.length === 0) {
      showWarning('Cart is empty. Add items before checkout.');
      return;
    }
    
    setShowCheckout(true);
  };
  
  // Handle order completion
  const handleOrderComplete = (result) => {
    if (result.success) {
      if (result.offline) {
        showSuccess('Order saved offline and will be processed when online', { autoHideDuration: 4000 });
      } else {
        showSuccess('Order completed successfully!', { autoHideDuration: 3000 });
      }
      
      setShowCheckout(false);
      // Cart is cleared in the checkout process
    } else {
      showError('Failed to complete order. Please try again.');
    }
  };
  
  // Refresh products
  const handleRefreshProducts = async () => {
    try {
      await fetchProducts(true); // Force refresh
      showSuccess('Product list refreshed', { autoHideDuration: 2000 });
    } catch (error) {
      showError('Failed to refresh products');
    }
  };
  
  return (
    <div className="pos-container">
      <div className="pos-content">
        <div className="products-section">
          <div className="products-header">
            <h2>Products</h2>
            
            <div className="products-actions">
              <Button 
                variant="outline" 
                size="small" 
                onClick={handleRefreshProducts}
                disabled={!isOnline}
                title={!isOnline ? 'Offline mode - Cannot refresh' : 'Refresh products'}
              >
                Refresh
              </Button>
              
              {!isOnline && (
                <div className="offline-indicator">Offline Mode</div>
              )}
            </div>
          </div>
          
          <ProductSearch
            value={searchTerm}
            onChange={setSearchTerm}
          />
          
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
          {loading ? (
            <div className="loading-container">
              <LoadingSpinner size="large" color="#4a6cfa" />
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <Button onClick={fetchProducts}>Try Again</Button>
            </div>
          ) : (
            <ProductList
              products={filteredProducts}
              onProductClick={handleProductClick}
            />
          )}
        </div>
        
        <div className="cart-section">
          <Cart
            items={items}
            subtotal={subtotal}
            tax={tax}
            total={total}
            onRemoveItem={removeItem}
            onUpdateQuantity={updateItemQuantity}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
      
      {/* Product customization modal */}
      {showCustomization && selectedProduct && (
        <Modal
          isOpen={showCustomization}
          onClose={() => setShowCustomization(false)}
          title={`Customize ${selectedProduct.name}`}
          size="medium"
        >
          <CustomizationPanel
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onCancel={() => setShowCustomization(false)}
          />
        </Modal>
      )}
      
      {/* Checkout modal */}
      {showCheckout && (
        <Modal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          title="Checkout"
          size="large"
          closeOnBackdropClick={false}
        >
          <CheckoutPanel
            onClose={() => setShowCheckout(false)}
            onOrderComplete={handleOrderComplete}
          />
        </Modal>
      )}
    </div>
  );
};

export default POSTerminal;