const db = require('../config/db'); // Use the db configuration from db.js

const SubDepartment = {
  create: (subDepartmentData, callback) => {
    const sql = 'INSERT INTO sub_departments SET ?';
    db.query(sql, subDepartmentData, callback);
  },
  getById: (subDepartmentId, callback) => {
    const sql = 'SELECT * FROM sub_departments WHERE sub_department_id = ?';
    db.query(sql, [subDepartmentId], callback);
  },
  getAll: (callback) => {
    const sql = `
      SELECT 
        sd.sub_department_id, 
        sd.sub_department_name, 
        COALESCE(u.username, 'undefined') AS manager_name, 
        COALESCE(d.department_name, 'undefined') AS department_name
      FROM sub_departments sd
      LEFT JOIN users u ON sd.manager_id = u.user_id
      LEFT JOIN departments d ON sd.department_id = d.department_id
    `;
    db.query(sql, callback);
  },
  update: (subDepartmentId, subDepartmentData, callback) => {
    const sql = 'UPDATE sub_departments SET ? WHERE sub_department_id = ?';
    db.query(sql, [subDepartmentData, subDepartmentId], callback);
  },
  delete: (subDepartmentId, callback) => {
    const sql = 'DELETE FROM sub_departments WHERE sub_department_id = ?';
    db.query(sql, [subDepartmentId], callback);
  },
  updateManager: (subDepartmentId, managerId, callback) => {
    const sql = 'UPDATE sub_departments SET manager_id = ? WHERE sub_department_id = ?';
    db.query(sql, [managerId, subDepartmentId], callback);
  },
  clearManager: (managerId, callback) => {
    const sql = 'UPDATE sub_departments SET manager_id = NULL WHERE manager_id = ?';
    db.query(sql, [managerId], callback);
  }
};



module.exports = SubDepartment;