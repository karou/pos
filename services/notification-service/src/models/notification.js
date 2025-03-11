const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'order', 
      'inventory', 
      'payment', 
      'system', 
      'marketing'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  relatedEntity: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Additional context or reference to related entity'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for notification age
notificationSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;