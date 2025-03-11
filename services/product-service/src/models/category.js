// services/product-service/models/Category.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Make sure the schema is defined before exporting
const categorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// This is the crucial line that's likely missing or incorrectly implemented
module.exports = mongoose.model('Category', categorySchema);