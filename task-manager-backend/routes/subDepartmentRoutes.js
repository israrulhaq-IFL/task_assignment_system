const express = require('express');
const router = express.Router();
const subDepartmentController = require('../controllers/subDepartmentController');

router.post('/sub-departments', subDepartmentController.createSubDepartment);
router.get('/sub-departments/:id', subDepartmentController.getSubDepartmentById);
router.get('/sub-departments', subDepartmentController.getAllSubDepartments);
router.put('/sub-departments/:id', subDepartmentController.updateSubDepartment);
router.delete('/sub-departments/:id', subDepartmentController.deleteSubDepartment);

module.exports = router;