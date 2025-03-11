const mongoose = require('mongoose');

const syncSessionSchema = new mongoose.Schema({
  client: {
    type: String,
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['started', 'in_progress', 'completed', 'failed'],
    default: 'started'
  },
  totalRecords: {
    type: Number,
    default: 0
  },
  processedRecords: {
    type: Number,
    default: 0
  },
  conflicts: [{
    entityType: {
      type: String,
      required: true
    },
    entityId: {
      type: String,
      required: true
    },
    localVersion: mongoose.Schema.Types.Mixed,
    serverVersion: mongoose.Schema.Types.Mixed,
    resolvedBy: {
      type: String,
      enum: ['server', 'client', 'manual']
    }
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for sync progress percentage
syncSessionSchema.virtual('progressPercentage').get(function() {
  if (this.totalRecords === 0) return 0;
  return Math.round((this.processedRecords / this.totalRecords) * 100);
});

const SyncSession = mongoose.model('SyncSession', syncSessionSchema);

module.exports = SyncSession;