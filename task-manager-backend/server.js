require('dotenv').config(); // Add this line at the top of your server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Import path module
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const logger = require('./config/logger'); // Import the logger
const departmentRoutes = require('./routes/departmentRoutes'); // Import department routes
const subDepartmentRoutes = require('./routes/subDepartmentRoutes'); // Import sub-department routes
const uploadRoutes = require('./routes/uploadRoutes'); // Import the upload routes

const app = express();
const port = 3001;

const allowedOrigins = ['http://172.28.33.24:3000', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve the uploads directory

// Middleware to log incoming requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Use auth routes
app.use('/api/auth', authRoutes);

// Use task routes
app.use('/api/tasks', taskRoutes);
app.use('/api/upload', uploadRoutes); // Use the upload routes

// Use user routes
app.use('/api/users', userRoutes);

// Department routes
app.use('/api', departmentRoutes);

// Sub-department routes
app.use('/api', subDepartmentRoutes);

// Serve the frontend build
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware to log errors
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).send('Internal Server Error');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});