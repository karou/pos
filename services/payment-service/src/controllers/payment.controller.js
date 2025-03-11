const { logger } = require('../utils/logger');
const Payment = require('../models/payment');
const Order = require('../models/order'); // Assuming you have an Order model

const paymentController = {
  /**
   * Process a new payment
   */
  processPayment: async (req, res) => {
    try {
      const { 
        order, 
        amount, 
        paymentMethod, 
        customer, 
        store 
      } = req.body;
      
      // Validate order
      const orderDoc = await Order.findById(order);
      if (!orderDoc) {
        return res.status(404).json({
          status: 'error',
          message: 'Order not found'
        });
      }
      
      // Create payment
      const payment = new Payment({
        order,
        amount,
        paymentMethod,
        customer,
        store: orderDoc.store
      });
      
      // Process payment
      await payment.processPayment();
      
      // Publish payment event
      if (req.app.locals.rabbitmq) {
        const { channel, exchange } = req.app.locals.rabbitmq;
        
        const paymentEvent = {
          type: 'payment.processed',
          data: payment,
          metadata: {
            timestamp: new Date().toISOString()
          }
        };
        
        channel.publish(
          exchange,
          'payment.processed',
          Buffer.from(JSON.stringify(paymentEvent))
        );
      }
      
      res.status(201).json({
        status: 'success',
        data: payment
      });
    } catch (error) {
      logger.error(`Error processing payment: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to process payment'
      });
    }
  },

  /**
   * Get payment by ID
   */
  getPaymentById: async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id)
        .populate('order')
        .populate('customer')
        .populate('store');
      
      if (!payment) {
        return res.status(404).json({
          status: 'error',
          message: 'Payment not found'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: payment
      });
    } catch (error) {
      logger.error(`Error getting payment: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve payment'
      });
    }
  },

  /**
   * Get payments with filtering
   */
  getPayments: async (req, res) => {
    try {
      const { 
        store, 
        customer, 
        status, 
        paymentMethod,
        startDate,
        endDate,
        limit = 50,
        skip = 0
      } = req.query;
      
      const query = {};
      
      if (store) query.store = store;
      if (customer) query.customer = customer;
      if (status) query.status = status;
      if (paymentMethod) query.paymentMethod = paymentMethod;
      
      // Date range filtering
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      const payments = await Payment.find(query)
        .populate('order')
        .populate('customer')
        .populate('store')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      
      const total = await Payment.countDocuments(query);
      
      res.status(200).json({
        status: 'success',
        data: payments,
        meta: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip)
        }
      });
    } catch (error) {
      logger.error(`Error getting payments: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve payments'
      });
    }
  },

  /**
   * Refund a payment
   */
  refundPayment: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const payment = await Payment.findById(id);
      
      if (!payment) {
        return res.status(404).json({
          status: 'error',
          message: 'Payment not found'
        });
      }
      
      if (payment.status !== 'completed') {
        return res.status(400).json({
          status: 'error',
          message: 'Only completed payments can be refunded'
        });
      }
      
      payment.status = 'refunded';
      payment.metadata = {
        ...payment.metadata,
        refundReason: reason
      };
      
      await payment.save();
      
      // Publish refund event
      if (req.app.locals.rabbitmq) {
        const { channel, exchange } = req.app.locals.rabbitmq;
        
        const refundEvent = {
          type: 'payment.refunded',
          data: payment,
          metadata: {
            timestamp: new Date().toISOString()
          }
        };
        
        channel.publish(
          exchange,
          'payment.refunded',
          Buffer.from(JSON.stringify(refundEvent))
        );
      }
      
      res.status(200).json({
        status: 'success',
        data: payment
      });
    } catch (error) {
      logger.error(`Error refunding payment: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to refund payment'
      });
    }
  },

  /**
   * Get payment statistics
   */
  getPaymentStats: async (req, res) => {
    try {
      const { store, startDate, endDate } = req.query;
      
      const matchStage = {};
      if (store) matchStage.store = new mongoose.Types.ObjectId(store);
      if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
      }
      
      const stats = await Payment.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              status: '$status',
              paymentMethod: '$paymentMethod'
            },
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.status',
            paymentMethods: {
              $push: {
                paymentMethod: '$_id.paymentMethod',
                totalAmount: '$totalAmount',
                count: '$count'
              }
            },
            totalAmount: { $sum: '$totalAmount' },
            totalCount: { $sum: '$count' }
          }
        }
      ]);
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      logger.error(`Error getting payment stats: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve payment statistics'
      });
    }
  }
};

module.exports = paymentController;