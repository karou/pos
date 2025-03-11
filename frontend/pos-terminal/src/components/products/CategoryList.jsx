import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component for displaying product categories
 */
const CategoryList = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="category-list">
      <button
        className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
        onClick={() => onSelectCategory('all')}
      >
        All Products
      </button>
      
      {categories.map(category => (
        <button
          key={category.id}
          className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

CategoryList.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  selectedCategory: PropTypes.string.isRequired,
  onSelectCategory: PropTypes.func.isRequired
};

export default CategoryList;