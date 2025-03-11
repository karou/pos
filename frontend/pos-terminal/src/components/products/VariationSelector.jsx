import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Component for selecting product variations like size, sugar level, ice level
 * Especially designed for bubble tea and similar products with customizations
 */
const VariationSelector = ({ 
  variations, 
  selectedValues,
  onChange,
  required = false
}) => {
  const [error, setError] = useState(null);
  
  // Validate required variations
  useEffect(() => {
    if (required && (!selectedValues || Object.keys(selectedValues).length === 0)) {
      setError('Please select required options');
    } else {
      setError(null);
    }
  }, [selectedValues, required]);
  
  // Handle selection of a variation option
  const handleSelect = (variationId, optionId) => {
    const updatedValues = {
      ...selectedValues,
      [variationId]: optionId
    };
    
    onChange(updatedValues);
  };
  
  if (!variations || variations.length === 0) {
    return null;
  }
  
  return (
    <div className="variation-selector">
      {variations.map((variation) => (
        <div key={variation.id} className="variation-group">
          <div className="variation-header">
            <h4 className="variation-title">
              {variation.name}
              {variation.required && <span className="required-badge">*</span>}
            </h4>
          </div>
          
          <div className="variation-options">
            {variation.options.map((option) => (
              <button
                key={option.id}
                className={`variation-option ${selectedValues[variation.id] === option.id ? 'selected' : ''}`}
                onClick={() => handleSelect(variation.id, option.id)}
                aria-pressed={selectedValues[variation.id] === option.id}
              >
                <span className="option-name">{option.name}</span>
                {option.priceAdjustment !== 0 && (
                  <span className="price-adjustment">
                    {option.priceAdjustment > 0 ? `+$${option.priceAdjustment.toFixed(2)}` : `$${option.priceAdjustment.toFixed(2)}`}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* Display error for required variation */}
          {variation.required && !selectedValues[variation.id] && (
            <p className="variation-error">Please select a {variation.name.toLowerCase()}</p>
          )}
        </div>
      ))}
      
      {error && <p className="validation-error">{error}</p>}
    </div>
  );
};

VariationSelector.propTypes = {
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
      ).isRequired
    })
  ).isRequired,
  selectedValues: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool
};

export default VariationSelector;