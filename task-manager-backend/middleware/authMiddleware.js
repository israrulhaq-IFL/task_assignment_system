const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Ensure this path is correct

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Authorization Header:', authHeader); // Log the Authorization header
  if (!authHeader) {
    console.log('Authorization header missing');
    return res.status(401).send({ error: 'Authorization header missing' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token:', token); // Log the token
  if (!token) {
    //console.log('Authentication required');
    return res.status(401).send({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded); // Log the decoded token
    User.getById(decoded.id, (err, user) => {
      if (err) {
        console.log('Error fetching user:', err.message);
        return res.status(500).send({ error: 'Server error' });
      }
      if (!user) {
        console.log('User not found');
        return res.status(404).send({ error: 'User not found' });
      }
     // console.log('User found:', user); // Log the user
      req.user = user;
      next();
    });
  } catch (error) {
    console.log('Invalid token:', error.message);
    res.status(401).send({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;