require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { logger } = require('./utils/logger');
const amqp = require('amqplib');
const syncRoutes = require('./routes/sync');

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for large sync payloads

// Routes
app.use('/sync', syncRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Connect to MongoDB and RabbitMQ
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('Connected to MongoDB');
    
    // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Assert exchange
    await channel.assertExchange(process.env.RABBITMQ_EXCHANGE, 'topic', { durable: true });
    
    // Add channel to app for event publishing
    app.locals.rabbitmq = { channel, exchange: process.env.RABBITMQ_EXCHANGE };
    
    // Setup RabbitMQ consumers for sync events from other services
    setupConsumers(channel, process.env.RABBITMQ_EXCHANGE);
    
    logger.info('Connected to RabbitMQ');
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`SyncService service listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Server startup error:', error);
    process.exit(1);
  }
}

/**
 * Setup RabbitMQ consumers for sync events
 */
async function setupConsumers(channel, exchange) {
  try {
    // Create queues for different sync events
    const syncQueue = 'sync_service_queue';
    
    await channel.assertQueue(syncQueue, { durable: true });
    
    // Bind queue to exchange with relevant routing keys
    await channel.bindQueue(syncQueue, exchange, 'sync.*');
    
    // Consume messages from the queue
    channel.consume(syncQueue, async (msg) => {
      try {
        if (!msg) return;
        
        const content = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;
        
        logger.info("Received sync event: ");
        
        // Process message based on routing key
        switch (routingKey) {
          case 'sync.request':
            // Handle sync request
            logger.info("Processing sync request: ");
            break;
            
          case 'sync.complete':
            // Handle sync complete notification
            logger.info("Sync completed for client: ");
            break;
            
          default:
            logger.warn("Unknown sync event type: ");
        }
        
        // Acknowledge message
        channel.ack(msg);
      } catch (error) {
        logger.error("Error processing sync event: ");
        // Nack and requeue message for retry
        channel.nack(msg, false, true);
      }
    });
    
    logger.info('RabbitMQ consumers set up successfully');
  } catch (error) {
    logger.error("Error setting up RabbitMQ consumers: ");
    throw error;
  }
}

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

