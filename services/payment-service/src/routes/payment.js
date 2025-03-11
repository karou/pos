const express = require('express');
const paymentController = require('../controllers/payment.controller');

const router = express.Router();

// Process a new payment
router.post('/', paymentController.processPayment);

// Get payment by ID
router.get('/:id', paymentController.getPaymentById);

// Get payments with filtering
router.get('/', paymentController.getPayments);

// Refund a payment
router.post('/:id/refund', paymentController.refundPayment);

// Get payment statistics
router.get('/stats', paymentController.getPaymentStats);

module.exports = router;