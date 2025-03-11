const express = require('express');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

// Get notifications for a user
router.get('/', notificationController.getNotifications);

// Mark notifications as read
router.post('/mark-read', notificationController.markNotificationsRead);

// Create a new notification
router.post('/', notificationController.createNotification);

// Send email notification
router.post('/email', notificationController.sendEmailNotification);

module.exports = router;