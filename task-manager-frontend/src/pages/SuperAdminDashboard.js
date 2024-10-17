import React from 'react';
import { Container } from 'react-bootstrap';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  return (
    <Container className="super-admin-dashboard">
      <h1 className="text-center my-4">Super Admin Dashboard</h1>
      <p>Welcome to the Super Admin Dashboard. Use the navigation bar to access different sections.</p>
    </Container>
  );
};

export default SuperAdminDashboard;