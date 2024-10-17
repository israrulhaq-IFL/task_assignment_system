const db = require('../config/db');

const Task = {
  create: (taskData, callback) => {
    const sql = 'INSERT INTO tasks SET ?';
    db.query(sql, taskData, (err, result) => {
      if (err) return callback(err);

      const taskId = result.insertId;
      callback(null, { taskId, ...taskData });
    });
  },

  getById: (taskId, callback) => {
    const sql = `
      SELECT t.*, 
             GROUP_CONCAT(DISTINCT u.name) AS assignees, 
             GROUP_CONCAT(DISTINCT sd.sub_department_name) AS sub_departments,
             creator.name AS created_by_name
      FROM tasks t
      LEFT JOIN task_assignees ta ON t.task_id = ta.task_id
      LEFT JOIN users u ON ta.user_id = u.user_id
      LEFT JOIN task_sub_departments tsd ON t.task_id = tsd.task_id
      LEFT JOIN sub_departments sd ON tsd.sub_department_id = sd.sub_department_id
      LEFT JOIN users creator ON t.created_by = creator.user_id
      WHERE t.task_id = ?
      GROUP BY t.task_id
    `;
    console.log(`Executing SQL: ${sql} with taskId: ${taskId}`); // Log the SQL query and taskId
    db.query(sql, [taskId], (err, result) => {
      if (err) {
        console.error('Error executing SQL:', err); // Log the error
        return callback(err);
      }
      console.log('SQL execution result:', result); // Log the result
      callback(null, result);
    });
  },

  getAll: (callback) => {
    const sql = 'SELECT * FROM tasks';
    db.query(sql, callback);
  },

  getByDepartment: (departmentId, callback) => {
    const sql = 'SELECT * FROM tasks WHERE department_id = ?';
    db.query(sql, [departmentId], callback);
  },

  getBySubDepartment: (subDepartmentId, callback) => {
    const sql = 'SELECT * FROM tasks WHERE sub_department_id = ?';
    db.query(sql, [subDepartmentId], callback);
  },

  update: (taskId, taskData, assignees, subDepartments, callback) => {
    const sql = 'UPDATE tasks SET ? WHERE task_id = ?';
    db.query(sql, [taskData, taskId], (err, result) => {
      if (err) return callback(err);

      // Update task_assignees
      const deleteAssigneesSql = 'DELETE FROM task_assignees WHERE task_id = ?';
      db.query(deleteAssigneesSql, [taskId], (err) => {
        if (err) return callback(err);

        if (Array.isArray(assignees) && assignees.length > 0) {
          const assigneeValues = assignees.map(userId => [taskId, userId]);
          const assigneeSql = 'INSERT INTO task_assignees (task_id, user_id) VALUES ?';
          db.query(assigneeSql, [assigneeValues], (err) => {
            if (err) return callback(err);
          });
        }
      });

      // Update task_sub_departments
      const deleteSubDepartmentsSql = 'DELETE FROM task_sub_departments WHERE task_id = ?';
      db.query(deleteSubDepartmentsSql, [taskId], (err) => {
        if (err) return callback(err);

        if (Array.isArray(subDepartments) && subDepartments.length > 0) {
          const subDepartmentValues = subDepartments.map(subDepartmentId => [taskId, subDepartmentId]);
          const subDepartmentSql = 'INSERT INTO task_sub_departments (task_id, sub_department_id) VALUES ?';
          db.query(subDepartmentSql, [subDepartmentValues], (err) => {
            if (err) return callback(err);
          });
        }
      });

      callback(null, result);
    });
  },

  delete: (taskId, callback) => {
    const sql = 'DELETE FROM tasks WHERE task_id = ?';
    db.query(sql, [taskId], (err, result) => {
      if (err) return callback(err);

      const deleteAssigneesSql = 'DELETE FROM task_assignees WHERE task_id = ?';
      db.query(deleteAssigneesSql, [taskId], (err) => {
        if (err) return callback(err);

        const deleteSubDepartmentsSql = 'DELETE FROM task_sub_departments WHERE task_id = ?';
        db.query(deleteSubDepartmentsSql, [taskId], (err) => {
          if (err) return callback(err);

          callback(null, result);
        });
      });
    });
  },

  updateStatus: (taskId, status, callback) => {
    const sql = 'UPDATE tasks SET status = ? WHERE task_id = ?';
    console.log(`Executing SQL: ${sql} with status: ${status} and taskId: ${taskId}`); // Log the SQL query and parameters
    db.query(sql, [status, taskId], (err, result) => {
      if (err) {
        console.error('Error executing SQL:', err); // Log the error
        return callback(err);
      }
      console.log(`SQL execution result:`, result); // Log the result
      callback(null, result);
    });
  },

  updateTargetDate: (taskId, targetDate, callback) => {
    const sql = 'UPDATE tasks SET target_date = ? WHERE task_id = ?';
    console.log(`Executing SQL: ${sql} with targetDate: ${targetDate} and taskId: ${taskId}`); // Log the SQL query and parameters
    db.query(sql, [targetDate, taskId], (err, result) => {
      if (err) {
        console.error('Error executing SQL:', err); // Log the error
        return callback(err);
      }
      console.log(`SQL execution result:`, result); // Log the result
      callback(null, result);
    });
  },

  getAllDetailed: (callback) => {
    const sql = `
      SELECT t.*, 
             GROUP_CONCAT(DISTINCT u.name) AS assignees, 
             GROUP_CONCAT(DISTINCT sd.sub_department_name) AS sub_departments,
             creator.name AS created_by_name
      FROM tasks t
      LEFT JOIN task_assignees ta ON t.task_id = ta.task_id
      LEFT JOIN users u ON ta.user_id = u.user_id
      LEFT JOIN task_sub_departments tsd ON t.task_id = tsd.task_id
      LEFT JOIN sub_departments sd ON tsd.sub_department_id = sd.sub_department_id
      LEFT JOIN users creator ON t.created_by = creator.user_id
      GROUP BY t.task_id
    `;
    db.query(sql, callback);
  },

  getTasksForManager: (managerId, subDepartmentId, callback) => {
    const sql = `
      SELECT t.*, 
             GROUP_CONCAT(DISTINCT u.name) AS assignees, 
             GROUP_CONCAT(DISTINCT sd.sub_department_name) AS sub_departments,
             creator.name AS created_by_name
      FROM tasks t
      LEFT JOIN task_assignees ta ON t.task_id = ta.task_id
      LEFT JOIN users u ON ta.user_id = u.user_id
      LEFT JOIN task_sub_departments tsd ON t.task_id = tsd.task_id
      LEFT JOIN sub_departments sd ON tsd.sub_department_id = sd.sub_department_id
      LEFT JOIN users creator ON t.created_by = creator.user_id
      WHERE ta.user_id = ? OR t.created_by = ? OR tsd.sub_department_id = ?
      GROUP BY t.task_id
    `;
    db.query(sql, [managerId, managerId, subDepartmentId], callback);
  },

  getTasksForTeamMember: (userId, subDepartmentId, callback) => {
    const sql = `
     SELECT t.*, 
           GROUP_CONCAT(DISTINCT u.name) AS assignees, 
           GROUP_CONCAT(DISTINCT sd.sub_department_name) AS sub_departments,
           creator.name AS created_by_name
    FROM tasks t
    LEFT JOIN task_assignees ta ON t.task_id = ta.task_id
    LEFT JOIN users u ON ta.user_id = u.user_id
    LEFT JOIN task_sub_departments tsd ON t.task_id = tsd.task_id
    LEFT JOIN sub_departments sd ON tsd.sub_department_id = sd.sub_department_id
    LEFT JOIN users creator ON t.created_by = creator.user_id
    WHERE tsd.sub_department_id = ?
    GROUP BY t.task_id
    `;
    db.query(sql, [subDepartmentId, userId], callback);
  },


  logInteraction: (interactionData, callback) => {
    console.log('log interaction model hit Interaction data:', interactionData);
    const sql = 'INSERT INTO UserInteractions SET ?';
    db.query(sql, interactionData, callback);
  },

  getInteractionsByTaskId: (taskId, callback) => {
    const sql = 'SELECT * FROM UserInteractions WHERE task_id = ? ORDER BY interaction_timestamp';
    db.query(sql, [taskId], callback);
  }

};



module.exports = Task;