const { logger } = require('../utils/logger');
const Notification = require('../models/notification');
const nodemailer = require('nodemailer');

const notificationController = {
  /**
   * Get notifications for a user
   */
  getNotifications: async (req, res) => {
    try {
      const { userId, read, limit = 50, skip = 0 } = req.query;
      
      const query = {};
      if (userId) query.user = userId;
      if (read !== undefined) query.read = read === 'true';
      
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      
      const total = await Notification.countDocuments(query);
      
      res.status(200).json({
        status: 'success',
        data: notifications,
        meta: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip)
        }
      });
    } catch (error) {
      logger.error(`Error getting notifications: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve notifications'
      });
    }
  },
  
  /**
   * Mark notifications as read
   */
  markNotificationsRead: async (req, res) => {
    try {
      const { notificationIds, userId } = req.body;
      
      let updateQuery = {};
      if (notificationIds && notificationIds.length > 0) {
        // Mark specific notifications
        updateQuery = { _id: { $in: notificationIds } };
      } else if (userId) {
        // Mark all notifications for a user
        updateQuery = { user: userId, read: false };
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'No notifications specified'
        });
      }
      
      const result = await Notification.updateMany(
        updateQuery,
        { read: true, readAt: new Date() }
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          modifiedCount: result.modifiedCount
        }
      });
    } catch (error) {
      logger.error(`Error marking notifications read: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark notifications'
      });
    }
  },
  
  /**
   * Create a new notification
   */
  createNotification: async (req, res) => {
    try {
      const { 
        user, 
        type, 
        title, 
        message, 
        relatedEntity 
      } = req.body;
      
      const notification = new Notification({
        user,
        type,
        title,
        message,
        relatedEntity
      });
      
      await notification.save();
      
      // Publish notification created event
      if (req.app.locals.rabbitmq) {
        const { channel, exchange } = req.app.locals.rabbitmq;
        
        const notificationEvent = {
          type: 'notification.created',
          data: notification,
          metadata: {
            timestamp: new Date().toISOString()
          }
        };
        
        channel.publish(
          exchange,
          'notification.created',
          Buffer.from(JSON.stringify(notificationEvent))
        );
      }
      
      res.status(201).json({
        status: 'success',
        data: notification
      });
    } catch (error) {
      logger.error(`Error creating notification: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create notification'
      });
    }
  },
  
  /**
   * Send email notification
   */
  sendEmailNotification: async (req, res) => {
    try {
      const { 
        to, 
        subject, 
        body, 
        html 
      } = req.body;
      
      // Create a transporter using SMTP
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      });
      
      // Send email
      const info = await transporter.sendMail({
        from: process.env.MAIL_FROM || '"POS System" <noreply@possystem.com>',
        to,
        subject,
        text: body,
        html: html || body
      });
      
      // Log email details
      logger.info(`Email sent: ${info.messageId}`);
      
      res.status(200).json({
        status: 'success',
        data: {
          messageId: info.messageId
        }
      });
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send email'
      });
    }
  }
};

module.exports = notificationController;