import React, { useState, useEffect } from 'react';
import TaskCard from './TaskCard';
import { Badge, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Eye } from 'react-bootstrap-icons';
import './TaskList.css'; // Import the CSS file

const ItemTypes = {
  TASK: 'task',
};

const TaskList = ({ tasks, onDelete, onStatusChange, user, canDragAndDrop }) => {
  const [taskList, setTaskList] = useState([]);
  const [hiddenPendingTasks, setHiddenPendingTasks] = useState([]);
  const [hiddenInProgressTasks, setHiddenInProgressTasks] = useState([]);
  const [hiddenCompletedTasks, setHiddenCompletedTasks] = useState([]);
  const [expandedPendingTaskId, setExpandedPendingTaskId] = useState(null);
  const [expandedInProgressTaskId, setExpandedInProgressTaskId] = useState(null);
  const [expandedCompletedTaskId, setExpandedCompletedTaskId] = useState(null);

  useEffect(() => {
    console.log('TaskList received tasks:', tasks); // Log the received tasks
    // Sort tasks by created_at date in descending order
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setTaskList(sortedTasks);
  }, [tasks]);

  const handleStatusChange = (taskId, newStatus) => {
    setTaskList(taskList.map(task => task.task_id === taskId ? { ...task, status: newStatus } : task));
    onStatusChange(taskId, newStatus);
  };

  const handleExpand = (taskId, status) => {
    if (status === 'pending') {
      setExpandedPendingTaskId(expandedPendingTaskId === taskId ? null : taskId);
    } else if (status === 'in progress') {
      setExpandedInProgressTaskId(expandedInProgressTaskId === taskId ? null : taskId);
    } else if (status === 'completed') {
      setExpandedCompletedTaskId(expandedCompletedTaskId === taskId ? null : taskId);
    }
  };

  const moveTask = (taskId, newStatus) => {
    handleStatusChange(taskId, newStatus);
  };

  const handleHideTask = (taskId, status) => {
    if (status === 'pending') {
      setHiddenPendingTasks([...hiddenPendingTasks, taskId]);
    } else if (status === 'in progress') {
      setHiddenInProgressTasks([...hiddenInProgressTasks, taskId]);
    } else if (status === 'completed') {
      setHiddenCompletedTasks([...hiddenCompletedTasks, taskId]);
    }
  };

  const handleUnhideAllTasks = (status) => {
    if (status === 'pending') {
      setHiddenPendingTasks([]);
    } else if (status === 'in progress') {
      setHiddenInProgressTasks([]);
    } else if (status === 'completed') {
      setHiddenCompletedTasks([]);
    }
  };

  const Task = ({ task, index, status }) => {
    const [, ref] = useDrag({
      type: ItemTypes.TASK,
      item: { taskId: task.task_id, status },
      canDrag: canDragAndDrop, // Disable drag if canDragAndDrop is false
    });

    return (
      <div ref={canDragAndDrop ? ref : null}>
        <TaskCard
          task={task}
          onDelete={onDelete}
          onStatusChange={handleStatusChange}
          isExpanded={status === 'pending' ? expandedPendingTaskId === task.task_id : status === 'in progress' ? expandedInProgressTaskId === task.task_id : expandedCompletedTaskId === task.task_id}
          onExpand={() => handleExpand(task.task_id, status)}
          onHide={(taskId) => handleHideTask(taskId, status)}
          user={user} // Pass the user prop to TaskCard
        />
      </div>
    );
  };

  const Column = ({ status, children }) => {
    const [, ref] = useDrop({
      accept: ItemTypes.TASK,
      drop: (item) => moveTask(item.taskId, status),
    });

    const hiddenTasks = status === 'pending' ? hiddenPendingTasks : status === 'in progress' ? hiddenInProgressTasks : status === 'completed' ? hiddenCompletedTasks : [];

    return (
      <div ref={ref} className="task-column">
        <div className="task-column-header">
          <h3>{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
          <Badge pill className={`task-count ${status.replace(' ', '-')} shadow-sm`}>{children.length}</Badge>
          <OverlayTrigger placement="top" overlay={<Tooltip>Unhide All</Tooltip>}>
            <Button variant="link" onClick={() => handleUnhideAllTasks(status)} disabled={hiddenTasks.length === 0}>
              <Eye />
            </Button>
          </OverlayTrigger>
        </div>
        {children}
      </div>
    );
  };

  const pendingTasks = taskList.filter(task => task.status === 'pending' && !hiddenPendingTasks.includes(task.task_id));
  const inProgressTasks = taskList.filter(task => task.status === 'in progress' && !hiddenInProgressTasks.includes(task.task_id));
  const completedTasks = taskList.filter(task => task.status === 'completed' && !hiddenCompletedTasks.includes(task.task_id));

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="task-list-container">
        <Column status="pending">
          {pendingTasks.map((task, index) => (
            <Task key={task.task_id} task={task} index={index} status="pending" />
          ))}
        </Column>
        <Column status="in progress">
          {inProgressTasks.map((task, index) => (
            <Task key={task.task_id} task={task} index={index} status="in progress" />
          ))}
        </Column>
        <Column status="completed">
          {completedTasks.map((task, index) => (
            <Task key={task.task_id} task={task} index={index} status="completed" />
          ))}
        </Column>
      </div>
    </DndProvider>
  );
};

export default TaskList;