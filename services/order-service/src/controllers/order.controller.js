const Order = require('../models/order');
const { logger } = require('../utils/logger');

/**
 * Order controller - handles order-related requests
 */
const orderController = {
  /**
   * Get all orders
   */
  getAllOrders: async (req, res) => {
    try {
      const { storeId, status, limit = 50, skip = 0 } = req.query;
      
      const query = {};
      
      if (storeId) {
        query.store = storeId;
      }
      
      if (status) {
        query.status = status;
      }
      
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
        
      const total = await Order.countDocuments(query);
      
      res.status(200).json({
        status: 'success',
        data: orders,
        meta: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip)
        }
      });
    } catch (error) {
      logger.error(`Error getting orders: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get orders'
      });
    }
  },
  
  /**
   * Get order by ID
   */
  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
        
      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: order
      });
    } catch (error) {
      logger.error(`Error getting orders: ${error.message}`);

      res.status(500).json({
        status: 'error',
        message: 'Failed to get order'
      });
    }
  },
  
  /**
   * Create new order with customized products
   */
  createOrder: async (req, res) => {
    try {
      const {
        store,
        customer,
        customerName,
        items,
        specialInstructions,
        orderType,
        tableNumber,
        offlineCreated,
        offlineId
      } = req.body;
      
      // Create order with 0 values for totals - will be calculated in pre-save hook
      const order = new Order({
        store,
        customer,
        customerName,
        items,
        subtotal: 0,
        tax: 0,
        total: 0,
        specialInstructions,
        orderType,
        tableNumber,
        offlineCreated,
        offlineId,
        createdBy: req.user ? req.user.id : undefined
      });
      
      // Calculate preparation time
      order.calculatePreparationTime();
      
      await order.save();
      
      // Publish order created event to RabbitMQ
      if (req.app.locals.rabbitmq) {
        const { channel, exchange } = req.app.locals.rabbitmq;
        
        const orderEvent = {
          type: 'order.created',
          data: order,
          metadata: {
            timestamp: new Date().toISOString()
          }
        };
        
        channel.publish(
          exchange,
          'order.created',
          Buffer.from(JSON.stringify(orderEvent))
        );
      }
      
      res.status(201).json({
        status: 'success',
        data: order
      });
    } catch (error) {
      logger.error(`Error creating orders: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create order',
        details: error.message
      });
    }
  },
  
  /**
   * Update order status
   */
  updateOrderStatus: async (req, res) => {
    try {
      const { status, note } = req.body;
      
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found'
        });
      }
      
      await order.updateStatus(status, note, req.user ? req.user.id : undefined);
      
      // Publish order status updated event to RabbitMQ
      if (req.app.locals.rabbitmq) {
        const { channel, exchange } = req.app.locals.rabbitmq;
        
        const orderEvent = {
          type: 'order.status_updated',
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status,
            previousStatus: order.status,
            note
          },
          metadata: {
            timestamp: new Date().toISOString()
          }
        };
        
        channel.publish(
          exchange,
          'order.status_updated',
          Buffer.from(JSON.stringify(orderEvent))
        );
      }
      
      res.status(200).json({
        status: 'success',
        data: order
      });
    } catch (error) {
      logger.error(`Error updating order status: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update order status'
      });
    }
  },
  
  /**
   * Process orders created offline
   */
  processOfflineOrders: async (req, res) => {
    try {
      const { orders } = req.body;
      
      if (!Array.isArray(orders) || orders.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'No orders provided or invalid format'
        });
      }
      
      const results = [];
      
      // Process each offline order
      for (const offlineOrder of orders) {
        try {
          // Check if order already exists with this offline ID
          const existingOrder = await Order.findOne({ 
            offlineId: offlineOrder.offlineId 
          });
          
          if (existingOrder) {
            results.push({
              offlineId: offlineOrder.offlineId,
              status: 'skipped',
              message: 'Order already exists',
              orderId: existingOrder._id,
              orderNumber: existingOrder.orderNumber
            });
            continue;
          }
          
          // Create new order with offline flag
          const newOrder = new Order({
            ...offlineOrder,
            offlineCreated: true,
            subtotal: 0, // Will be calculated in pre-save hook
            tax: 0,
            total: 0
          });
          
          newOrder.calculatePreparationTime();
          await newOrder.save();
          
          results.push({
            offlineId: offlineOrder.offlineId,
            status: 'success',
            message: 'Order created successfully',
            orderId: newOrder._id,
            orderNumber: newOrder.orderNumber
          });
          
          // Publish order created event to RabbitMQ
          if (req.app.locals.rabbitmq) {
            const { channel, exchange } = req.app.locals.rabbitmq;
            
            const orderEvent = {
              type: 'order.created_from_offline',
              data: newOrder,
              metadata: {
                timestamp: new Date().toISOString()
              }
            };
            
            channel.publish(
              exchange,
              'order.created_from_offline',
              Buffer.from(JSON.stringify(orderEvent))
            );
          }
        } catch (error) {
          logger.error(`Error processing offline orders: ${error.message}`);
          results.push({
            offlineId: offlineOrder.offlineId,
            status: 'error',
            message: error.message
          });
        }
      }
      
      res.status(200).json({
        status: 'success',
        data: results
      });
    } catch (error) {
      logger.error(`Error processing offline orders: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to process offline orders'
      });
    }
  }
};

module.exports = orderController;
