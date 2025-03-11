require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { logger } = require('./utils/logger');
const amqp = require('amqplib');
const productsRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/', productsRoutes);

if (!mongoose.models.Category) {
  const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  mongoose.model('Category', categorySchema);
}

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
    // Log all environment variables for debugging
    logger.info('Environment Variables:');
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('MONGO_') || key.startsWith('RABBITMQ_') || key === 'PORT') {
        logger.info(`${key}: ${process.env[key]}`);
      }
    });

    // Check required environment variables
    const requiredEnvVars = [
      'MONGO_URI', 
      'RABBITMQ_URL', 
      'RABBITMQ_EXCHANGE'
    ];
    
    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Detailed MongoDB connection
    try {
      logger.info(`Attempting to connect to MongoDB: ${process.env.MONGO_URI}`);
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      logger.info('Connected to MongoDB successfully');
    } catch (mongoError) {
      logger.error('MongoDB Connection Error:', {
        message: mongoError.message,
        stack: mongoError.stack,
        uri: process.env.MONGO_URI
      });
      throw mongoError;
    }
    
    // Detailed RabbitMQ connection
    try {
      logger.info(`Attempting to connect to RabbitMQ: ${process.env.RABBITMQ_URL}`);
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      const channel = await connection.createChannel();
      
      // Assert exchange
      await channel.assertExchange(process.env.RABBITMQ_EXCHANGE, 'topic', { durable: true });
      logger.info('Connected to RabbitMQ successfully');
      
      // Add channel to app for event publishing
      app.locals.rabbitmq = { channel, exchange: process.env.RABBITMQ_EXCHANGE };

      // Setup product-specific consumers
      await setupProductConsumers(channel, process.env.RABBITMQ_EXCHANGE);
    } catch (rabbitError) {
      logger.error('RabbitMQ Connection Error:', {
        message: rabbitError.message,
        stack: rabbitError.stack,
        url: process.env.RABBITMQ_URL,
        exchange: process.env.RABBITMQ_EXCHANGE
      });
      throw rabbitError;
    }
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Product service listening on port ${PORT}`);
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
    logger.error('Comprehensive Startup Error:', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Product-specific event consumers
async function setupProductConsumers(channel, exchange) {
  try {
    const productQueue = 'product_service_queue';
    
    await channel.assertQueue(productQueue, { durable: true });
    
    // Bind queue to exchange with relevant routing keys
    await channel.bindQueue(productQueue, exchange, 'inventory.*');
    await channel.bindQueue(productQueue, exchange, 'store.*');
    
    channel.consume(productQueue, async (msg) => {
      try {
        if (!msg) return;
        
        const content = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;
        
        logger.info(`Received product-related event: ${routingKey}`);
        
        switch (routingKey) {
          case 'inventory.updated':
            await handleInventoryUpdate(content.data);
            break;
          case 'store.created':
            await handleStoreCreation(content.data);
            break;
          default:
            logger.warn(`Unhandled event type: ${routingKey}`);
        }
        
        channel.ack(msg);
      } catch (error) {
        logger.error(`Error processing product event: ${error.message}`);
        channel.nack(msg, false, true);
      }
    });
    
    logger.info('Product service RabbitMQ consumers set up successfully');
  } catch (error) {
    logger.error(`Error setting up product RabbitMQ consumers: ${error.message}`);
    throw error;
  }
}

// Sample event handlers
async function handleInventoryUpdate(inventoryData) {
  try {
    logger.info(`Handling inventory update for product: ${inventoryData.productId}`);
    // Implement inventory update logic
  } catch (error) {
    logger.error(`Error handling inventory update: ${error.message}`);
  }
}

async function handleStoreCreation(storeData) {
  try {
    logger.info(`Handling store creation: ${storeData._id}`);
    // Implement store creation logic
  } catch (error) {
    logger.error(`Error handling store creation: ${error.message}`);
  }
}

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});