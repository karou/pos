const { logger } = require('../utils/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock user model (replace with actual MongoDB model)
const users = [];

const authController = {
  /**
   * User registration
   */
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === email);
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
      
      users.push(newUser);
      
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
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
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
    const user = users[0]; // For demo purposes
    
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
      const user = users.find(u => u.id === decoded.id);
      
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