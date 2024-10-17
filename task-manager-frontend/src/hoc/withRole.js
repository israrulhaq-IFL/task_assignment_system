// src/hoc/withRole.js
/**
 * withRole HOC
 * 
 * This higher-order component is used to enforce role-based access control.
 * It wraps a component and checks if the user's role is included in the allowedRoles array.
 * If the user's role is not allowed, it redirects to the /unauthorized page.
 * 
 * Usage:
 * const ComponentWithRole = withRole(Component, ['Super Admin', 'Manager']);
 * 

 */



import React from 'react';
import { Navigate } from 'react-router-dom';

const withRole = (Component, allowedRoles) => {
  return (props) => {
  
    const role = localStorage.getItem('role');
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/login" />;
    }
    return <Component {...props} />;
  };
};

export default withRole;