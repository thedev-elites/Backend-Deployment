const express = require('express');
const jobController = require('../controllers/jobController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes - anyone can view jobs
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJob);

// Protected routes - admin only
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', jobController.createJob);
router.patch('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router; 