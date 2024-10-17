const db = require('../config/db');

const TaskAssignee = {
  create: (taskId, userId, callback) => {
    const sql = 'INSERT INTO task_assignees (task_id, user_id) VALUES (?, ?)';
    db.query(sql, [taskId, userId], callback);
  },

  deleteByTaskId: (taskId, callback) => {
    const sql = 'DELETE FROM task_assignees WHERE task_id = ?';
    db.query(sql, [taskId], callback);
  },

  getByTaskId: (taskId, callback) => {
    const sql = 'SELECT * FROM task_assignees WHERE task_id = ?';
    db.query(sql, [taskId], callback);
  }
};

module.exports = TaskAssignee;