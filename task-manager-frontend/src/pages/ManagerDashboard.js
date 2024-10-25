import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskList from '../components/TaskList';
import { Button, Modal, Alert, Tabs, Tab, Container } from 'react-bootstrap';
import TaskForm from '../components/TaskForm';
import axios from 'axios';
import './Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const ManagerDashboard = () => {
  const { tab } = useParams(); // Get the tab parameter from the route
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const token = localStorage.getItem('accessToken');
        if (!userId) {
          setError('User ID is missing.');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error('There was an error fetching the user data!', error);
        setError('User information is missing.');
      }
    };

    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        console.log('Access Token:', token);
        let url = `${API_BASE_URL}/api/tasks/manager`;
        if (tab === 'my-tasks') {
          url = `${API_BASE_URL}/api/tasks/manager/my-tasks`;
        } else if (tab === 'other-tasks') {
          url = `${API_BASE_URL}/api/tasks/manager/other-tasks`;
        }
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Fetched tasks:', response.data);
        setTasks(response.data);
      } catch (error) {
        console.error('There was an error fetching the tasks!', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          setError(error.response.data.error);
        }
      }
    };

    fetchUser().then(fetchTasks);

    // Fetch role from local storage or API
    const userRole = localStorage.getItem('role');
    setRole(userRole);
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
      setTasks(tasks => tasks.map(task => task.task_id === id ? { ...task, status: newStatus } : task));
      console.log(`Task ${id} status changed to ${newStatus}`);
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
      setTasks(tasks => tasks.filter(task => task.task_id !== id));
      console.log(`Task ${id} deleted`);
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
      const response = await axios.post(`${API_BASE_URL}/api/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const addedTask = response.data;
      // Map `id` to `task_id` for consistency
      const taskWithId = { ...addedTask, task_id: addedTask.id };
      setTasks((prevTasks) => [...prevTasks, taskWithId]);
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
          {console.log('Passing tasks to TaskList:', tasks)}
          <TaskList tasks={tasks} onDelete={handleDelete} onStatusChange={handleStatusChange} user={user} canDragAndDrop={true} />
        </Tab>
        <Tab eventKey="other-tasks" title="Other Team Tasks">
          {console.log('Passing tasks to TaskList:', tasks)}
          <TaskList tasks={tasks} onDelete={handleDelete} onStatusChange={handleStatusChange} user={user} canDragAndDrop={false} />
        </Tab>
      </Tabs>
      <Modal show={showForm} onHide={() => setShowForm(false)} className="dashboard-modal">
        <Modal.Header closeButton>
          <Modal.Title>Add Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {user && <TaskForm addTask={addTask} role={role} user={user} />}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManagerDashboard;