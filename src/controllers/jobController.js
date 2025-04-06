const Job = require('../models/Job');
const { AppError } = require('../utils/errorHandler');

// Get all jobs
exports.getAllJobs = async (req, res, next) => {
  try {
    console.log('Fetching all jobs from internshala_jobs.jobs collection');
    
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    console.log('Query string:', queryStr);

    let query = Job.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-postedDate');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const jobsFromDB = await query;
    
    // Transform jobs to match expected frontend format
    const jobs = jobsFromDB.map(job => {
      // Extract detailed info sections if available
      const detailedSections = job.detailed_info?.detailed_sections || {};
      const skills = detailedSections['Skill(s) required'] 
        ? detailedSections['Skill(s) required'].split('\n').filter(s => s.trim()) 
        : [];
      
      return {
        id: job._id,
        title: job['Job Title'] || '',
        company: job['Company Name'] || '',
        location: job['Location'] || '',
        salary: job['Salary'] || '',
        description: detailedSections['About the job'] || '',
        requirements: skills,
        postedDate: job['Posted Time'] || job.last_updated || '',
        type: job['Job Type'] || '',
        jobUrl: job['Job URL'] || '',
        applicationStatus: job['Application Status'] || '',
        companyLogo: job['Company Logo'] || '',
        experienceRequired: job['Experience Required'] || '',
        responsibilities: ''
      };
    });
    
    console.log(`Found ${jobs.length} jobs in database`);
    if (jobs.length > 0) {
      console.log('First job sample:', {
        id: jobs[0].id,
        title: jobs[0].title,
        company: jobs[0].company
      });
    }

    // Send response
    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: {
        jobs
      }
    });
  } catch (error) {
    console.error('Error in getAllJobs controller:', error);
    next(error);
  }
};

// Get job by ID
exports.getJob = async (req, res, next) => {
  try {
    console.log(`Fetching job with ID: ${req.params.id}`);
    
    const job = await Job.findById(req.params.id);

    if (!job) {
      console.log(`No job found with ID: ${req.params.id}`);
      return next(new AppError('No job found with that ID', 404));
    }

    console.log('Job found:', {
      id: job._id,
      title: job.title,
      company: job.company
    });

    res.status(200).json({
      status: 'success',
      data: {
        job
      }
    });
  } catch (error) {
    console.error(`Error fetching job with ID ${req.params.id}:`, error);
    next(error);
  }
};

// Create a new job
exports.createJob = async (req, res, next) => {
  try {
    const newJob = await Job.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        job: newJob
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a job
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!job) {
      return next(new AppError('No job found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a job
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return next(new AppError('No job found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
}; 