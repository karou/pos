const express = require('express');
const productController = require('../controllers/product.controller');

const router = express.Router();

// Get all products
router.get('/', productController.getAllProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Create new product
router.post('/', productController.createProduct);

// Update product
router.put('/:id', productController.updateProduct);

// Delete product
router.delete('/:id', productController.deleteProduct);

// Get products by category
router.get('/category/:categoryId', productController.getProductsByCategory);

// Get products by store
router.get('/store/:storeId', productController.getProductsByStore);

// Calculate product price with variations and toppings
router.post('/calculate-price', productController.calculatePrice);

module.exports = router;
