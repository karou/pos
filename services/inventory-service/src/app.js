require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { logger } = require('./utils/logger');
const amqp = require('amqplib');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', inventoryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.stack}`);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Connect to MongoDB and RabbitMQ
async function startServer() {
  try {
    // Check required environment variables
    const requiredEnvVars = [
      'MONGO_URI', 
      'RABBITMQ_URL', 
      'RABBITMQ_EXCHANGE'
    ];
    
    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    });

    // Connect to MongoDB
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      logger.info('Connected to MongoDB');
    } catch (mongoError) {
      logger.error(`MongoDB connection error: ${mongoError.message}`);
      throw mongoError;
    }
    
    // Connect to RabbitMQ
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      const channel = await connection.createChannel();
      
      // Assert exchange
      await channel.assertExchange(process.env.RABBITMQ_EXCHANGE, 'topic', { durable: true });
      logger.info('Connected to RabbitMQ');
      
      // Add channel to app for event publishing
      app.locals.rabbitmq = { channel, exchange: process.env.RABBITMQ_EXCHANGE };

      // Setup consumers for relevant events
      setupConsumers(channel, process.env.RABBITMQ_EXCHANGE);
    } catch (rabbitError) {
      logger.error(`RabbitMQ connection error: ${rabbitError.message}`);
      throw rabbitError;
    }
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Inventory service listening on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error(`Server startup error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Setup RabbitMQ consumers for inventory-related events
 */
async function setupConsumers(channel, exchange) {
  try {
    // Create a queue for inventory-related events
    const inventoryQueue = 'inventory_service_queue';
    
    await channel.assertQueue(inventoryQueue, { durable: true });
    
    // Bind queue to exchange with relevant routing keys
    await channel.bindQueue(inventoryQueue, exchange, 'order.*');
    await channel.bindQueue(inventoryQueue, exchange, 'product.*');
    
    // Consume messages from the queue
    channel.consume(inventoryQueue, async (msg) => {
      try {
        if (!msg) return;
        
        const content = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;
        
        logger.info(`Received inventory-related event: ${routingKey}`);
        
        // Process message based on routing key
        switch (routingKey) {
          case 'order.created':
            // Handle inventory reduction for order
            await handleOrderCreated(content.data);
            break;
            
          case 'product.created':
            // Handle new product inventory initialization
            await handleProductCreated(content.data);
            break;
            
          default:
            logger.warn(`Unhandled event type: ${routingKey}`);
        }
        
        // Acknowledge message
        channel.ack(msg);
      } catch (error) {
        logger.error(`Error processing inventory event: ${error.message}`);
        // Nack and requeue message for retry
        channel.nack(msg, false, true);
      }
    });
    
    logger.info('RabbitMQ consumers set up successfully');
  } catch (error) {
    logger.error(`Error setting up RabbitMQ consumers: ${error.message}`);
    throw error;
  }
}

/**
 * Handle order creation - reduce inventory
 */
async function handleOrderCreated(orderData) {
  const InventoryItem = require('./models/inventory');
  
  for (const item of orderData.items) {
    try {
      // Find inventory item for this product and store
      const inventoryItem = await InventoryItem.findOne({
        product: item.product,
        store: orderData.store
      });
      
      if (inventoryItem) {
        // Reduce inventory
        inventoryItem.quantity -= item.quantity;
        
        // Add transaction log
        inventoryItem.transactions.push({
          type: 'subtract',
          quantity: item.quantity,
          reason: `Order ${orderData.orderNumber}`,
          timestamp: new Date()
        });
        
        await inventoryItem.save();
        
        logger.info(`Inventory updated for product ${item.product} in order ${orderData.orderNumber}`);
      }
    } catch (error) {
      logger.error(`Error updating inventory for order: ${error.message}`);
    }
  }
}

/**
 * Handle product creation - initialize inventory
 */
async function handleProductCreated(productData) {
  const InventoryItem = require('./models/inventory');
  
  // If stores are provided in product data
  if (productData.stores && productData.stores.length > 0) {
    for (const storeId of productData.stores) {
      try {
        // Check if inventory item already exists
        const existingItem = await InventoryItem.findOne({
          product: productData._id,
          store: storeId
        });
        
        if (!existingItem) {
          // Create initial inventory item
          const newInventoryItem = new InventoryItem({
            product: productData._id,
            store: storeId,
            quantity: 0,
            minStockThreshold: 10,
            transactions: [{
              type: 'initial',
              quantity: 0,
              reason: 'Product initialization',
              timestamp: new Date()
            }]
          });
          
          await newInventoryItem.save();
          
          logger.info(`Initial inventory created for product ${productData._id} in store ${storeId}`);
        }
      } catch (error) {
        logger.error(`Error initializing inventory for product: ${error.message}`);
      }
    }
  }
}

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});