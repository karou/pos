const mongoose = require('mongoose');

// Variation Option Schema
const variationOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  priceAdjustment: {
    type: Number,
    default: 0
  }
});

// Variation Schema
const variationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [variationOptionSchema],
  displayOrder: {
    type: Number,
    default: 0
  }
});

// Topping Schema
const toppingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  image: {
    type: String,
    trim: true
  },
  variations: [variationSchema],
  toppings: [toppingSchema],
  allergens: [{
    type: String,
    trim: true
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  tags: [{
    type: String,
    trim: true
  }],
  available: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  stores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Method to calculate price with variations and toppings
productSchema.methods.calculatePrice = function(selectedVariations = [], selectedToppings = []) {
  let price = this.basePrice;

  // Calculate variation price adjustments
  if (this.variations && selectedVariations) {
    selectedVariations.forEach(selVar => {
      const variation = this.variations.find(v => v.name === selVar.name);
      if (variation) {
        const option = variation.options.find(o => o.name === selVar.value);
        if (option) {
          price += option.priceAdjustment || 0;
        }
      }
    });
  }

  // Calculate topping price
  if (this.toppings && selectedToppings) {
    selectedToppings.forEach(toppingId => {
      const topping = this.toppings.find(t => t._id.toString() === toppingId);
      if (topping) {
        price += topping.price;
      }
    });
  }

  return price;
};

// Virtual for store availability
productSchema.virtual('storeAvailability').get(function() {
  return this.stores.length;
});

// Static method to find products by category
productSchema.statics.findByCategory = function(categoryId) {
  return this.find({ category: categoryId, available: true });
};

// Static method to find products available in a specific store
productSchema.statics.findAvailableForStore = function(storeId) {
  return this.find({ 
    stores: storeId, 
    available: true 
  });
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;