import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import axios from 'axios';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import HeadOfDepartmentDashboard from './pages/HeadOfDepartmentDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import TeamMemberDashboard from './pages/TeamMemberDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import DepartmentManagement from './pages/DepartmentManagement'; // Import the DepartmentManagement page
import SubDepartmentManagement from './pages/SubDepartmentManagement'; // Import the SubDepartmentManagement page
import UserManagement from './pages/UserManagement'; // Import the UserManagement page
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { Container, Row, Col } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode'; // Corrected import statement
import withRole from './hoc/withRole'; // Import the withRole HOC
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const DepartmentManagementWithRole = withRole(DepartmentManagement, ['Super Admin']);
const SubDepartmentManagementWithRole = withRole(SubDepartmentManagement, ['Super Admin']);
const UserManagementWithRole = withRole(UserManagement, ['Super Admin']); // Wrap UserManagement with withRole HOC

function App() {
  const [token, setToken] = useState(localStorage.getItem('accessToken') || '');
  const [user, setUser] = useState({ role: '', department_id: '', sub_department_id: '' });
  const navigate = useNavigate();

  const isTokenExpired = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, { token: refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      setToken(accessToken);
    } catch (error) {
      console.error('Error refreshing token:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user_id');
      localStorage.removeItem('role');
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserInfo = useCallback(() => {
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    if (isTokenExpired(token)) {
      console.log('Token expired, refreshing token');
      refreshToken();
      return;
    }

    axios.get(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        const userData = response.data; // User data is directly available
        console.log('User data:', userData); // Log the user data
        setUser(userData);
      })
      .catch(error => {
        console.error('There was an error fetching the user info!', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
      });
  }, [token, refreshToken]);

  useEffect(() => {
    if (token) {
      fetchUserInfo();
    }
  }, [token, fetchUserInfo]);

  const handleLogin = (accessToken) => {
    setToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
  };

  useEffect(() => {
    if (token) {
      fetchUserInfo();
    }
  }, [token, fetchUserInfo]);

  const handleLogout = () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.error('No token found for logout');
      return;
    }

    axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setToken('');
        localStorage.clear();
        setUser({ role: '', department_id: '', sub_department_id: '' });
        console.log('Logged out successfully');
        navigate('/login'); // Redirect to login page after logout
      })
      .catch(error => {
        console.error('There was an error logging out!', error);
        if (error.response && error.response.status === 404) {
          // If user not found, clear local storage and navigate to login
          setToken('');
          localStorage.clear();
          setUser({ role: '', department_id: '', sub_department_id: '' });
          navigate('/login');
        } else if (error.response) {
          console.error('Error response:', error.response.data);
        }
      });
  };

  const handleRegisterSuccess = (message) => {
    alert(message);
    navigate('/login');
  };

  const renderDashboard = () => {
    console.log('Rendering dashboard for role:', user.role); // Log the user role
    switch (user.role) {
      case 'Team Member':
        return <TeamMemberDashboard user={user} />; // Pass user to TeamMemberDashboard
      case 'Manager':
        return <ManagerDashboard />;
      case 'HOD':
        return <HeadOfDepartmentDashboard />;
      case 'Super Admin':
        return <SuperAdminDashboard />;
      default:
        return null;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout handleLogout={handleLogout} isLoggedIn={!!token} userRole={user.role}>
        <Container>
          <Row className="justify-content-center mt-5">
            <Col xs={12} md={10} lg={8}>
              {token ? (
                <>
                  {user.role === 'Super Admin' ? (
                    <Routes>
                      <Route path="/dashboard" element={<SuperAdminDashboard />} />
                      <Route path="/departments" element={<DepartmentManagementWithRole />} />
                      <Route path="/sub-departments" element={<SubDepartmentManagementWithRole />} />
                      <Route path="/user-management" element={<UserManagementWithRole />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  ) : (
                    user.department_id && user.sub_department_id ? (
                      <Routes>
                        <Route path="/dashboard" element={renderDashboard()} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                      </Routes>
                    ) : (
                      <div>
                        <p>Please wait until you are assigned to a team.</p>
                      </div>
                    )
                  )}
                </>
              ) : (
                <Routes>
                  <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
                  <Route path="/register" element={<RegisterForm onRegister={handleRegisterSuccess} />} />
                  <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
              )}
            </Col>
          </Row>
        </Container>
      </Layout>
    </DndProvider>
  );
}

export default App;