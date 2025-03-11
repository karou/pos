const express = require('express');
const storeController = require('../controllers/store.controller');

const router = express.Router();

// Create a new store
router.post('/', storeController.createStore);

// Get all stores
router.get('/', storeController.getStores);

// Get store by ID
router.get('/:id', storeController.getStoreById);

// Update store
router.put('/:id', storeController.updateStore);

// Activate/Deactivate store
router.patch('/:id/status', storeController.toggleStoreStatus);

// Get stores near a location
router.get('/nearby', storeController.getNearbyStores);

// Get store statistics
router.get('/stats', storeController.getStoreStatistics);

module.exports = router;