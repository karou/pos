const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  variations: [{
    name: {
      type: String,
      trim: true
    },
    value: {
      type: String,
      trim: true
    },
    priceAdjustment: {
      type: Number,
      default: 0
    }
  }],
  toppings: [{
    name: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      default: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerName: {
    type: String,
    trim: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: [
      'pending', 
      'confirmed', 
      'preparing', 
      'ready', 
      'completed', 
      'cancelled'
    ],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    default: 'takeaway'
  },
  tableNumber: {
    type: String,
    trim: true
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  preprationTime: {
    type: Number, // in minutes
    default: 15
  },
  offlineCreated: {
    type: Boolean,
    default: false
  },
  offlineId: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save hook to generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    // Generate order number (e.g., STORE-TIMESTAMP)
    const storePrefix = this.store.toString().slice(-4).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    this.orderNumber = `${storePrefix}-${timestamp}`;
  }
  
  // Calculate total
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.total = this.subtotal + this.tax;
  
  // Calculate preparation time based on items
  this.preprationTime = this.calculatePreparationTime();
  
  next();
});

// Method to calculate preparation time
orderSchema.methods.calculatePreparationTime = function() {
  // Base preparation time
  let baseTime = 10; // 10 minutes
  
  // Add time for each item
  this.items.forEach(item => {
    // Additional time for complex items
    if (item.variations && item.variations.length > 0) {
      baseTime += 3; // 3 extra minutes for customized items
    }
    
    if (item.toppings && item.toppings.length > 0) {
      baseTime += item.toppings.length; // 1 minute per topping
    }
  });
  
  return Math.max(10, Math.min(baseTime, 45)); // Between 10-45 minutes
};

// Virtual for order age
orderSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Status update method with history tracking
orderSchema.methods.updateStatus = async function(newStatus, note, userId) {
  const statusHistory = this.statusHistory || [];
  
  statusHistory.push({
    status: newStatus,
    updatedAt: new Date(),
    updatedBy: userId,
    note
  });
  
  this.status = newStatus;
  this.statusHistory = statusHistory;
  
  await this.save();
  return this;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;