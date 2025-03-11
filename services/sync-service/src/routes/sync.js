const express = require('express');
const syncController = require('../controllers/sync.controller');

const router = express.Router();

// Initiate sync session
router.post('/start', syncController.startSyncSession);

// Update sync session progress
router.patch('/:sessionId/progress', syncController.updateSyncProgress);

// Complete sync session
router.post('/:sessionId/complete', syncController.completeSyncSession);

// Resolve sync conflicts
router.post('/resolve-conflicts', syncController.resolveConflicts);

// Get sync history
router.get('/history', syncController.getSyncHistory);

// Get active sync sessions
router.get('/active-sessions', syncController.getActiveSyncSessions);

module.exports = router;