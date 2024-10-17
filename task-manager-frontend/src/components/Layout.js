// src/components/Layout.js
import React from 'react';
import { Container } from 'react-bootstrap';
import Header from './Header'; // Import Header component

const Layout = ({ children, isLoggedIn, handleLogout, userRole }) => {
  return (
    <>
      <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} userRole={userRole} /> {/* Pass isLoggedIn, handleLogout, and userRole as props */}
      <Container>
        {children}
      </Container>
    </>
  );
};

export default Layout;