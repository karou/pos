const { logger } = require('../utils/logger');
const SyncSession = require('../models/sync');
const mongoose = require('mongoose');

const syncController = {
  /**
   * Start a new sync session
   */
  startSyncSession: async (req, res) => {
    try {
      const { 
        client, 
        store, 
        totalRecords, 
        metadata 
      } = req.body;
      
      const syncSession = new SyncSession({
        client,
        store,
        totalRecords,
        metadata
      });
      
      await syncSession.save();
      
      // Publish sync start event
      if (req.app.locals.rabbitmq) {
        const { channel, exchange } = req.app.locals.rabbitmq;
        
        const syncEvent = {
          type: 'sync.started',
          data: syncSession,
          metadata: {
            timestamp: new Date().toISOString()
          }
        };
        
        channel.publish(
          exchange,
          'sync.started',
          Buffer.from(JSON.stringify(syncEvent))
        );
      }
      
      res.status(201).json({
        status: 'success',
        data: syncSession
      });
    } catch (error) {
      logger.error(`Error starting sync session: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to start sync session'
      });
    }
  },

  /**
   * Update sync session progress
   */
  updateSyncProgress: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { 
        processedRecords, 
        status,
        metadata 
      } = req.body;
      
      const syncSession = await SyncSession.findByIdAndUpdate(
        sessionId,
        {
          processedRecords,
          status: status || 'in_progress',
          $set: { 'metadata.progressDetails': metadata }
        },
        { new: true }
      );
      
      if (!syncSession) {
        return res.status(404).json({
          status: 'error',
          message: 'Sync session not found'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: syncSession
      });
    } catch (error) {
      logger.error(`Error updating sync progress: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update sync progress'
      });
    }
  },

  /**
   * Complete sync session
   */
  completeSyncSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { 
        metadata,
        conflicts
      } = req.body;
      
      const syncSession = await SyncSession.findByIdAndUpdate(
        sessionId,
        {
          status: 'completed',
          endTime: new Date(),
          $set: { 
            'metadata.completionDetails': metadata,
            conflicts: conflicts || []
          }
        },
        { new: true }
      );
      
      if (!syncSession) {
        return res.status(404).json({
          status: 'error',
          message: 'Sync session not found'
        });
      }
      
      // Publish sync complete event
      if (req.app.locals.rabbitmq) {
        const { channel, exchange } = req.app.locals.rabbitmq;
        
        const syncEvent = {
          type: 'sync.completed',
          data: syncSession,
          metadata: {
            timestamp: new Date().toISOString()
          }
        };
        
        channel.publish(
          exchange,
          'sync.completed',
          Buffer.from(JSON.stringify(syncEvent))
        );
      }
      
      res.status(200).json({
        status: 'success',
        data: syncSession
      });
    } catch (error) {
      logger.error(`Error completing sync session: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to complete sync session'
      });
    }
  },

  /**
   * Resolve sync conflicts
   */
  resolveConflicts: async (req, res) => {
    try {
      const { 
        sessionId, 
        conflicts 
      } = req.body;
      
      const syncSession = await SyncSession.findByIdAndUpdate(
        sessionId,
        {
          $push: { 
            conflicts: { 
              $each: conflicts.map(conflict => ({
                ...conflict,
                resolvedBy: 'server'
              }))
            }
          }
        },
        { new: true }
      );
      
      if (!syncSession) {
        return res.status(404).json({
          status: 'error',
          message: 'Sync session not found'
        });
      }
      
      // Publish conflict resolution event
      if (req.app.locals.rabbitmq) {
        const { channel, exchange } = req.app.locals.rabbitmq;
        
        const conflictEvent = {
          type: 'sync.conflicts_resolved',
          data: {
            sessionId,
            conflicts
          },
          metadata: {
            timestamp: new Date().toISOString()
          }
        };
        
        channel.publish(
          exchange,
          'sync.conflicts_resolved',
          Buffer.from(JSON.stringify(conflictEvent))
        );
      }
      
      res.status(200).json({
        status: 'success',
        data: syncSession
      });
    } catch (error) {
      logger.error(`Error resolving sync conflicts: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to resolve sync conflicts'
      });
    }
  },

  /**
   * Get sync history
   */
  getSyncHistory: async (req, res) => {
    try {
      const { 
        store, 
        client, 
        status, 
        startDate, 
        endDate,
        limit = 50,
        skip = 0 
      } = req.query;
      
      const query = {};
      
      if (store) query.store = store;
      if (client) query.client = client;
      if (status) query.status = status;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      const syncSessions = await SyncSession.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('store');
      
      const total = await SyncSession.countDocuments(query);
      
      res.status(200).json({
        status: 'success',
        data: syncSessions,
        meta: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip)
        }
      });
    } catch (error) {
      logger.error(`Error getting sync history: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve sync history'
      });
    }
  },

  /**
   * Get active sync sessions
   */
  getActiveSyncSessions: async (req, res) => {
    try {
      const { store } = req.query;
      
      const query = {
        status: { $in: ['started', 'in_progress'] }
      };
      
      if (store) query.store = store;
      
      const activeSessions = await SyncSession.find(query)
        .populate('store');
      
      res.status(200).json({
        status: 'success',
        data: activeSessions
      });
    } catch (error) {
      logger.error(`Error getting active sync sessions: ${error.message}`);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve active sync sessions'
      });
    }
  }
};

module.exports = syncController;