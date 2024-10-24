import React, { useState, useCallback, useMemo } from 'react';
import TaskCard from './TaskCard';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useDrag, useDrop } from 'react-dnd';
import { Eye } from 'react-bootstrap-icons';
import './TaskColumn.css';

const ItemTypes = {
  TASK: 'task',
};

const TaskColumn = ({ tasks, status, onDelete, onStatusChange, user, canDragAndDrop, filter }) => {
  const [hiddenTasks, setHiddenTasks] = useState([]);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const handleStatusChange = useCallback((taskId, newStatus) => {
    onStatusChange(taskId, newStatus);
  }, [onStatusChange]);

  const handleExpand = useCallback((taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  }, [expandedTaskId]);

  const handleHideTask = useCallback((taskId) => {
    setHiddenTasks([...hiddenTasks, taskId]);
  }, [hiddenTasks]);

  const handleUnhideAllTasks = useCallback(() => {
    setHiddenTasks([]);
  }, []);

  const Task = React.memo(({ task, index }) => {
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
          isExpanded={expandedTaskId === task.task_id}
          onExpand={() => handleExpand(task.task_id)}
          onHide={() => handleHideTask(task.task_id)}
          user={user} // Pass the user prop to TaskCard
          canDragAndDrop={canDragAndDrop}
        />
      </div>
    );
  });

  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item) => handleStatusChange(item.taskId, status),
  });

  const filteredTasks = useMemo(() => {
    if (typeof filter === 'function') {
      return tasks.filter(task => !hiddenTasks.includes(task.task_id) && filter(task));
    }
    return tasks.filter(task => !hiddenTasks.includes(task.task_id));
  }, [tasks, hiddenTasks, filter]);

  return (
    <div ref={drop} className="task-column">
      <div className="task-column-header">
        <h3>{status.charAt(0).toUpperCase() + status.slice(1)} {filteredTasks.length}</h3>
        <OverlayTrigger placement="top" overlay={<Tooltip>Unhide All</Tooltip>}>
          <Button variant="link" onClick={handleUnhideAllTasks} disabled={hiddenTasks.length === 0}>
            <Eye />
          </Button>
        </OverlayTrigger>
      </div>
      {filteredTasks.map((task, index) => (
        <Task key={task.task_id || task.id} task={task} index={index} />
      ))}
    </div>
  );
};

export default TaskColumn;