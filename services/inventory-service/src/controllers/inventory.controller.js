const { logger } = require('../utils/logger');
const InventoryItem = require('../models/inventory');

const inventoryController = {
  /**
   * Get inventory for a specific store
   */
  getInventory: async (req, res) => {
    try {
      const { storeId, productId, minStock } = req.query;
      
      const query = {};
      
      if (storeId) query.store = storeId;
      if (productId) query.product = productId;
      if (minStock) query.quantity = { $lte: parseInt(minStock) };
      
      const inventory = await InventoryItem.find(query)
        .populate('product')
        .populate('store')
        .sort({ quantity: 1 });
      
      res.status(200).json({
        status: 'success',
        data: inventory,
        total: inventory.length
      });
    } catch (error) {
      logger.error(`Error getting inventory: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve inventory'
      });
    }
  },

  /**
   * Update inventory (increase/decrease stock)
   */
  updateInventory: async (req, res) => {
    try {
      const { 
        itemId, 
        quantity, 
        type = 'adjust', 
        reason 
      } = req.body;
      
      // Validate input
      if (!itemId || quantity === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid input: itemId and quantity are required'
        });
      }
      
      const inventoryItem = await InventoryItem.findById(itemId);
      
      if (!inventoryItem) {
        return res.status(404).json({
          status: 'error',
          message: 'Inventory item not found'
        });
      }
      
      // Adjust quantity based on type
      switch (type) {
        case 'add':
          inventoryItem.quantity += quantity;
          break;
        case 'subtract':
          if (inventoryItem.quantity < quantity) {
            return res.status(400).json({
              status: 'error',
              message: 'Insufficient stock'
            });
          }
          inventoryItem.quantity -= quantity;
          break;
        case 'adjust':
        default:
          inventoryItem.quantity = quantity;
      }
      
      // Create inventory transaction log
      const transaction = {
        type,
        quantity,
        reason: reason || 'Manual adjustment',
        timestamp: new Date(),
        user: req.user ? req.user.id : null
      };
      
      inventoryItem.transactions.push(transaction);
      
      await inventoryItem.save();
      
      // Publish inventory update event to RabbitMQ
      if (req.app.locals.rabbitmq) {
        const { channel, exchange } = req.app.locals.rabbitmq;
        
        const inventoryEvent = {
          type: 'inventory.updated',
          data: {
            itemId: inventoryItem._id,
            productId: inventoryItem.product,
            storeId: inventoryItem.store,
            oldQuantity: inventoryItem.quantity - quantity,
            newQuantity: inventoryItem.quantity,
            transaction
          },
          metadata: {
            timestamp: new Date().toISOString()
          }
        };
        
        channel.publish(
          exchange,
          'inventory.updated',
          Buffer.from(JSON.stringify(inventoryEvent))
        );
      }
      
      res.status(200).json({
        status: 'success',
        data: inventoryItem
      });
    } catch (error) {
      logger.error(`Error updating inventory: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update inventory'
      });
    }
  },

  /**
   * Create a new inventory item
   */
  createInventoryItem: async (req, res) => {
    try {
      const { 
        product, 
        store, 
        quantity, 
        minStockThreshold 
      } = req.body;
      
      const inventoryItem = new InventoryItem({
        product,
        store,
        quantity,
        minStockThreshold,
        transactions: [{
          type: 'initial',
          quantity,
          reason: 'Initial stock',
          timestamp: new Date(),
          user: req.user ? req.user.id : null
        }]
      });
      
      await inventoryItem.save();
      
      res.status(201).json({
        status: 'success',
        data: inventoryItem
      });
    } catch (error) {
      logger.error(`Error creating inventory item: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create inventory item'
      });
    }
  },

  /**
   * Update an existing inventory item details
   */
  updateInventoryItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { minStockThreshold } = req.body;
      
      const inventoryItem = await InventoryItem.findByIdAndUpdate(
        id, 
        { minStockThreshold },
        { new: true, runValidators: true }
      );
      
      if (!inventoryItem) {
        return res.status(404).json({
          status: 'error',
          message: 'Inventory item not found'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: inventoryItem
      });
    } catch (error) {
      logger.error(`Error updating inventory item: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update inventory item'
      });
    }
  },

  /**
   * Delete an inventory item
   */
  deleteInventoryItem: async (req, res) => {
    try {
      const { id } = req.params;
      
      const inventoryItem = await InventoryItem.findByIdAndDelete(id);
      
      if (!inventoryItem) {
        return res.status(404).json({
          status: 'error',
          message: 'Inventory item not found'
        });
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Inventory item deleted successfully'
      });
    } catch (error) {
      logger.error(`Error deleting inventory item: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete inventory item'
      });
    }
  },

  /**
   * Get items with low stock
   */
  getLowStockItems: async (req, res) => {
    try {
      const { storeId } = req.query;
      
      const query = {};
      if (storeId) query.store = storeId;
      
      const lowStockItems = await InventoryItem.find({
        ...query,
        $expr: { $lte: ['$quantity', '$minStockThreshold'] }
      })
      .populate('product')
      .populate('store');
      
      res.status(200).json({
        status: 'success',
        data: lowStockItems,
        total: lowStockItems.length
      });
    } catch (error) {
      logger.error(`Error getting low stock items: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve low stock items'
      });
    }
  }
};

module.exports = inventoryController