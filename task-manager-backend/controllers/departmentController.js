const Department = require('../models/departmentModel');

exports.createDepartment = (req, res) => {
  const { department_name } = req.body; // Only extract department_name
  const departmentData = { department_name }; // Create departmentData object with only department_name
  Department.create(departmentData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Department created successfully', departmentId: result.insertId });
  });
};

exports.getDepartmentById = (req, res) => {
  const departmentId = req.params.id;
  Department.getById(departmentId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(result);
  });
};

exports.getAllDepartments = (req, res) => {
  Department.getAll((err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(result);
  });
};

exports.updateDepartment = (req, res) => {
  const departmentId = req.params.id;
  const { department_name } = req.body; // Only extract department_name
  const departmentData = { department_name }; // Create departmentData object with only department_name
  Department.update(departmentId, departmentData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Department updated successfully' });
  });
};

exports.deleteDepartment = (req, res) => {
  const departmentId = req.params.id;
  Department.delete(departmentId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Department deleted successfully' });
  });
};