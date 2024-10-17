const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.getUserById = (req, res) => {
  const userId = req.user.user_id; // Use the user ID from the authenticated user
  console.log('Fetching user with ID:', userId); // Log the user ID

  User.getById(userId, (err, user) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('User found:', user); // Log the user
    res.json(user);
  });
};

exports.getAllUsers = (req, res) => {
  const role = req.query.role;

  User.getAll((err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // If a role is specified, filter the results
    if (role) {
      const filteredUsers = result.filter(user => user.role === role);
      return res.status(200).json(filteredUsers);
    }

    // If no role is specified, return all users
    res.status(200).json(result);
  });
};

exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const userData = req.body;

  console.log('Updating user with ID:', userId); // Log the user ID
  console.log('User data:', userData); // Log the user data

  User.update(userId, userData, (err, result) => {
    if (err) {
      console.error('Error updating user:', err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log('User updated:', result); // Log the update result

    // Check if the user is assigned the role of HOD and a department
    if (userData.role === 'HOD' && userData.department_id) {
      console.log('Updating HOD ID in department table'); // Log the HOD update
      const sql = 'UPDATE departments SET hod_id = ? WHERE department_id = ?';
      db.query(sql, [userId, userData.department_id], (err, result) => {
        if (err) {
          console.error('Error updating HOD ID in department:', err.message);
          return res.status(500).json({ error: err.message });
        }
        console.log('HOD ID updated in department:', result); // Log the department update result
        res.status(200).json({ message: 'User and department updated successfully' });
      });
    } else if (userData.role === 'Manager' || userData.role === 'Team Member') {
      if (!userData.sub_department_id) {
        console.error('Sub-department is required for Manager and Team Member roles');
        return res.status(400).json({ error: 'Sub-department is required for Manager and Team Member roles' });
      }

      if (userData.role === 'Manager') {
        console.log('Updating manager ID in subdepartment table'); // Log the manager update
        const sql = 'UPDATE sub_departments SET manager_id = ? WHERE sub_department_id = ?';
        db.query(sql, [userId, userData.sub_department_id], (err, result) => {
          if (err) {
            console.error('Error updating manager ID in subdepartment:', err.message);
            return res.status(500).json({ error: err.message });
          }
          console.log('Manager ID updated in subdepartment:', result); // Log the subdepartment update result
          res.status(200).json({ message: 'User and sub-department updated successfully' });
        });
      } else {
        res.status(200).json({ message: 'User updated successfully' });
      }
    } else {
      console.log('Clearing HOD ID in department table'); // Log the HOD clear
      const sql = 'UPDATE departments SET hod_id = NULL WHERE hod_id = ?';
      db.query(sql, [userId], (err, result) => {
        if (err) {
          console.error('Error clearing HOD ID in department:', err.message);
          return res.status(500).json({ error: err.message });
        }
        console.log('HOD ID cleared in department:', result); // Log the department clear result
        res.status(200).json({ message: 'User updated successfully' });
      });

      console.log('Clearing manager ID in subdepartment table'); // Log the manager clear
      const clearManagerSql = 'UPDATE sub_departments SET manager_id = NULL WHERE manager_id = ?';
      db.query(clearManagerSql, [userId], (err, result) => {
        if (err) {
          console.error('Error clearing manager ID in subdepartment:', err.message);
          return res.status(500).json({ error: err.message });
        }
        console.log('Manager ID cleared in subdepartment:', result); // Log the subdepartment clear result
        res.status(200).json({ message: 'User updated successfully' });
      });
    }
  });
};

exports.deleteUser = (req, res) => {
  const userIdToDelete = req.params.id;
  const token = req.headers.authorization.split(' ')[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error('Error decoding token:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }

  const loggedInUserId = decodedToken.id; // Ensure this matches the token structure
  const loggedInUserRole = decodedToken.role; // Assuming role is included in the token

  console.log('User ID to delete:', userIdToDelete);
  console.log('Logged in user ID:', loggedInUserId);
  console.log('Logged in user role:', loggedInUserRole);

  // Check if the logged-in user is trying to delete their own account
  if (userIdToDelete === loggedInUserId.toString()) {
    console.log('Attempt to delete own account');
    return res.status(403).json({ error: 'You cannot delete your own account.' });
  }

  // Allow Super Admin to delete other users
  if (loggedInUserRole === 'Super Admin') {
    User.delete(userIdToDelete, (err, result) => {
      if (err) {
        console.error('Error deleting user:', err.message);
        return res.status(500).json({ error: err.message });
      }
       // Clear the HOD ID in the department table if the deleted user was an HOD
       const sql = 'UPDATE departments SET hod_id = NULL WHERE hod_id = ?';
       db.query(sql, [userIdToDelete], (err, result) => {
         if (err) {
           console.error('Error clearing HOD ID in department:', err.message);
           return res.status(500).json({ error: err.message });
         }
         console.log('User and department updated successfully');
         return res.status(200).json({ message: 'User deleted successfully' });
       });
     });
  } else {
    // For other roles, add additional checks if necessary
    console.log('Permission denied for user role:', loggedInUserRole);
    return res.status(403).json({ error: 'You do not have permission to delete this user.' });
  }
};

exports.getUsersForManager = async (req, res) => {
  const managerId = req.query.manager_id;
  console.log('Fetching users for Manager with manager_id:', managerId); // Log the manager_id
  try {
    User.getUsersForManager(managerId, (err, users) => {
      if (err) {
        console.error('Error fetching users for Manager:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (!Array.isArray(users)) {
        console.error('Unexpected query result format:', users);
        return res.status(500).json({ error: 'Unexpected query result format' });
      }
      console.log('Fetched users:', users); // Log the fetched users
      res.json({ users });
    });
  } catch (error) {
    console.error('Error in getUsersForManager:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getUsersForTeamMember = (req, res) => {
  try {
    const { department_id } = req.query;
    if (!department_id) {
      throw new Error('Department ID is not available');
    }
    console.log('Fetching users for Team Member with department_id:', department_id); // Debugging log

    User.getUsersForTeamMember(department_id, (err, users) => {
      if (err) {
        console.error('Error fetching users for Team Member:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (!Array.isArray(users)) {
        console.error('Unexpected query result format:', users);
        return res.status(500).json({ error: 'Unexpected query result format' });
      }
      console.log('Fetched users for Team Member:', users); // Debugging log
      res.json({ users });
    });
  } catch (error) {
    console.error('Error in getUsersForTeamMember:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getUsersForHOD = (req, res) => {
  try {
    console.log('Fetching users for HOD'); // Debugging log

    User.getUsersForHOD((err, users) => {
      if (err) {
        console.error('Error fetching users for HOD:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (!Array.isArray(users)) {
        console.error('Unexpected query result format:', users);
        return res.status(500).json({ error: 'Unexpected query result format' });
      }
      console.log('Fetched users for HOD:', users); // Debugging log
      res.json({ users });
    });
  } catch (error) {
    console.error('Error in getUsersForHOD:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

