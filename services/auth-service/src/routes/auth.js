const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// User registration route
router.post('/register', authController.register);

// User login route
router.post('/login', authController.login);

// User logout route
router.post('/logout', authController.logout);

// Get current user profile
router.get('/profile', authController.getProfile);

// Refresh token route
router.post('/refresh-token', authController.refreshToken);

module.exports = router;