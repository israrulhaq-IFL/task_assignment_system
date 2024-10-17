const db = require('../config/db');

const Department = {
  create: (departmentData, callback) => {
    const sql = 'INSERT INTO departments SET ?';
    db.query(sql, departmentData, callback);
  },
  getById: (departmentId, callback) => {
    const sql = 'SELECT * FROM departments WHERE department_id = ?';
    db.query(sql, [departmentId], callback);
  },
  getAll: (callback) => {
    const sql = `
      SELECT d.*, u.name AS hod_name
      FROM departments d
      LEFT JOIN users u ON d.hod_id = u.user_id
    `;
    db.query(sql, callback);
  },
  update: (departmentId, departmentData, callback) => {
    const sql = 'UPDATE departments SET ? WHERE department_id = ?';
    db.query(sql, [departmentData, departmentId], callback);
  },
  delete: (departmentId, callback) => {
    const sql = 'DELETE FROM departments WHERE department_id = ?';
    db.query(sql, [departmentId], callback);
  }
};

module.exports = Department;