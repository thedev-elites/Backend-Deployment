const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Job = require('../models/Job');
const Resume = require('../models/Resume');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected for seeding...'))
  .catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'user'
  }
];

const jobs = [
  {
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    salary: '$120,000 - $150,000',
    description: 'We are looking for a skilled Frontend Developer to join our team. The ideal candidate has experience with React, TypeScript, and modern CSS.',
    requirements: ['3+ years experience with React', 'TypeScript proficiency', 'Knowledge of modern CSS and responsive design'],
    postedDate: new Date('2023-09-15'),
    type: 'Full-time'
  },
  {
    title: 'UI/UX Designer',
    company: 'DesignHub',
    location: 'New York, NY',
    salary: '$90,000 - $120,000',
    description: 'Join our creative team as a UI/UX Designer to create beautiful, intuitive interfaces for our clients.',
    requirements: ['Proficiency with Figma', 'Understanding of user-centered design principles', 'Portfolio showcasing previous work'],
    postedDate: new Date('2023-09-10'),
    type: 'Full-time'
  },
  {
    title: 'Backend Engineer',
    company: 'DataSystems',
    location: 'Remote',
    salary: '$130,000 - $160,000',
    description: 'We need a Backend Engineer with strong API design and database skills to help build our new platform.',
    requirements: ['Node.js expertise', 'Experience with SQL and NoSQL databases', 'API design and implementation'],
    postedDate: new Date('2023-09-12'),
    type: 'Full-time'
  },
  {
    title: 'Data Scientist Intern',
    company: 'AILabs',
    location: 'Boston, MA',
    salary: '$25/hour',
    description: 'Exciting internship opportunity for a Data Science student to work on real machine learning projects.',
    requirements: ['Currently pursuing degree in Computer Science, Statistics, or related field', 'Knowledge of Python and data analysis libraries', 'Strong mathematical background'],
    postedDate: new Date('2023-09-08'),
    type: 'Internship'
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Job.deleteMany();
    await Resume.deleteMany();

    // Insert new data
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    const sampleJobs = jobs.map(job => ({ ...job }));
    await Job.insertMany(sampleJobs);

    // Create sample resume
    await Resume.create({
      user: createdUsers[1]._id,
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      address: 'San Francisco, CA',
      summary: 'Experienced software engineer with a passion for building user-friendly applications and solving complex problems.',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'CSS', 'HTML', 'Git', 'REST APIs'],
      experience: [
        {
          title: 'Senior Frontend Developer',
          company: 'TechCorp',
          location: 'San Francisco, CA',
          startDate: '2020-06',
          endDate: 'Present',
          description: 'Lead frontend development for the company\'s flagship product. Implemented new features, improved performance, and mentored junior developers.'
        },
        {
          title: 'Frontend Developer',
          company: 'WebSolutions',
          location: 'San Francisco, CA',
          startDate: '2018-03',
          endDate: '2020-05',
          description: 'Developed responsive web applications using React and TypeScript. Collaborated with designers to implement pixel-perfect UIs.'
        }
      ],
      education: [
        {
          degree: 'B.S. Computer Science',
          institution: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          graduationDate: '2018',
          gpa: '3.8'
        }
      ]
    });

    console.log('Data imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete all data from DB
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Job.deleteMany();
    await Resume.deleteMany();

    console.log('Data destroyed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run script based on argument
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 