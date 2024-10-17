import React, { useState, useEffect } from 'react';
import TaskList from '../components/TaskList';
import { Button, Modal, Alert, Tabs, Tab, Container,} from 'react-bootstrap';
import TaskForm from '../components/TaskForm';
import axios from 'axios';
import './Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const ManagerDashboard = () => {
  const [tasksAssignedToMe, setTasksAssignedToMe] = useState([]);
  const [tasksAssignedToTeam, setTasksAssignedToTeam] = useState([]);
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
        const token = localStorage.getItem('accessToken'); // Correctly fetch the accessToken from localStorage
        console.log('Access Token:', token); // Log the token
        const response = await axios.get(`${API_BASE_URL}/api/tasks/manager`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Fetched tasks:', response.data); // Log the fetched tasks

        const tasks = response.data;
        const tasksAssignedToMe = tasks.filter(task => task.assignees.includes(user?.name));
        const tasksAssignedToTeam = tasks.filter(task => !task.assignees.includes(user?.name));
        setTasksAssignedToMe(tasksAssignedToMe);
        setTasksAssignedToTeam(tasksAssignedToTeam);
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
    const userRole = localStorage.getItem('role'); // Assuming role is stored in local storage
    setRole(userRole);
  }, [user?.name]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Ensure the status values match the backend expectations
      const validStatuses = ['pending', 'in progress', 'completed'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status value');
      }

      const token = localStorage.getItem('accessToken'); // Correctly fetch the accessToken from localStorage
      await axios.put(`${API_BASE_URL}/api/tasks/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasksAssignedToMe(tasksAssignedToMe.map(task => task.task_id === id ? { ...task, status: newStatus } : task));
      setTasksAssignedToTeam(tasksAssignedToTeam.map(task => task.task_id === id ? { ...task, status: newStatus } : task));
    } catch (error) {
      console.error('There was an error updating the task status!', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error);
      } else {
        setError(error.message);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken'); // Correctly fetch the accessToken from localStorage
      await axios.delete(`${API_BASE_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasksAssignedToMe(tasksAssignedToMe.filter(task => task.task_id !== id));
      setTasksAssignedToTeam(tasksAssignedToTeam.filter(task => task.task_id !== id));
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
      const token = localStorage.getItem('accessToken'); // Correctly fetch the accessToken from localStorage
      const response = await axios.post(`${API_BASE_URL}/api/tasks`, task, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasksAssignedToMe([...tasksAssignedToMe, response.data]);
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
    <Container className="dashboard-container">
      <div className="dashboard-header">
        <h2>Manager Dashboard</h2>
        <Button variant="primary" onClick={() => setShowForm(true)}>Add Task</Button>
      </div>
      {error && <Alert variant="danger" className="dashboard-alert">{error}</Alert>}
      <Tabs defaultActiveKey="my-tasks" id="task-tabs" className="dashboard-tabs">
        <Tab eventKey="my-tasks" title="My Tasks">
          <TaskList tasks={tasksAssignedToMe} onDelete={handleDelete} onStatusChange={handleStatusChange} user={user} canDragAndDrop={true} />
        </Tab>
        <Tab eventKey="other-tasks" title="Other Team Tasks">
          <TaskList tasks={tasksAssignedToTeam} onDelete={handleDelete} onStatusChange={handleStatusChange} user={user} canDragAndDrop={false} />
        </Tab>
      </Tabs>
      <Modal show={showForm} onHide={() => setShowForm(false)} className="dashboard-modal">
        <Modal.Header closeButton>
          <Modal.Title>Add Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TaskForm addTask={addTask} role={role} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManagerDashboard;