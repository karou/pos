const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStockThreshold: {
    type: Number,
    default: 10
  },
  transactions: [{
    type: {
      type: String,
      enum: ['initial', 'add', 'subtract', 'adjust'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for stock status
inventoryItemSchema.virtual('stockStatus').get(function() {
  if (this.quantity <= this.minStockThreshold) return 'low';
  if (this.quantity === 0) return 'out_of_stock';
  return 'in_stock';
});

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;