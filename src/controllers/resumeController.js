const Resume = require('../models/Resume');
const { AppError } = require('../utils/errorHandler');

// Get user's resume
exports.getMyResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });

    if (!resume) {
      return next(new AppError('No resume found for this user', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        resume
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create or update resume
exports.createOrUpdateResume = async (req, res, next) => {
  try {
    // Add user ID to body
    req.body.user = req.user.id;

    // Check if user already has a resume
    const existingResume = await Resume.findOne({ user: req.user.id });

    let resume;
    if (existingResume) {
      // Update existing resume
      resume = await Resume.findOneAndUpdate({ user: req.user.id }, req.body, {
        new: true,
        runValidators: true
      });
    } else {
      // Create new resume
      resume = await Resume.create(req.body);
    }

    res.status(200).json({
      status: 'success',
      data: {
        resume
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete resume
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({ user: req.user.id });

    if (!resume) {
      return next(new AppError('No resume found for this user', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 