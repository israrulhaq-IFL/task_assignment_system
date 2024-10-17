import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TaskList from '../components/TaskList';
import { Alert, Tabs, Tab, Button, Modal, Container } from 'react-bootstrap';
import TaskForm from '../components/TaskForm';
import './Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const TeamMemberDashboard = ({ user }) => {
  const [tasksAssignedToOthers, setTasksAssignedToOthers] = useState([]);
  const [tasksAssignedToMe, setTasksAssignedToMe] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const role = 'Team Member'; // Set role to 'Team Member'

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tasks/team-member`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        const tasks = response.data;
        const tasksAssignedToMe = tasks.filter(task => task.assignees.includes(user.name));
        const tasksAssignedToOthers = tasks.filter(task => !task.assignees.includes(user.name));
        setTasksAssignedToMe(tasksAssignedToMe);
        setTasksAssignedToOthers(tasksAssignedToOthers);
      } catch (error) {
        console.error('There was an error fetching the tasks!', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          setError(error.response.data.error);
        }
      }
    };

    if (user.user_id) {
      fetchTasks();
    }
  }, [user.user_id, user.name]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/tasks/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setTasksAssignedToMe(tasksAssignedToMe.map(task => task.task_id === id ? { ...task, status: newStatus } : task));
      setTasksAssignedToOthers(tasksAssignedToOthers.map(task => task.task_id === id ? { ...task, status: newStatus } : task));
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
      setTasksAssignedToMe(tasksAssignedToMe.filter(task => task.task_id !== id));
      setTasksAssignedToOthers(tasksAssignedToOthers.filter(task => task.task_id !== id));
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
        <h2>Team Member Dashboard</h2>
        <Button variant="primary" onClick={() => setShowForm(true)}>Add Task</Button>
      </div>
      {error && <Alert variant="danger" className="dashboard-alert">{error}</Alert>}
      <Tabs defaultActiveKey="my-tasks" id="task-tabs" className="dashboard-tabs">
        <Tab eventKey="my-tasks" title="My Tasks">
          <TaskList tasks={tasksAssignedToMe} onDelete={handleDelete} onStatusChange={handleStatusChange} user={user} canDragAndDrop={true} />
        </Tab>
        <Tab eventKey="other-tasks" title="Other Tasks in my dept">
          <TaskList tasks={tasksAssignedToOthers} onDelete={handleDelete} onStatusChange={handleStatusChange} user={user} canDragAndDrop={false} />
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