import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = ({ isLoggedIn, handleLogout, userRole }) => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Task Management System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
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
                <Nav.Link href="#" onClick={handleLogout}>Logout</Nav.Link>
              </>
            )}
            {!isLoggedIn && (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;