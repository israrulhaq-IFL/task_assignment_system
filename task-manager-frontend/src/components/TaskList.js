import React, { useState, useEffect } from 'react';
import TaskColumn from './TaskColumn';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './TaskList.css'; // Import the CSS file

const TaskList = ({ tasks, onDelete, onStatusChange, user, canDragAndDrop, filter }) => {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    setPendingTasks(tasks.filter(task => task.status === 'pending'));
    setInProgressTasks(tasks.filter(task => task.status === 'in progress'));
    setCompletedTasks(tasks.filter(task => task.status === 'completed'));
  }, [tasks]);

  const handleStatusChange = (taskId, newStatus) => {
    onStatusChange(taskId, newStatus);

    setPendingTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
    setInProgressTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
    setCompletedTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskId));

    const updatedTask = tasks.find(task => task.task_id === taskId);
    if (updatedTask) {
      updatedTask.status = newStatus;
      updatedTask.interacted = true;
      if (newStatus === 'pending') {
        setPendingTasks(prevTasks => [...prevTasks, updatedTask]);
      } else if (newStatus === 'in progress') {
        setInProgressTasks(prevTasks => [...prevTasks, updatedTask]);
      } else if (newStatus === 'completed') {
        setCompletedTasks(prevTasks => [...prevTasks, updatedTask]);
      }
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="task-list-container">
        <TaskColumn tasks={pendingTasks} status="pending" onDelete={onDelete} onStatusChange={handleStatusChange} user={user} canDragAndDrop={canDragAndDrop} filter={filter} />
        <TaskColumn tasks={inProgressTasks} status="in progress" onDelete={onDelete} onStatusChange={handleStatusChange} user={user} canDragAndDrop={canDragAndDrop} filter={filter} />
        <TaskColumn tasks={completedTasks} status="completed" onDelete={onDelete} onStatusChange={handleStatusChange} user={user} canDragAndDrop={canDragAndDrop} filter={filter} />
      </div>
    </DndProvider>
  );
};

export default TaskList;