const db = require('../config/db');

const TaskSubDepartment = {
  create: (taskId, subDepartmentId, callback) => {
    const sql = 'INSERT INTO task_sub_departments (task_id, sub_department_id) VALUES (?, ?)';
    db.query(sql, [taskId, subDepartmentId], callback);
  },

  deleteByTaskId: (taskId, callback) => {
    const sql = 'DELETE FROM task_sub_departments WHERE task_id = ?';
    db.query(sql, [taskId], callback);
  },

  getByTaskId: (taskId, callback) => {
    const sql = 'SELECT * FROM task_sub_departments WHERE task_id = ?';
    db.query(sql, [taskId], callback);
  }
};

module.exports = TaskSubDepartment;