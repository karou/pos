const Product = require('../models/product');
const { logger } = require('../utils/logger');

/**
 * Product controller - handles product-related requests
 */
const productController = {
  /**
   * Get all products
   */
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find({ available: true })
        .populate('category', 'name')
        .sort({ displayOrder: 1 });
        
      res.status(200).json({
        status: 'success',
        data: products
      });
    } catch (error) {
      logger.error(`Error getting products: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get products'
      });
    }
  },
  
  /**
   * Get product by ID
   */
  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id)
        .populate('category', 'name');
        
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: product
      });
    } catch (error) {
      logger.error(`Error getting products: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get product'
      });
    }
  },
  
  /**
   * Create new product with variations and toppings
   */
  createProduct: async (req, res) => {
    try {
      const {
        name,
        description,
        basePrice,
        category,
        image,
        variations,
        toppings,
        allergens,
        nutritionalInfo,
        tags,
        available,
        isPopular,
        displayOrder,
        stores
      } = req.body;
      
      // Create new product
      const product = new Product({
        name,
        description,
        basePrice,
        category,
        image,
        variations,
        toppings,
        allergens,
        nutritionalInfo,
        tags,
        available,
        isPopular,
        displayOrder,
        stores
      });
      
      await product.save();
      
      res.status(201).json({
        status: 'success',
        data: product
      });
    } catch (error) {
      logger.error(`Error creating product: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create product',
        details: error.message
      });
    }
  },
  
  /**
   * Update product
   */
  updateProduct: async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: product
      });
    } catch (error) {
      logger.error(`Error updating product: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update product'
      });
    }
  },
  
  /**
   * Delete product
   */
  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully'
      });
    } catch (error) {
      logger.error(`Error deleting product: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete product'
      });
    }
  },
  
  /**
   * Get products by category
   */
  getProductsByCategory: async (req, res) => {
    try {
      const products = await Product.findByCategory(req.params.categoryId);
      
      res.status(200).json({
        status: 'success',
        data: products
      });
    } catch (error) {
      logger.error(`Error getting products by category: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get products by category'
      });
    }
  },
  
  /**
   * Get products by store
   */
  getProductsByStore: async (req, res) => {
    try {
      const products = await Product.findAvailableForStore(req.params.storeId);
      
      res.status(200).json({
        status: 'success',
        data: products
      });
    } catch (error) {
      logger.error(`Error getting products by store: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get products by store'
      });
    }
  },
  
  /**
   * Calculate product price with variations and toppings
   */
  calculatePrice: async (req, res) => {
    try {
      const { productId, variations, toppings } = req.body;
      
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      const price = product.calculatePrice(variations, toppings);
      
      res.status(200).json({
        status: 'success',
        data: {
          basePrice: product.basePrice,
          calculatedPrice: price
        }
      });
    } catch (error) {
      logger.error(`Error calculating price: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to calculate price'
      });
    }
  }
};

module.exports = productController;
