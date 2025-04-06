const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    "Job URL": {
      type: String,
      trim: true
    },
    "Application Status": {
      type: String,
      trim: true
    },
    "Company Logo": {
      type: String,
      trim: true
    },
    "Company Name": {
      type: String,
      trim: true
    },
    "Experience Required": {
      type: String,
      trim: true
    },
    "Job Title": {
      type: String,
      trim: true
    },
    "Job Type": {
      type: String,
      trim: true
    },
    "Location": {
      type: String,
      trim: true
    },
    "Posted Time": {
      type: String,
      trim: true
    },
    "Salary": {
      type: String,
      trim: true
    },
    "detailed_info": {
      type: Object
    },
    "last_updated": {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'jobs'
  }
);

const Job = mongoose.model('Job', jobSchema, 'jobs');

module.exports = Job; 