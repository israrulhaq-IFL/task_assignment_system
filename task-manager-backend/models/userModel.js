const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  create: (userData, callback) => {
    const sql = 'INSERT INTO users SET ?';
    db.query(sql, userData, callback);
  },
  getById: (id, callback) => {
    const query = 'SELECT * FROM users WHERE user_id = ?';
    db.query(query, [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },
  getByEmail: (email, callback) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },
  getAll: (callback) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, results);
    });
  },

  updatePassword: (userId, password, callback) => {
    const sql = 'UPDATE users SET password = ? WHERE user_id = ?';
    db.query(sql, [password, userId], callback);
  },
  updateProfileImage: (userId, profileImage, callback) => {
    const sql = 'UPDATE users SET profile_image = ? WHERE user_id = ?';
    db.query(sql, [profileImage, userId], callback);
  },


  update: (userId, userData, callback) => {
    if (userData.password) {
      bcrypt.hash(userData.password, 10, (err, hash) => {
        if (err) return callback(err);
        userData.password = hash;
        const sql = 'UPDATE users SET ? WHERE user_id = ?';
        db.query(sql, [userData, userId], callback);
      });
    } else {
      const sql = 'UPDATE users SET ? WHERE user_id = ?';
      db.query(sql, [userData, userId], callback);
    }
  },
  delete: (userId, callback) => {
    const sql = 'DELETE FROM users WHERE user_id = ?';
    db.query(sql, [userId], callback);
  },
  saveRefreshToken: (userId, refreshToken) => {
    const sql = 'UPDATE users SET refresh_token = ? WHERE user_id = ?';
    return new Promise((resolve, reject) => {
      db.query(sql, [refreshToken, userId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

getUsersForManager: (managerId, callback) => {
  const query =  `SELECT u.user_id, u.name, u.email, u.role, u.department_id, u.sub_department_id
  FROM users u
  JOIN sub_departments sd ON u.sub_department_id = sd.sub_department_id
  WHERE sd.manager_id = ?`;
  db.query(query, [managerId], (err, results) => {
    if (err) return callback(err);
    callback(null, results); // Return the full results array
  });
},
getUsersForTeamMember: (department_id, callback) => {
  const query = `
    SELECT u.user_id, u.name, u.email, u.role, u.department_id, u.sub_department_id
    FROM users u
    WHERE u.department_id = ?
  `;
  console.log('Executing query for team member:', query); // Debugging log
  db.query(query, [department_id], (err, results) => {
    if (err) return callback(err);
    console.log('Query result for team member:', results); // Debugging log
    callback(null, results); // Return the full results array
  });
},

getUsersForHOD: (callback) => {
  const query = `
    SELECT u.user_id, u.name, u.email, u.role, u.department_id, u.sub_department_id
    FROM users u
    WHERE u.role = 'HOD'
  `;
  console.log('Executing query for HOD:', query); // Debugging log
  db.query(query, (err, results) => {
    if (err) return callback(err);
    console.log('Query result for HOD:', results); // Debugging log
    callback(null, results); // Return the full results array
  });
},
getUserProfile: (userId, callback) => {
  const query = `
      SELECT u.user_id, u.name, u.email, u.role, u.profile_image,
             d.department_name, sd.sub_department_name,
             m.name AS manager_name, h.name AS hod_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.department_id
      LEFT JOIN sub_departments sd ON u.sub_department_id = sd.sub_department_id
      LEFT JOIN users m ON sd.manager_id = m.user_id
      LEFT JOIN users h ON d.hod_id = h.user_id
      WHERE u.user_id = ?`;
  db.query(query, [userId], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}


};


module.exports = User;