require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { logger } = require('./utils/logger');
const amqp = require('amqplib');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', authRoutes);

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
      'RABBITMQ_EXCHANGE', 
      'JWT_SECRET'
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
    } catch (rabbitError) {
      logger.error(`RabbitMQ connection error: ${rabbitError.message}`);
      throw rabbitError;
    }
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Auth service listening on port ${PORT}`);
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

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});