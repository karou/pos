const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      default: 'United States'
    }
  },
  contact: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  operatingHours: {
    monday: {
      open: String,
      close: String
    },
    tuesday: {
      open: String,
      close: String
    },
    wednesday: {
      open: String,
      close: String
    },
    thursday: {
      open: String,
      close: String
    },
    friday: {
      open: String,
      close: String
    },
    saturday: {
      open: String,
      close: String
    },
    sunday: {
      open: String,
      close: String
    }
  },
  taxRate: {
    type: Number,
    default: 0.07, // 7% default tax rate
    min: 0,
    max: 1
  },
  currency: {
    type: String,
    default: 'USD'
  },
  active: {
    type: Boolean,
    default: true
  },
  managers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  allowedPaymentMethods: [{
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'mobile_pay']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index
storeSchema.index({ 'location': '2dsphere' });

// Pre-save hook to generate store code
storeSchema.pre('save', function(next) {
  if (!this.code) {
    // Generate a unique store code based on name
    const nameInitials = this.name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
    
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.code = `${nameInitials}-${randomSuffix}`;
  }
  next();
});

// Virtual for store status
storeSchema.virtual('status').get(function() {
  return this.active ? 'Active' : 'Inactive';
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;