import React, { useState, useEffect } from 'react';
import TaskList from '../components/TaskList';
import { Button, Modal, Alert } from 'react-bootstrap';
import TaskForm from '../components/TaskForm';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const HeadOfDepartmentDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTasks(response.data);
      } catch (error) {
        console.error('There was an error fetching the tasks!', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          setError(error.response.data.error);
        }
      }
    };

    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/tasks/${taskId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTasks(tasks.map(task => task.task_id === taskId ? { ...task, status: newStatus } : task));
    } catch (error) {
      console.error('There was an error updating the task status!', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error);
      }
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTasks(tasks.filter(task => task.task_id !== taskId));
    } catch (error) {
      console.error('There was an error deleting the task!', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error);
      }
    }
  };

  const addTask = async (task) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/tasks`, task, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTasks([...tasks, response.data]);
      setShowForm(false);
    } catch (error) {
      console.error('There was an error adding the task!', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error);
      }
    }
  };

  return (
    <div>
      <h2>Head of Department Dashboard</h2>
      <div className="text-center mb-4">
        <Button variant="primary" onClick={() => setShowForm(true)}>Add Task</Button>
      </div>
      {showError && <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
        You do not have permission to change the status of tasks.
      </Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <TaskList tasks={tasks} onDelete={handleDelete} onStatusChange={handleStatusChange} />
      <Modal show={showForm} onHide={() => setShowForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TaskForm addTask={addTask} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default HeadOfDepartmentDashboard;