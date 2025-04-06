const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { AppError } = require('../utils/errorHandler');

// Apply for a job
exports.applyForJob = async (req, res, next) => {
  try {
    // Check if job exists
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return next(new AppError('No job found with that ID', 404));
    }

    // Check if user has a resume
    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      return next(new AppError('You need to create a resume before applying for jobs', 400));
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      user: req.user.id,
      job: req.params.jobId
    });

    if (existingApplication) {
      return next(new AppError('You have already applied for this job', 400));
    }

    // Create application
    const newApplication = await Application.create({
      user: req.user.id,
      job: req.params.jobId,
      resume: resume._id,
      coverLetter: req.body.coverLetter || ''
    });

    res.status(201).json({
      status: 'success',
      message: 'Your application has been submitted successfully!',
      data: {
        application: newApplication
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all applications for a user
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate({
        path: 'job',
        select: 'title company location type salary'
      })
      .sort('-appliedDate');

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get application by ID
exports.getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        select: 'title company location type salary description requirements postedDate'
      })
      .populate({
        path: 'resume',
        select: 'fullName email phone address summary skills experience education'
      });

    if (!application) {
      return next(new AppError('No application found with that ID', 404));
    }

    // Check if the application belongs to the logged-in user
    if (application.user.toString() !== req.user.id) {
      return next(new AppError('You do not have permission to access this application', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update application status (for admins)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    if (!req.body.status) {
      return next(new AppError('Status is required', 400));
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!application) {
      return next(new AppError('No application found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
}; 