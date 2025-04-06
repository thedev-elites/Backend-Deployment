const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Application must belong to a user']
    },
    job: {
      type: mongoose.Schema.ObjectId,
      ref: 'Job',
      required: [true, 'Application must be for a job']
    },
    resume: {
      type: mongoose.Schema.ObjectId,
      ref: 'Resume',
      required: [true, 'Application must include a resume']
    },
    coverLetter: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'interview', 'offer', 'rejected'],
      default: 'applied'
    },
    appliedDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster queries
applicationSchema.index({ user: 1, job: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application; 