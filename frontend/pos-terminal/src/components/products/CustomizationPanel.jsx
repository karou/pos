import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Component for handling all customizations for a product
 * Particularly designed for bubble tea shops where products can have
 * multiple variations like size, sugar level, ice level, and toppings
 */
const CustomizationPanel = ({ 
  product, 
  onAddToCart, 
  onCancel 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [totalPrice, setTotalPrice] = useState(product.basePrice);
  
  // Calculate total price when selections change
  useEffect(() => {
    let price = product.basePrice;
    
    // Add variation adjustments
    if (product.variations) {
      Object.entries(selectedVariations).forEach(([variationId, optionId]) => {
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
    if (product.toppings) {
      selectedToppings.forEach(toppingId => {
        const topping = product.toppings.find(t => t.id === toppingId);
        if (topping && topping.price) {
          price += topping.price;
        }
      });
    }
    
    // Multiply by quantity
    price = price * quantity;
    
    setTotalPrice(price);
  }, [product, selectedVariations, selectedToppings, quantity]);
  
  // Handle variation selection
  const handleVariationChange = (variations) => {
    setSelectedVariations(variations);
  };
  
  // Handle topping selection
  const handleToppingToggle = (toppingId) => {
    setSelectedToppings(prevSelected => 
      prevSelected.includes(toppingId)
        ? prevSelected.filter(id => id !== toppingId)
        : [...prevSelected, toppingId]
    );
  };
  
  // Handle quantity change
  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    // Check if required variations are selected
    const missingRequired = product.variations
      ?.filter(v => v.required)
      ?.some(v => !selectedVariations[v.id]);
      
    if (missingRequired) {
      // Show validation message - handled in VariationSelector component
      return;
    }
    
    // Prepare the customized product
    const customizedProduct = {
      productId: product.id,
      name: product.name,
      quantity,
      basePrice: product.basePrice,
      totalPrice,
      variations: Object.entries(selectedVariations).map(([variationId, optionId]) => {
        const variation = product.variations.find(v => v.id === variationId);
        const option = variation.options.find(o => o.id === optionId);
        return {
          name: variation.name,
          value: option.name,
          priceAdjustment: option.priceAdjustment || 0
        };
      }),
      toppings: selectedToppings.map(toppingId => {
        const topping = product.toppings.find(t => t.id === toppingId);
        return {
          name: topping.name,
          price: topping.price
        };
      }),
      specialInstructions
    };
    
    onAddToCart(customizedProduct);
  };
  
  return (
    <div className="customization-panel">
      <div className="panel-header">
        <h3>Customize Your {product.name}</h3>
        <button className="close-button" onClick={onCancel}>&times;</button>
      </div>
      
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>
      
      <div className="product-name-price">
        <h4>{product.name}</h4>
        <p className="base-price">${product.basePrice.toFixed(2)}</p>
      </div>
      
      {/* Variations section (size, sugar, ice) */}
      {product.variations && product.variations.length > 0 && (
        <div className="variations-section">
          {product.variations.map(variation => (
            <div key={variation.id} className="variation-group">
              <h4 className="variation-title">{variation.name}</h4>
              <div className="variation-options">
                {variation.options.map(option => (
                  <button
                    key={option.id}
                    className={`variation-option ${selectedVariations[variation.id] === option.id ? 'selected' : ''}`}
                    onClick={() => handleVariationChange({ ...selectedVariations, [variation.id]: option.id })}
                  >
                    <span className="option-name">{option.name}</span>
                    {option.priceAdjustment > 0 && (
                      <span className="price-adjustment">+${option.priceAdjustment.toFixed(2)}</span>
                    )}
                    {option.priceAdjustment < 0 && (
                      <span className="price-adjustment">${option.priceAdjustment.toFixed(2)}</span>
                    )}
                  </button>
                ))}
              </div>
              {variation.required && !selectedVariations[variation.id] && (
                <p className="validation-message">Please select a {variation.name.toLowerCase()}</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Toppings section */}
      {product.toppings && product.toppings.length > 0 && (
        <div className="toppings-section">
          <h4>Add Toppings</h4>
          <div className="toppings-grid">
            {product.toppings.map(topping => (
              <div 
                key={topping.id} 
                className={`topping-item ${selectedToppings.includes(topping.id) ? 'selected' : ''}`}
                onClick={() => handleToppingToggle(topping.id)}
              >
                <span className="topping-name">{topping.name}</span>
                <span className="topping-price">+${topping.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Special instructions */}
      <div className="special-instructions">
        <h4>Special Instructions</h4>
        <textarea
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="Add any special instructions here..."
          maxLength={200}
        />
      </div>
      
      {/* Quantity selector */}
      <div className="quantity-selector">
        <h4>Quantity</h4>
        <div className="quantity-controls">
          <button 
            className="quantity-button" 
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="quantity-value">{quantity}</span>
          <button 
            className="quantity-button" 
            onClick={() => handleQuantityChange(1)}
          >
            +
          </button>
        </div>
      </div>
      
      {/* Total and add to cart */}
      <div className="order-actions">
        <div className="total-price">
          <span>Total:</span>
          <span className="price-value">${totalPrice.toFixed(2)}</span>
        </div>
        <button className="add-to-cart-button" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

CustomizationPanel.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    basePrice: PropTypes.number.isRequired,
    image: PropTypes.string,
    variations: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        required: PropTypes.bool,
        options: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            priceAdjustment: PropTypes.number
          })
        )
      })
    ),
    toppings: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired
      })
    )
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default CustomizationPanel;