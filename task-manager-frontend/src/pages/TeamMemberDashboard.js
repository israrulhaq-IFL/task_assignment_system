import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskList from '../components/TaskList';
import { Alert, Tabs, Tab, Button, Modal, Container } from 'react-bootstrap';
import TaskForm from '../components/TaskForm';
import './Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const TeamMemberDashboard = ({ user }) => {
  const { tab } = useParams(); // Get the tab parameter from the route
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const role = 'Team Member'; // Set role to 'Team Member'

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        let url = `${API_BASE_URL}/api/tasks/team-member`;
        if (tab === 'my-tasks') {
          url = `${API_BASE_URL}/api/tasks/team-member/my-tasks`;
        } else if (tab === 'other-tasks') {
          url = `${API_BASE_URL}/api/tasks/team-member/other-tasks`;
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

    if (user && user.user_id) {
      fetchTasks();
    }
  }, [tab, user]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/tasks/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setTasks(tasks.map(task => task.task_id === id ? { ...task, status: newStatus } : task));
    } catch (error) {
      console.error('There was an error updating the task status!', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setTasks(tasks.filter(task => task.task_id !== id));
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
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(`${API_BASE_URL}/api/tasks`, task, {
        headers: { Authorization: `Bearer ${token}` }
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

  const handleTabSelect = (key) => {
    navigate(`/dashboard/${key}`);
  };

  return (
    <Container className="dashboard-container">
      <div className="dashboard-header">
        <h2>Team Member Dashboard</h2>
        <Button variant="primary" onClick={() => setShowForm(true)}>Add Task</Button>
      </div>
      {error && <Alert variant="danger" className="dashboard-alert">{error}</Alert>}
      <Tabs activeKey={tab} onSelect={handleTabSelect} id="task-tabs" className="dashboard-tabs">
        <Tab eventKey="my-tasks" title="My Tasks">
          <TaskList tasks={tasks} onDelete={handleDelete} onStatusChange={handleStatusChange} user={user} canDragAndDrop={true} />
        </Tab>
        <Tab eventKey="other-tasks" title="Other Tasks in my dept">
          <TaskList tasks={tasks} onDelete={handleDelete} onStatusChange={handleStatusChange} user={user} canDragAndDrop={false} />
        </Tab>
      </Tabs>
      <Modal show={showForm} onHide={() => setShowForm(false)} className="dashboard-modal">
        <Modal.Header closeButton>
          <Modal.Title>Add Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TaskForm addTask={addTask} role={role} user={user} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default TeamMemberDashboard;