const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'mobile_pay', 'gift_card'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  receiptNumber: {
    type: String,
    unique: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save hook to generate receipt number
paymentSchema.pre('save', function(next) {
  if (!this.receiptNumber) {
    const storePrefix = this.store.toString().slice(-4).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    this.receiptNumber = `RCPT-${storePrefix}-${timestamp}`;
  }
  next();
});

// Method to process payment
paymentSchema.methods.processPayment = async function() {
  // In a real-world scenario, this would integrate with payment gateways
  try {
    // Simulate payment processing
    this.status = 'processing';
    await this.save();

    // Simulate successful payment
    this.status = 'completed';
    this.transactionId = `TXN-${Date.now()}`;
    await this.save();

    return this;
  } catch (error) {
    this.status = 'failed';
    await this.save();
    throw error;
  }
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;