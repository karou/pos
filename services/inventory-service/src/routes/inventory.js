const express = require('express');
const inventoryController = require('../controllers/inventory.controller');

const router = express.Router();

// Get current inventory for a store
router.get('/', inventoryController.getInventory);

// Update inventory (increase/decrease stock)
router.post('/update', inventoryController.updateInventory);

// Create a new inventory item
router.post('/', inventoryController.createInventoryItem);

// Update an existing inventory item
router.put('/:id', inventoryController.updateInventoryItem);

// Delete an inventory item
router.delete('/:id', inventoryController.deleteInventoryItem);

// Get low stock items
router.get('/low-stock', inventoryController.getLowStockItems);

module.exports = router;