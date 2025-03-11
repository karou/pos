import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from './ProductCard';

/**
 * Component for displaying a grid of products
 */
const ProductList = ({ products, onProductClick }) => {
  if (!products || products.length === 0) {
    return <div className="no-products">No products available</div>;
  }

  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick(product)}
        />
      ))}
    </div>
  );
};

ProductList.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      basePrice: PropTypes.number.isRequired,
      image: PropTypes.string
    })
  ).isRequired,
  onProductClick: PropTypes.func.isRequired
};

export default ProductList;
