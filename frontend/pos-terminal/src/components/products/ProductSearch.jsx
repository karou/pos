import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component for searching products
 */
const ProductSearch = ({ value, onChange }) => {
  return (
    <div className="product-search">
      <input
        type="text"
        placeholder="Search products..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="clear-search"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          &times;
        </button>
      )}
    </div>
  );
};

ProductSearch.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default ProductSearch;
