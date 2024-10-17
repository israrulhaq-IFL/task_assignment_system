const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/interactions', authMiddleware, taskController.logInteraction);
router.get('/interactions/:taskId', authMiddleware, taskController.getInteractionsByTaskId);
router.put('/:Id/target-date', authMiddleware, taskController.updateTaskTargetDate);




router.get('/manager', authMiddleware, taskController.getTasksForManager);
router.get('/team-member', authMiddleware, taskController.getTasksForTeamMember);
router.put('/:id/status', taskController.updateTaskStatus);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.get('/', taskController.getAllTasks);
router.get('/department/:departmentId', taskController.getTasksByDepartment);
router.get('/sub-department/:subDepartmentId', taskController.getTasksBySubDepartment);

router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
// Update task status


module.exports = router;