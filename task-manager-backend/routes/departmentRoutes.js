const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

router.post('/departments', departmentController.createDepartment);
router.get('/departments/:id', departmentController.getDepartmentById);
router.get('/departments', departmentController.getAllDepartments);
router.put('/departments/:id', departmentController.updateDepartment);
router.delete('/departments/:id', departmentController.deleteDepartment);

module.exports = router;