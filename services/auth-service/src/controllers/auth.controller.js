const { logger } = require('../utils/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


// Mock user model (replace with actual MongoDB model)
const authController = {

  /**
   * Validate authentication token
   */
  validateToken: async (req, res) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'No authorization token provided'
        });
      }

      // Extract token (assuming "Bearer TOKEN" format)
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Malformed authorization token'
        });
      }

      // Verify token's signature and expiration
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'your_jwt_secret', 
        {
          algorithms: ['HS256'],
          maxAge: '8h' // Match token expiry from config
        }
      );

      // Find user (in a real app, this would use a database)
      const user = await User.findOne({id});
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User associated with token no longer exists'
        });
      }

      // Return user information
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });

    } catch (error) {
      // Handle different types of token errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please log in again.',
          errorType: 'TOKEN_EXPIRED'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid authentication token',
          errorType: 'INVALID_TOKEN'
        });
      }

      // Log the error
      logger.error(`Token validation error: ${error.message}`);

      // Catch-all for other unexpected errors
      res.status(500).json({
        success: false,
        message: 'Internal server error during token validation',
        errorType: 'SERVER_ERROR'
      });
    }
  },

  /**
   * User registration
   */
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({email});
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'User already exists'
        });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        role: role || 'cashier',
        createdAt: new Date()
      };
      
      User.push(newUser);
      
      // Generate tokens
      const accessToken = generateAccessToken(newUser);
      const refreshToken = generateRefreshToken(newUser);
      
      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Registration failed'
      });
    }
  },
  
  /**
   * User login
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findOne({email});
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User with the email ' + String(email) + ' does not exists'
        });
      }
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          message: 'Incorrect password'
        });
      }
      
      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Login failed'
      });
    }
  },
  
  /**
   * User logout
   */
  logout: (req, res) => {
    // In a real-world scenario, you'd invalidate tokens
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  },
  
  /**
   * Get user profile
   */
  getProfile: (req, res) => {
    // In a real implementation, this would use the authenticated user
    const user = User.findById(req.id); // For demo purposes
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  },
  
  /**
   * Refresh access token
   */
  refreshToken: (req, res) => {
    const { refreshToken } = req.body;
    
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_refresh_secret');
      
      // Find user
      const user = User.find(u => u.id === decoded.id);
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid refresh token'
        });
      }
      
      // Generate new access token
      const newAccessToken = generateAccessToken(user);
      
      res.status(200).json({
        status: 'success',
        data: {
          accessToken: newAccessToken
        }
      });
    } catch (error) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }
  }
};

// Token generation helpers
function generateAccessToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    }, 
    process.env.JWT_SECRET || 'your_jwt_secret', 
    { expiresIn: '1h' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { 
      id: user.id 
    }, 
    process.env.JWT_REFRESH_SECRET || 'your_refresh_secret', 
    { expiresIn: '7d' }
  );
}

module.exports = authController;