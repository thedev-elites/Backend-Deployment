const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');
const { OAuth2Client } = require('google-auth-library');

// Create Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Send JWT token as response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  // Create a user object with id that matches frontend expected format
  const userResponse = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: userResponse
    }
  });
};

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'user'
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login a user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Send token
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Google OAuth login
exports.googleLogin = async (req, res, next) => {
  try {
    const { tokenId } = req.body;
    
    console.log('Received token ID:', tokenId ? `${tokenId.substring(0, 20)}...` : 'Missing');
    
    if (!tokenId) {
      return next(new AppError('No token provided', 400));
    }

    try {
      // Manual token verification for debugging
      if (tokenId.split('.').length === 3) {
        console.log('Token appears to be in JWT format');
        
        try {
          // Get the payload from the JWT token
          const base64Url = tokenId.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
          
          console.log('Manually decoded payload:', {
            email: payload.email,
            name: payload.name,
            email_verified: payload.email_verified
          });
        } catch (decodeError) {
          console.error('Failed to manually decode token:', decodeError.message);
        }
      }
      
      // Standard verification with Google client
      const ticket = await googleClient.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      console.log('Google token verified successfully, payload:', 
        payload ? { email: payload.email, name: payload.name } : 'No payload');
      
      const { email_verified, email, name, picture } = payload;
      
      if (!email_verified) {
        return next(new AppError('Google account email not verified', 400));
      }

      // Find user or create a new one
      let user = await User.findOne({ email });
      
      if (!user) {
        console.log('Creating new user with Google login for email:', email);
        // Create a random password for the user
        const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        
        user = await User.create({
          name,
          email,
          password,
          googleId: email,
          picture
        });
      } else {
        console.log('Found existing user for Google login:', email);
      }

      // Send token
      createSendToken(user, 200, res);
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError.message);
      return next(new AppError(`Failed to verify Google token: ${verifyError.message}`, 401));
    }
  } catch (error) {
    console.error('Google login error:', error);
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const userResponse = {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };

    res.status(200).json({
      status: 'success',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    next(error);
  }
}; 