import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Image, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import './Header.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const Header = ({ isLoggedIn, handleLogout, userRole }) => {
  const [profileImage, setProfileImage] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = response.data;
        setProfileImage(profileData.profile_image ? `${API_BASE_URL}/${profileData.profile_image}` : '');
        setUserName(profileData.name);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    if (isLoggedIn) {
      fetchProfileData();
    }
  }, [isLoggedIn]);

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Task Management System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            {isLoggedIn && (
              <>
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                {userRole === 'Super Admin' && (
                  <>
                    <Nav.Link as={Link} to="/departments">Department Management</Nav.Link>
                    <Nav.Link as={Link} to="/sub-departments">Sub-Department Management</Nav.Link>
                    <Nav.Link as={Link} to="/user-management">User Management</Nav.Link>
                  </>
                )}
                {userRole === 'HOD' && (
                  <Nav.Link as={Link} to="/dashboard">Head of Department Dashboard</Nav.Link>
                )}
                {userRole === 'Manager' && (
                  <Nav.Link as={Link} to="/dashboard">Manager Dashboard</Nav.Link>
                )}
                {userRole === 'Team Member' && (
                  <Nav.Link as={Link} to="/dashboard">Team Member Dashboard</Nav.Link>
                )}
              </>
            )}
            {!isLoggedIn && (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
          {isLoggedIn && profileImage && (
            <Nav className="ml-auto align-items-center">
              <NavDropdown
                title={
                  <Image src={profileImage} roundedCircle width="40" height="40" className="profile-image" />
                }
                id="profile-dropdown"
                alignRight
              >
                <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item href="#" onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
              <span className="text-white ml-2">{userName} ({userRole})</span>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;