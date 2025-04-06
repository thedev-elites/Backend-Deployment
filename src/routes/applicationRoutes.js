const express = require('express');
const applicationController = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All application routes are protected
router.use(protect);

// User routes
router.get('/', applicationController.getMyApplications);
router.get('/:id', applicationController.getApplication);
router.post('/jobs/:jobId/apply', applicationController.applyForJob);

// Admin routes
router.patch('/:id/status', restrictTo('admin'), applicationController.updateApplicationStatus);

module.exports = router; 