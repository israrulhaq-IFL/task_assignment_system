require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const logger = require('./config/logger'); // Import the logger
const redisClient = require('./config/redisConfig'); // Import the Redis client

// Import routes
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const subDepartmentRoutes = require('./routes/subDepartmentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const port = process.env.PORT || 3001;

// for OFFICE CORS configuration
// const allowedOrigins = ['http://172.28.33.24:3000', 'http://localhost:3000'];



// FOR HOME CORS configuration
const allowedOrigins = ['http://192.168.101.102:3000', 'http://localhost:3000'];


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

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/sub-departments', subDepartmentRoutes);
app.use('/api/upload', uploadRoutes);

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