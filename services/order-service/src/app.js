require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { logger } = require('./utils/logger');
const amqp = require('amqplib');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/', orderRoutes);



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
    // Detailed environment variable logging
    logger.info('Checking environment variables...');
    const requiredEnvVars = [
      'MONGO_URI', 
      'RABBITMQ_URL', 
      'RABBITMQ_EXCHANGE'
    ];
    
    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingVars.length > 0) {
      logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    // Detailed MongoDB connection
    try {
      logger.info(`Connecting to MongoDB: ${process.env.MONGO_URI}`);
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      logger.info('Connected to MongoDB successfully');
    } catch (mongoError) {
      logger.error(`Detailed MongoDB connection error:
        URI: ${process.env.MONGO_URI}
        Error: ${mongoError.message}
        Stack: ${mongoError.stack}`);
      throw mongoError;
    }
    
    // Detailed RabbitMQ connection
    try {
      logger.info(`Connecting to RabbitMQ: ${process.env.RABBITMQ_URL}`);
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      const channel = await connection.createChannel();
      
      // Assert exchange
      await channel.assertExchange(process.env.RABBITMQ_EXCHANGE, 'topic', { durable: true });
      logger.info('Connected to RabbitMQ successfully');
      
      // Add channel to app for event publishing
      app.locals.rabbitmq = { channel, exchange: process.env.RABBITMQ_EXCHANGE };

      // Setup order-specific consumers
      await setupOrderConsumers(channel, process.env.RABBITMQ_EXCHANGE);
    } catch (rabbitError) {
      logger.error(`Detailed RabbitMQ connection error:
        URL: ${process.env.RABBITMQ_URL}
        Exchange: ${process.env.RABBITMQ_EXCHANGE}
        Error: ${rabbitError.message}
        Stack: ${rabbitError.stack}`);
      throw rabbitError;
    }
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Order service listening on port ${PORT}`);
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
    logger.error(`Comprehensive startup error:
      Message: ${error.message}
      Stack: ${error.stack}`);
    process.exit(1);
  }
}

// Order-specific event consumers
async function setupOrderConsumers(channel, exchange) {
  try {
    const orderQueue = 'order_service_queue';
    
    await channel.assertQueue(orderQueue, { durable: true });
    
    // Bind queue to exchange with relevant routing keys
    await channel.bindQueue(orderQueue, exchange, 'inventory.*');
    await channel.bindQueue(orderQueue, exchange, 'payment.*');
    
    channel.consume(orderQueue, async (msg) => {
      try {
        if (!msg) return;
        
        const content = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;
        
        logger.info(`Received order-related event: ${routingKey}`);
        
        switch (routingKey) {
          case 'inventory.low_stock':
            await handleLowStockNotification(content.data);
            break;
          case 'payment.processed':
            await handlePaymentProcessed(content.data);
            break;
          default:
            logger.warn(`Unhandled event type: ${routingKey}`);
        }
        
        channel.ack(msg);
      } catch (error) {
        logger.error(`Error processing order event: ${error.message}`);
        channel.nack(msg, false, true);
      }
    });
    
    logger.info('Order service RabbitMQ consumers set up successfully');
  } catch (error) {
    logger.error(`Error setting up order RabbitMQ consumers: ${error.message}`);
    throw error;
  }
}

// Sample event handlers
async function handleLowStockNotification(inventoryData) {
  try {
    logger.info(`Handling low stock notification for product: ${inventoryData.productId}`);
    // Implement low stock handling logic
  } catch (error) {
    logger.error(`Error handling low stock notification: ${error.message}`);
  }
}

async function handlePaymentProcessed(paymentData) {
  try {
    logger.info(`Handling payment processed for order: ${paymentData.orderId}`);
    // Implement payment processing logic
  } catch (error) {
    logger.error(`Error handling payment processed: ${error.message}`);
  }
}

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});