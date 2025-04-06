const mongoose = require('mongoose');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Attempt counter to prevent infinite auto-retry spam
let connectionAttempts = 0;
const MAX_AUTO_ATTEMPTS = 3;

const connectDB = async () => {
  try {
    // Reset connection attempts if it's been a while since last attempt
    const now = Date.now();
    const lastAttemptFile = path.join(__dirname, '../../.last_connection_attempt');
    let resetAttempts = true;
    
    try {
      if (fs.existsSync(lastAttemptFile)) {
        const lastAttempt = parseInt(fs.readFileSync(lastAttemptFile, 'utf8').trim());
        // If last attempt was less than 10 minutes ago, don't reset counter
        if (now - lastAttempt < 10 * 60 * 1000) {
          resetAttempts = false;
        }
      }
    } catch (err) {
      // Ignore file reading errors
    }
    
    if (resetAttempts) {
      connectionAttempts = 0;
    }
    
    // Save current attempt time
    try {
      fs.writeFileSync(lastAttemptFile, now.toString());
    } catch (err) {
      // Ignore file writing errors
    }

    // Ensure we're connecting to the 'internshala_jobs' database
    let uri = process.env.MONGODB_URI;
    
    // If the URI doesn't specify a database name, add it
    if (!uri.includes('/internshala_jobs?')) {
      uri = uri.replace('/?', '/internshala_jobs?');
    }
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Reset connection attempts on successful connection
    connectionAttempts = 0;
    
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    
    // Increment connection attempts
    connectionAttempts++;
    
    // Provide more helpful error message for IP whitelist issues
    if (error.message.includes('IP whitelist')) {
      console.error('\n---------------------------------------------------------------');
      console.error('MONGODB ATLAS IP WHITELIST ERROR:');
      
      // Get current IP to make it easier to whitelist
      const ip = await getCurrentIP();
      
      console.error(`\nYour current IP address is: ${ip}`);
      console.error(`\nPlease add this IP to your MongoDB Atlas whitelist:`);
      
      // Direct link to the Atlas whitelist page using the project ID
      const projectId = process.env.MONGODB_PROJECT_ID;
      const atlasURL = projectId 
        ? `https://cloud.mongodb.com/v2/${projectId}#/security/network/accessList`
        : 'https://cloud.mongodb.com/';
        
      console.error(`\n1. Go to: ${atlasURL}`);
      
      if (!projectId) {
        console.error('   (log in if needed)');
      }
      
      console.error('2. Click "Network Access" in the left sidebar');
      console.error('3. Click "+ ADD IP ADDRESS" button');
      console.error('4. Choose "ADD CURRENT IP ADDRESS" or enter your IP manually:');
      console.error(`   ${ip}`);
      console.error('5. Click "Confirm"');
      console.error('6. Wait for the change to be applied (usually a few seconds)');
      console.error('7. Restart your server');
      
      // For development, suggest adding 0.0.0.0/0 (allow from anywhere)
      console.error('\nALTERNATIVE FOR DEVELOPMENT:');
      console.error('- You can also select "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)');
      console.error('- This is less secure but easier for development');
      console.error('- NOT recommended for production environments');
      
      console.error('---------------------------------------------------------------\n');
      
      // Auto-open browser only if we haven't tried too many times already
      if (connectionAttempts <= MAX_AUTO_ATTEMPTS) {
        try {
          // Open MongoDB Atlas in browser
          exec(`start "" "${atlasURL}"`, (err) => {
            if (err) {
              console.error('Failed to open browser automatically.');
            } else {
              console.error('Opening MongoDB Atlas in your browser to update IP whitelist...');
            }
          });
          
          // Show notification
          exec(`powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('Your IP address ${ip} needs to be added to MongoDB Atlas whitelist. Browser has been opened to help you do this.', 'MongoDB IP Whitelist Required', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning);"`, (err) => {
            if (err) {
              console.error('Failed to show notification.');
            }
          });
        } catch (err) {
          console.error('Error with auto-browser:', err.message);
        }
      } else {
        console.error('Too many automatic connection attempts. Please update IP whitelist manually.');
      }
    }
    
    // Don't exit process here, let the application handle it
    return null;
  }
};

// Function to get the current IP address
async function getCurrentIP() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('Error getting current IP:', error.message);
    return 'Unable to determine your IP';
  }
}

module.exports = connectDB; 