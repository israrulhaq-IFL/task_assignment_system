const db = require('../config/db'); // Use the db configuration from db.js

exports.createSubDepartment = (req, res) => {
  const { sub_department_name, department_id } = req.body;

  // Check for missing fields
  if (!sub_department_name || !department_id) {
    return res.status(400).json({ error: 'Missing required fields: sub_department_name, department_id' });
  }

  const sql = 'INSERT INTO sub_departments (sub_department_name, department_id) VALUES (?, ?)';
  db.query(sql, [sub_department_name, department_id], (err, result) => {
    if (err) {
      console.error('Error creating sub-department:', err);
      return res.status(500).json({ error: 'Error creating sub-department', details: err.message });
    }
    res.status(201).json({ sub_department_id: result.insertId, sub_department_name, department_id });
  });
};

exports.getSubDepartmentById = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }

  const sql = 'SELECT * FROM sub_departments WHERE sub_department_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error fetching sub-department:', err);
      return res.status(500).json({ error: 'Error fetching sub-department', details: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Sub-department not found' });
    }
    res.json(result[0]);
  });
};

exports.getAllSubDepartments = (req, res) => {
  const sql = `
    SELECT 
      sd.sub_department_id, 
      sd.sub_department_name, 
      COALESCE(u.name, 'undefined') AS manager_name, 
      COALESCE(d.department_name, 'undefined') AS department_name
    FROM sub_departments sd
    LEFT JOIN users u ON sd.manager_id = u.user_id
    LEFT JOIN departments d ON sd.department_id = d.department_id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching sub-departments:', err);
      return res.status(500).json({ error: 'Error fetching sub-departments', details: err.message });
    }
    res.json(results);
  });
};

exports.updateSubDepartment = (req, res) => {
  const { id } = req.params;
  const { sub_department_name, department_id } = req.body;

  // Check for missing fields
  if (!sub_department_name || !department_id) {
    return res.status(400).json({ error: 'Missing required fields: sub_department_name, department_id' });
  }

  const sql = 'UPDATE sub_departments SET ? WHERE sub_department_id = ?';
  db.query(sql, [{ sub_department_name, department_id }, id], (err, result) => {
    if (err) {
      console.error('Error updating sub-department:', err);
      return res.status(500).json({ error: 'Error updating sub-department', details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sub-department not found' });
    }
    res.json({ message: 'Sub-department updated successfully' });
  });
};
exports.deleteSubDepartment = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }

  const sql = 'DELETE FROM sub_departments WHERE sub_department_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting sub-department:', err);
      return res.status(500).json({ error: 'Error deleting sub-department', details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sub-department not found' });
    }
    res.json({ message: 'Sub-department deleted successfully' });
  });
};