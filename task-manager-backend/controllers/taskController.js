const Task = require('../models/taskModel');
const TaskAssignee = require('../models/taskAssignee');
const TaskSubDepartment = require('../models/taskSubDepartment');
const redisClient = require('../config/redisConfig'); // Import the Redis client

// Create a new task
exports.createTask = (req, res) => {
  const { title, description, priority, status, assigned_to, created_by, department_id, sub_department_ids, target_date } = req.body;

  console.log('Assigned to:', assigned_to); // Log the assigned_to array

  const taskData = {
    title,
    description,
    priority: priority || 'medium',
    status,
    created_by,
    department_id,
    target_date
  };

  Task.create(taskData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const taskId = result.taskId;

    const assigneePromises = assigned_to && assigned_to.length > 0
      ? assigned_to.map(user => new Promise((resolve, reject) => {
          const userId = user.user_id; // Correctly extract user_id
          console.log('User ID:', userId); // Log the userId
          TaskAssignee.create(taskId, userId, (err) => {
            if (err) {
              console.error(`Error inserting into task_assignees for userId ${userId}:`, err);
              return reject(err);
            }
            resolve();
          });
        }))
      : [];

    // Use a Set to ensure unique sub_department_ids
    const uniqueSubDepartmentIds = [...new Set(sub_department_ids)];

    const subDepartmentPromises = uniqueSubDepartmentIds.length > 0
      ? uniqueSubDepartmentIds.map(subDepartmentId => new Promise((resolve, reject) => {
          TaskSubDepartment.create(taskId, subDepartmentId, (err) => {
            if (err) {
              console.error(`Error inserting into task_sub_departments for subDepartmentId ${subDepartmentId}:`, err);
              return reject(err);
            }
            resolve();
          });
        }))
      : [];

    Promise.all([...assigneePromises, ...subDepartmentPromises])
      .then(() => {
        res.status(201).json({ id: taskId, ...taskData }); // Return the task ID
      })
      .catch(err => {
        res.status(500).json({ error: 'Error inserting into related tables', details: err.message });
      });
  });
};

// Get a task by ID
exports.getTaskById = (req, res) => {
  const taskId = req.params.id;
  Task.getById(taskId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const task = result[0];
    task.assignees = task.assignees ? task.assignees.split(',') : [];
    task.sub_departments = task.sub_departments ? task.sub_departments.split(',') : [];
    console.log('Fetched task:', task); // Log the fetched task
    res.status(200).json(task);
  });
};

// Get all tasks
exports.getAllTasks = (req, res) => {
  Task.getAllDetailed((err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(result);
  });
};

// Get tasks by department
exports.getTasksByDepartment = (req, res) => {
  const departmentId = req.params.departmentId;
  Task.getByDepartment(departmentId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(result);
  });
};

// Get tasks by sub-department
exports.getTasksBySubDepartment = (req, res) => {
  const subDepartmentId = req.params.subDepartmentId;
  Task.getBySubDepartment(subDepartmentId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(result);
  });
};

// Update a task
exports.updateTask = (req, res) => {
  const taskId = req.params.id;
  const { title, description, priority, status, assigned_to, department_id, sub_department_ids, target_date } = req.body;

  console.log(`updateTask route triggered for task ${taskId}`); // Log the route trigger

  const taskData = {
    title,
    description,
    priority,
    status,
    department_id,
    target_date
  };

  Task.update(taskId, taskData, assigned_to, sub_department_ids, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Task updated successfully' });
  });
};

// Delete a task
exports.deleteTask = (req, res) => {
  const taskId = req.params.id;
  Task.delete(taskId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  });
};

// Update task status
exports.updateTaskStatus = (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  console.log(`updateTaskStatus route triggered for task ${taskId}`); // Log the route trigger

  // Validate status
  const validStatuses = ['pending', 'in progress', 'completed'];
  if (!validStatuses.includes(status)) {
    console.error(`Invalid status value: ${status}`); // Log invalid status
    return res.status(400).json({ error: 'Invalid status value' });
  }

  console.log(`Updating task ${taskId} to status ${status}`); // Log the task ID and new status

  // Update only the status field
  Task.updateStatus(taskId, status, (err, result) => {
    if (err) {
      console.error('Error updating task status:', err); // Log the error
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      console.error(`Task not found: ${taskId}`); // Log task not found
      return res.status(404).json({ error: 'Task not found' });
    }
    console.log(`Task ${taskId} status updated to ${status}`); // Log successful update
    return res.json({ message: 'Task status updated successfully' }); // Ensure the response is sent
  });
};

// Update task target date
exports.updateTaskTargetDate = (req, res) => {
  const taskId = req.params.id;
  const { target_date } = req.body;

  console.log(`updateTaskTargetDate route triggered for task ${taskId}`); // Log the route trigger
  console.log(`Received target_date: ${target_date}`); // Log the received target date

  // Validate target_date
  if (!target_date) {
    console.error('No target_date provided'); // Log missing target date
    return res.status(400).json({ error: 'target_date is required' });
  }

  console.log(`Updating task ${taskId} to target date ${target_date}`); // Log the task ID and new target date

  // Update only the target_date field
  Task.updateTargetDate(taskId, target_date, (err, result) => {
    if (err) {
      console.error('Error updating task target date:', err); // Log the error
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      console.error(`No task found with ID ${taskId}`); // Log no task found
      return res.status(404).json({ error: 'Task not found' });
    }
    console.log(`Task ${taskId} target date updated to ${target_date}`); // Log successful update
    return res.json({ message: 'Task target date updated successfully' }); // Ensure the response is sent
  });
};

// Get all tasks for manager
exports.getAllTasksForManager = (req, res) => {
  const managerId = req.user.user_id;
  const subDepartmentId = req.user.sub_department_id;

  Task.getTasksForManager(managerId, subDepartmentId, async (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Fetch interaction data from Redis for each task
    const tasksWithInteractions = await Promise.all(tasks.map(async (task) => {
      const redisKey = `interaction:${managerId}:${task.task_id}`;
      const redisResult = await redisClient.get(redisKey);
      if (redisResult) {
        task.interactions = [JSON.parse(redisResult)];
      }
      return task;
    }));

    res.status(200).json(tasksWithInteractions);
  });
};

// Get my tasks for manager
exports.getMyTasksForManager = (req, res) => {
  const managerId = req.user.user_id;
  const subDepartmentId = req.user.sub_department_id;
  console.log('my task manager triggered'); 
  Task.getMyTasksForManager(managerId, subDepartmentId, async (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Fetch interaction data from Redis for each task
    const tasksWithInteractions = await Promise.all(tasks.map(async (task) => {
      const redisKey = `interaction:${managerId}:${task.task_id}`;
      const redisResult = await redisClient.get(redisKey);
      if (redisResult) {
        task.interactions = [JSON.parse(redisResult)];
      }
      return task;
    }));

    res.status(200).json(tasksWithInteractions);
  });
};

// Get other tasks for manager
exports.getOtherTasksForManager = (req, res) => {
  const managerId = req.user.user_id;
  const subDepartmentId = req.user.sub_department_id;

  console.log('other task manager triggered'); // Log the req.user object
  Task.getOtherTasksForManager(managerId, subDepartmentId, async (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Fetch interaction data from Redis for each task
    const tasksWithInteractions = await Promise.all(tasks.map(async (task) => {
      const redisKey = `interaction:${managerId}:${task.task_id}`;
      const redisResult = await redisClient.get(redisKey);
      if (redisResult) {
        task.interactions = [JSON.parse(redisResult)];
      }
      return task;
    }));

    res.status(200).json(tasksWithInteractions);
  });
};

// Get tasks for team member
exports.getTasksForTeamMember = (req, res) => {
  console.log('Request user data:', req.user); // Log the req.user object

  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const userId = req.user.user_id; // Use id instead of user_id
  const subDepartmentId = req.user.sub_department_id; // Assuming sub-department ID is available in req.user

  Task.getTasksForTeamMember(userId, subDepartmentId, async (err, tasks) => {
    console.log('Fetching tasks for team member:', userId); // Log the user ID
    if (err) {
      console.error('Error fetching tasks for team member:', err); // Log the error
      return res.status(500).json({ error: 'Error fetching tasks for team member' });
    }

    // Fetch interaction data from Redis for each task
    const tasksWithInteractions = await Promise.all(tasks.map(async (task) => {
      const redisKey = `interaction:${userId}:${task.task_id}`;
      const redisResult = await redisClient.get(redisKey);
      if (redisResult) {
        task.interactions = [JSON.parse(redisResult)];
      }
      return task;
    }));

    res.status(200).json(tasksWithInteractions);
  });
};

// Get my tasks for team member
exports.getMyTasksForTeamMember = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const userId = req.user.user_id;

  Task.getMyTasksForTeamMember(userId, (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(tasks);
  });
};

// Get other tasks for team member
exports.getOtherTasksForTeamMember = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const userId = req.user.user_id;
  const subDepartmentId = req.user.sub_department_id;

  Task.getOtherTasksForTeamMember(userId, subDepartmentId, (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(tasks);
  });
};

// Log interaction and store in Redis
exports.logInteraction = (req, res) => {
  const { taskId, interactionType, interactionDetail } = req.body;
  const userId = req.user.user_id;

  const interactionData = {
    user_id: userId,
    task_id: taskId,
    interaction_type: interactionType,
    interaction_detail: interactionDetail
  };

  Task.logInteraction(interactionData, (err, result) => {
    if (err) {
      console.error('Error logging interaction:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Store interaction in Redis
    const redisKey = `interaction:${userId}:${taskId}`;
    redisClient.set(redisKey, JSON.stringify(interactionData), 'EX', 3600 * 24 * 7); // Set expiration to 7 days

    res.status(201).json({ message: 'Interaction logged successfully' });
  });
};

// Get interactions by task ID and check Redis
exports.getInteractionsByTaskId = (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user.user_id;

  const redisKey = `interaction:${userId}:${taskId}`;
  redisClient.get(redisKey, (err, redisResult) => {
    if (err) {
      console.error('Error fetching interaction from Redis:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (redisResult) {
      console.log('Interaction found in Redis:', redisResult);
      return res.status(200).json([JSON.parse(redisResult)]); // Ensure the response is an array
    }

    Task.getInteractionsByTaskId(taskId, (err, result) => {
      if (err) {
        console.error('Error fetching interactions:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(200).json(result);
    });
  });
};

// Get tasks by status
exports.getTasksByStatus = (req, res) => {
  const { status } = req.params;
  Task.getTasksByStatus(status, (err, tasks) => {
    if (err) {
      console.error('Error fetching tasks by status:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json(tasks);
  });
};

// Get unintracted tasks for team member
exports.getUnintractedTasksForTeamMember = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const userId = req.user.user_id;
  const subDepartmentId = req.user.sub_department_id;

  Task.getUnintractedTasksForTeamMember(userId, subDepartmentId, (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(tasks);
  });
};