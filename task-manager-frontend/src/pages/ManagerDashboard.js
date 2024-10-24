import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskList from '../components/TaskList';
import { Button, Modal, Alert, Tabs, Tab, Container } from 'react-bootstrap';
import TaskForm from '../components/TaskForm';
import axios from 'axios';
import './Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const ManagerDashboard = ({ user }) => {
  const { tab } = useParams(); // Get the tab parameter from the route
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const [myTasks, setMyTasks] = useState([]);
  const [otherTasks, setOtherTasks] = useState([]);

  useEffect(() => {
    // Fetch role from local storage or API
    const userRole = localStorage.getItem('role');
    setRole(userRole);

    const fetchMyTasks = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_BASE_URL}/api/tasks/manager/my-tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyTasks(response.data);
      } catch (error) {
        console.error('There was an error fetching my tasks!', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          setError(error.response.data.error);
        }
      }
    };

    const fetchOtherTasks = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_BASE_URL}/api/tasks/manager/other-tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOtherTasks(response.data);
      } catch (error) {
        console.error('There was an error fetching other tasks!', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          setError(error.response.data.error);
        }
      }
    };

    fetchMyTasks();
    fetchOtherTasks();
  }, [tab]);

  const handleStatusChange = useCallback(async (id, newStatus) => {
    try {
      const validStatuses = ['pending', 'in progress', 'completed'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status value');
      }

      const token = localStorage.getItem('accessToken');
      await axios.put(`${API_BASE_URL}/api/tasks/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the task in the appropriate state
      // This logic will be handled in the TaskColumn component
    } catch (error) {
      console.error('There was an error updating the task status!', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error);
      } else {
        setError(error.message);
      }
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_BASE_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove the task from the appropriate state
      // This logic will be handled in the TaskColumn component
    } catch (error) {
      console.error('There was an error deleting the task!', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error);
      }
    }
  }, []);

  const addTask = useCallback(async (newTask) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_BASE_URL}/api/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // const addedTask = response.data;
      // Map `id` to `task_id` for consistency
      // const taskWithId = { ...addedTask, task_id: addedTask.id };

      // Add the task to the appropriate state
      // This logic will be handled in the TaskColumn component

      setShowForm(false);
      console.log('Task added:', taskWithId);
    } catch (error) {
      console.error('There was an error adding the task!', error);
    }
  }, []);

  const handleTabSelect = (key) => {
    navigate(`/dashboard/${key}`);
  };

  return (
    <Container className="dashboard-container">
      <div className="dashboard-header">
        <h2>Manager Dashboard</h2>
        <Button variant="primary" onClick={() => setShowForm(true)}>Add Task</Button>
      </div>
      {error && <Alert variant="danger" className="dashboard-alert">{error}</Alert>}
      <Tabs activeKey={tab} onSelect={handleTabSelect} id="task-tabs" className="dashboard-tabs">
        <Tab eventKey="my-tasks" title="My Tasks">
          <TaskList tasks={myTasks} onDelete={handleDelete} onStatusChange={handleStatusChange} user={user} canDragAndDrop={true} />
        </Tab>
        <Tab eventKey="other-tasks" title="Other Team Tasks">
          <TaskList tasks={otherTasks} onDelete={handleDelete} onStatusChange={handleStatusChange} user={user} canDragAndDrop={false} />
        </Tab>
      </Tabs>
      <Modal show={showForm} onHide={() => setShowForm(false)} className="dashboard-modal">
        <Modal.Header closeButton>
          <Modal.Title>Add Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {user && <TaskForm addTask={addTask} role={role} user={user} />}
          {user && <TaskForm addTask={addTask} role={role} user={user} />}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManagerDashboard;