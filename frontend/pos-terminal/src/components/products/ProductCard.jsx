import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component for displaying a product card
 * Used in the product grid for selection
 */
const ProductCard = ({ product, onClick }) => {
  return (
    <div className="product-card" onClick={onClick}>
      {product.image && (
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>
      )}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">\</p>
        {product.isPopular && <span className="popular-badge">Popular</span>}
        {(product.variations && product.variations.length > 0) || 
         (product.toppings && product.toppings.length > 0) ? (
          <span className="customizable-badge">Customizable</span>
         ) : null}
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    basePrice: PropTypes.number.isRequired,
    image: PropTypes.string,
    isPopular: PropTypes.bool,
    variations: PropTypes.array,
    toppings: PropTypes.array
  }).isRequired,
  onClick: PropTypes.func.isRequired
};

export default ProductCard;
