const express = require('express');
const orderController = require('../controllers/order.controller');

const router = express.Router();

// Get all orders with filtering
router.get('/', orderController.getAllOrders);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Create new order
router.post('/', orderController.createOrder);

// Update order status
router.patch('/:id/status', orderController.updateOrderStatus);

// Process offline orders
router.post('/sync-offline', orderController.processOfflineOrders);

module.exports = router;
