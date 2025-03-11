require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { logger } = require('./utils/logger');
const amqp = require('amqplib');
const notificationRoutes = require('./routes/notification.js');

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', notificationRoutes);

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
    // Detailed environment variable logging
    logger.info('Checking environment variables...');
    const requiredEnvVars = [
      'MONGO_URI', 
      'RABBITMQ_URL', 
      'RABBITMQ_EXCHANGE',
      'MAIL_HOST',
      'MAIL_PORT'
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
      logger.error(`Detailed MongoDB connection error: ${mongoError.message}`);
      logger.error(`MongoDB connection details:
        URI: ${process.env.MONGO_URI}
        Error Stack: ${mongoError.stack}`);
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

      // Setup notification-specific consumers
      await setupNotificationConsumers(channel, process.env.RABBITMQ_EXCHANGE);
    } catch (rabbitError) {
      logger.error(`Detailed RabbitMQ connection error: ${rabbitError.message}`);
      logger.error(`RabbitMQ connection details:
        URL: ${process.env.RABBITMQ_URL}
        Exchange: ${process.env.RABBITMQ_EXCHANGE}
        Error Stack: ${rabbitError.stack}`);
      throw rabbitError;
    }
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Notification service listening on port ${PORT}`);
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

// Notification-specific event consumers
async function setupNotificationConsumers(channel, exchange) {
  try {
    const notificationQueue = 'notification_service_queue';
    
    await channel.assertQueue(notificationQueue, { durable: true });
    
    // Bind queue to exchange with relevant routing keys
    await channel.bindQueue(notificationQueue, exchange, 'order.*');
    await channel.bindQueue(notificationQueue, exchange, 'payment.*');
    
    channel.consume(notificationQueue, async (msg) => {
      try {
        if (!msg) return;
        
        const content = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;
        
        logger.info(`Received notification-related event: ${routingKey}`);
        
        switch (routingKey) {
          case 'order.created':
            await handleOrderCreatedNotification(content.data);
            break;
          case 'payment.processed':
            await handlePaymentNotification(content.data);
            break;
          default:
            logger.warn(`Unhandled event type: ${routingKey}`);
        }
        
        channel.ack(msg);
      } catch (error) {
        logger.error(`Error processing notification event: ${error.message}`);
        channel.nack(msg, false, true);
      }
    });
    
    logger.info('Notification service RabbitMQ consumers set up successfully');
  } catch (error) {
    logger.error(`Error setting up notification RabbitMQ consumers: ${error.message}`);
    throw error;
  }
}

// Sample event handlers
async function handleOrderCreatedNotification(orderData) {
  try {
    // Create a notification for the order
    const Notification = require('./models/notification');
    
    const notification = new Notification({
      user: orderData.user || orderData.customer,
      type: 'order',
      title: `New Order #${orderData.orderNumber}`,
      message: `Your order #${orderData.orderNumber} has been created successfully.`,
      relatedEntity: {
        orderId: orderData._id,
        orderNumber: orderData.orderNumber
      }
    });
    
    await notification.save();
    logger.info(`Created notification for order ${orderData.orderNumber}`);
  } catch (error) {
    logger.error(`Error creating order notification: ${error.message}`);
  }
}

async function handlePaymentNotification(paymentData) {
  try {
    // Create a notification for the payment
    const Notification = require('./models/notification');
    
    const notification = new Notification({
      user: paymentData.user,
      type: 'payment',
      title: `Payment ${paymentData.status}`,
      message: `Your payment of $${paymentData.amount} has been ${paymentData.status}.`,
      relatedEntity: {
        paymentId: paymentData._id,
        amount: paymentData.amount
      }
    });
    
    await notification.save();
    logger.info(`Created notification for payment ${paymentData._id}`);
  } catch (error) {
    logger.error(`Error creating payment notification: ${error.message}`);
  }
}

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});