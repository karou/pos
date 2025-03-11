const { logger } = require('../utils/logger');
const Store = require('../models/store');
const mongoose = require('mongoose');

const storeController = {
  /**
   * Create a new store
   */
  createStore: async (req, res) => {
    try {
      const storeData = req.body;
      
      const store = new Store(storeData);
      await store.save();
      
      // Publish store created event
      if (req.app.locals.rabbitmq) {
        const { channel, exchange } = req.app.locals.rabbitmq;
        
        const storeEvent = {
          type: 'store.created',
          data: store,
          metadata: {
            timestamp: new Date().toISOString()
          }
        };
        
        channel.publish(
          exchange,
          'store.created',
          Buffer.from(JSON.stringify(storeEvent))
        );
      }
      
      res.status(201).json({
        status: 'success',
        data: store
      });
    } catch (error) {
      logger.error(`Error creating store: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create store'
      });
    }
  },

  /**
   * Get stores with filtering and pagination
   */
  getStores: async (req, res) => {
    try {
      const { 
        active, 
        city, 
        state, 
        limit = 50, 
        skip = 0 
      } = req.query;
      
      const query = {};
      
      if (active !== undefined) {
        query.active = active === 'true';
      }
      
      if (city) {
        query['address.city'] = { $regex: city, $options: 'i' };
      }
      
      if (state) {
        query['address.state'] = { $regex: state, $options: 'i' };
      }
      
      const stores = await Store.find(query)
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .select('-__v');
      
      const total = await Store.countDocuments(query);
      
      res.status(200).json({
        status: 'success',
        data: stores,
        meta: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip)
        }
      });
    } catch (error) {
      logger.error(`Error getting stores: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve stores'
      });
    }
  },

  /**
   * Get store by ID
   */
  getStoreById: async (req, res) => {
    try {
      const store = await Store.findById(req.params.id)
        .populate('managers', 'name email');
      
      if (!store) {
        return res.status(404).json({
          status: 'error',
          message: 'Store not found'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: store
      });
    } catch (error) {
      logger.error(`Error getting store: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve store'
      });
    }
  },

  /**
   * Update store
   */
  updateStore: async (req, res) => {
    try {
      const storeData = req.body;
      
      const store = await Store.findByIdAndUpdate(
        req.params.id, 
        storeData, 
        { 
          new: true, 
          runValidators: true 
        }
      );
      
      if (!store) {
        return res.status(404).json({
          status: 'error',
          message: 'Store not found'
        });
      }
      
      // Publish store updated event
      if (req.app.locals.rabbitmq) {
        const { channel, exchange } = req.app.locals.rabbitmq;
        
        const storeEvent = {
          type: 'store.updated',
          data: store,
          metadata: {
            timestamp: new Date().toISOString()
          }
        };
        
        channel.publish(
          exchange,
          'store.updated',
          Buffer.from(JSON.stringify(storeEvent))
        );
      }
      
      res.status(200).json({
        status: 'success',
        data: store
      });
    } catch (error) {
      logger.error(`Error updating store: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update store'
      });
    }
  },

  /**
   * Toggle store active status
   */
  toggleStoreStatus: async (req, res) => {
    try {
      const { active } = req.body;
      
      const store = await Store.findByIdAndUpdate(
        req.params.id, 
        { active }, 
        { 
          new: true, 
          runValidators: true 
        }
      );
      
      if (!store) {
        return res.status(404).json({
          status: 'error',
          message: 'Store not found'
        });
      }
      
      // Publish store status updated event
      if (req.app.locals.rabbitmq) {
        const { channel, exchange } = req.app.locals.rabbitmq;
        
        const storeEvent = {
          type: 'store.status_updated',
          data: store,
          metadata: {
            timestamp: new Date().toISOString()
          }
        };
        
        channel.publish(
          exchange,
          'store.status_updated',
          Buffer.from(JSON.stringify(storeEvent))
        );
      }
      
      res.status(200).json({
        status: 'success',
        data: store
      });
    } catch (error) {
      logger.error(`Error toggling store status: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update store status'
      });
    }
  },

  /**
   * Get nearby stores
   */
  getNearbyStores: async (req, res) => {
    try {
      const { 
        longitude, 
        latitude, 
        maxDistance = 10 // kilometers
      } = req.query;
      
      if (!longitude || !latitude) {
        return res.status(400).json({
          status: 'error',
          message: 'Longitude and latitude are required'
        });
      }
      
      const stores = await Store.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: maxDistance * 1000 // convert to meters
          }
        },
        active: true
      });
      
      res.status(200).json({
        status: 'success',
        data: stores
      });
    } catch (error) {
      logger.error(`Error getting nearby stores: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve nearby stores'
      });
    }
  },

  /**
   * Get store statistics
   */
  getStoreStatistics: async (req, res) => {
    try {
      const stats = await Store.aggregate([
        {
          $group: {
            _id: '$address.state',
            totalStores: { $sum: 1 },
            activeStores: { 
              $sum: { $cond: [{ $eq: ['$active', true] }, 1, 0] } 
            },
            inactiveStores: { 
              $sum: { $cond: [{ $eq: ['$active', false] }, 1, 0] } 
            }
          }
        },
        {
          $project: {
            _id: 0,
            state: '$_id',
            totalStores: 1,
            activeStores: 1,
            inactiveStores: 1
          }
        }
      ]);
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      logger.error(`Error getting store statistics: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve store statistics'
      });
    }
  }
};

module.exports = storeController;