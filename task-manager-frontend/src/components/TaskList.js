import React, { useState, useEffect, useCallback } from 'react';
import TaskCard from './TaskCard';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Eye } from 'react-bootstrap-icons';
import './TaskList.css'; // Import the CSS file

const ItemTypes = {
  TASK: 'task',
};

const TaskList = ({ tasks, onDelete, onStatusChange, user, canDragAndDrop }) => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [hiddenTasks, setHiddenTasks] = useState({ pending: [], 'in progress': [], completed: [] });
  const [expandedTaskIds, setExpandedTaskIds] = useState({ pending: null, 'in progress': null, completed: null });

  useEffect(() => {
    console.log('TaskList received tasks:', tasks); // Log the received tasks
    setPendingTasks(tasks.filter(task => task.status === 'pending'));
    setInProgressTasks(tasks.filter(task => task.status === 'in progress'));
    setCompletedTasks(tasks.filter(task => task.status === 'completed'));
  }, [tasks]);

  const handleStatusChange = useCallback((taskId, newStatus) => {
    setPendingTasks(prev => prev.filter(task => task.task_id !== taskId));
    setInProgressTasks(prev => prev.filter(task => task.task_id !== taskId));
    setCompletedTasks(prev => prev.filter(task => task.task_id !== taskId));

    if (newStatus === 'pending') {
      setPendingTasks(prev => [...prev, tasks.find(task => task.task_id === taskId)]);
    } else if (newStatus === 'in progress') {
      setInProgressTasks(prev => [...prev, tasks.find(task => task.task_id === taskId)]);
    } else if (newStatus === 'completed') {
      setCompletedTasks(prev => [...prev, tasks.find(task => task.task_id === taskId)]);
    }

    onStatusChange(taskId, newStatus);
    console.log(`Task ${taskId} status changed to ${newStatus}`);
  }, [tasks, onStatusChange]);

  const handleExpand = useCallback((taskId, status) => {
    setExpandedTaskIds(prev => ({
      ...prev,
      [status]: prev[status] === taskId ? null : taskId
    }));
    console.log(`Task ${taskId} expanded in ${status}`);
  }, []);

  const moveTask = useCallback((taskId, newStatus) => {
    handleStatusChange(taskId, newStatus);
  }, [handleStatusChange]);

  const handleHideTask = useCallback((taskId, status) => {
    setHiddenTasks(prev => ({
      ...prev,
      [status]: [...prev[status], taskId]
    }));
    console.log(`Task ${taskId} hidden in ${status}`);
  }, []);

  const handleUnhideAllTasks = useCallback((status) => {
    setHiddenTasks(prev => ({
      ...prev,
      [status]: []
    }));
    console.log(`All tasks unhidden in ${status}`);
  }, []);

  const Task = React.memo(({ task, status }) => {
    const [, ref] = useDrag({
      type: ItemTypes.TASK,
      item: { taskId: task.task_id || task.id, status },
      canDrag: canDragAndDrop && !task.isDragging, // Disable drag if canDragAndDrop is false or if the task is being dragged
    });

    if (!task.task_id && !task.id) {
      console.error('Task ID is undefined for task:', task);
      return null;
    }

    // Provide a default value for created_at if it is missing
    const taskWithDefaults = {
      ...task,
      created_at: task.created_at || new Date().toISOString(),
    };

    return (
      <div ref={canDragAndDrop ? ref : null} key={task.task_id || task.id}>
        <TaskCard
          task={taskWithDefaults}
          onDelete={onDelete}
          onStatusChange={handleStatusChange}
          isExpanded={expandedTaskIds[status] === task.task_id}
          onExpand={() => handleExpand(task.task_id, status)}
          onHide={(taskId) => handleHideTask(taskId, status)}
          user={user} // Pass the user prop to TaskCard
          canDragAndDrop={canDragAndDrop}
        />
      </div>
    );
  });

  const Column = React.memo(({ status, tasks }) => {
    const [, ref] = useDrop({
      accept: ItemTypes.TASK,
      drop: (item) => moveTask(item.taskId, status),
    });

    const hiddenTasksForStatus = hiddenTasks[status];

    return (
      <div ref={ref} className="task-column">
        <div className="task-column-header">
          <h3>{status.charAt(0).toUpperCase() + status.slice(1)} {tasks.length}</h3>
          <OverlayTrigger placement="top" overlay={<Tooltip>Unhide All</Tooltip>}>
            <Button variant="link" onClick={() => handleUnhideAllTasks(status)} disabled={hiddenTasksForStatus.length === 0}>
              <Eye />
            </Button>
          </OverlayTrigger>
        </div>
        {tasks.filter(task => !hiddenTasksForStatus.includes(task.task_id)).map((task, index) => (
          <Task key={task.task_id || task.id} task={task} status={status} />
        ))}
      </div>
    );
  });

  console.log('Rendering TaskList with tasks:', tasks.length);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="task-list-container">
        <Column status="pending" tasks={pendingTasks} />
        <Column status="in progress" tasks={inProgressTasks} />
        <Column status="completed" tasks={completedTasks} />
      </div>
    </DndProvider>
  );
};

export default React.memo(TaskList);