require('dotenv').config(); // Add this line at the top of your server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const logger = require('./config/logger'); // Import the logger
const departmentRoutes = require('./routes/departmentRoutes'); // Import department routes
const subDepartmentRoutes = require('./routes/subDepartmentRoutes'); // Import sub-department routes

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Middleware to log incoming requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Use auth routes
app.use('/api/auth', authRoutes);

// Use task routes
app.use('/api/tasks', taskRoutes);

// Use user routes
app.use('/api/users', userRoutes);

// department routes
app.use('/api', departmentRoutes);

app.use('/api', subDepartmentRoutes);

app.get('/', (req, res) => {
  res.send('Task Manager API');
});

// Error handling middleware to log errors
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});