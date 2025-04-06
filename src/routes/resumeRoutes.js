const express = require('express');
const resumeController = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All resume routes are protected
router.use(protect);

router.get('/me', resumeController.getMyResume);
router.post('/', resumeController.createOrUpdateResume);
router.patch('/', resumeController.createOrUpdateResume);
router.delete('/', resumeController.deleteResume);

module.exports = router; 