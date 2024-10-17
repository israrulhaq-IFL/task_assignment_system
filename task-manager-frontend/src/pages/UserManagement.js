import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Table, Button, Form, Container, Alert } from 'react-bootstrap';
import withRole from '../hoc/withRole'; // Import the withRole HOC
import './UserManagement.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

// Define roles statically
const roles = ['HOD', 'Manager', 'Team Member', 'Super Admin'];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]); // State to store sub-departments
  const [filteredSubDepartments, setFilteredSubDepartments] = useState([]); // State to store filtered sub-departments
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department_name: '', // Use department_name instead of department_id
    sub_department_id: ''
  });

  const loggedInUserId = localStorage.getItem('user_id'); // Assuming user_id is stored in localStorage
  const token = localStorage.getItem('accessToken'); // Get the token from local storage

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No token found in localStorage');
      setError('No token found');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('There was an error fetching the users!', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error);
      }
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      }); // Include the token in the headers
      console.log('Fetched departments:', response.data); // Debugging log
      setDepartments(response.data);
    } catch (error) {
      console.error('There was an error fetching the departments!', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error);
      }
    }
  }, [token]);

  const fetchSubDepartments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sub-departments`, {
        headers: { Authorization: `Bearer ${token}` }
      }); // Include the token in the headers
      console.log('Fetched sub-departments:', response.data); // Debugging log
  
      // Log each sub-department to verify the structure
      response.data.forEach(subDept => {
        console.log(`Sub-department ID: ${subDept.sub_department_id}, Department Name: ${subDept.department_name}`);
      });
  
      setSubDepartments(response.data);
    } catch (error) {
      console.error('There was an error fetching the sub-departments!', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchSubDepartments(); // Fetch sub-departments
  }, [fetchUsers, fetchDepartments, fetchSubDepartments]);

  const handleEditClick = (user) => {
    setEditingUser(user.user_id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department_name: departments.find(dept => dept.department_id === user.department_id)?.department_name || '',
      sub_department_id: user.sub_department_id || ''
    });
    const filtered = subDepartments.filter(subDept => subDept.department_name === user.department_name);
    setFilteredSubDepartments(filtered);
  };

  const handleDeleteClick = async (userId) => {
    if (userId === parseInt(loggedInUserId, 10)) {
      setError('You cannot delete your own account.');
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('There was an error deleting the user!', error);
      if (error.response) {
        setError(error.response.data.error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change - ${name}: ${value}`); // Logging input changes
    setFormData({ ...formData, [name]: value });

    if (name === 'department_name') {
      console.log('Selected department name:', value); // Debugging log
      console.log('All sub-departments:', subDepartments); // Debugging log
    
      subDepartments.forEach(subDept => {
        console.log(`Sub-department ID: ${subDept.sub_department_id}, Department Name: ${subDept.department_name}`);
      });
    
      const filtered = subDepartments.filter(subDept => subDept.department_name === value);
      console.log('Filtered sub-departments:', filtered); // Debugging log
      setFilteredSubDepartments(filtered);
      setFormData({ ...formData, department_name: value, sub_department_id: '' });
    }

    if (name === 'role') {
      if (value === 'HOD' || value === 'Super Admin') {
        setFormData({ ...formData, sub_department_id: '' });
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No token found');
      return;
    }

 // Convert department_name to department_id before saving
 const department = departments.find(dept => dept.department_name === formData.department_name);
 const department_id = department ? department.department_id : null;


 const updatedFormData = {
  ...formData,
  department_id, // Use department_id instead of department_name
  department_name: undefined, // Remove department_name from the form data
  sub_department_id: formData.sub_department_id === '' ? null : formData.sub_department_id
};

    try {
      if (editingUser) {
        await axios.put(`${API_BASE_URL}/api/users/${editingUser}`, updatedFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/users`, updatedFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchUsers();
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: '',
        department_name: '',
        sub_department_id: ''
      });
    } catch (error) {
      console.error('There was an error updating the user!', error);
      if (error.response) {
        setError(error.response.data.error);
      }
    }
  };

  return (
    <Container className="user-management">
      <h1 className="text-center my-4">User Management</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Sub-Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users
            .filter((user, index, self) => user.user_id && self.findIndex(u => u.user_id === user.user_id) === index) // Filter out invalid and duplicate entries
            .map(user => {
              return (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{departments.find(dept => dept.department_id === user.department_id)?.department_name || 'Unknown'}</td>
                  <td>{subDepartments.find(subDept => subDept.sub_department_id === user.sub_department_id)?.sub_department_name || 'Unknown'}</td>
                  <td>
                    <Button variant="warning" onClick={() => handleEditClick(user)}>Edit</Button>{' '}
                    <Button variant="danger" onClick={() => handleDeleteClick(user.user_id)}>Delete</Button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
      {editingUser && (
        <Form onSubmit={handleFormSubmit} className="mt-4">
          <h2>Edit User</h2>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} />
          </Form.Group>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} />
          </Form.Group>
          <Form.Group controlId="formRole">
            <Form.Label>Role</Form.Label>
            <Form.Control as="select" name="role" value={formData.role} onChange={handleInputChange}>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formDepartment">
            <Form.Label>Department</Form.Label>
            <Form.Control as="select" name="department_name" value={formData.department_name} onChange={handleInputChange}>
              <option value="">Select Department</option>
              {departments.map(department => (
                <option key={department.department_id} value={department.department_name}>{department.department_name}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formSubDepartment">
            <Form.Label>Sub-Department</Form.Label>
            <Form.Control as="select" name="sub_department_id" value={formData.sub_department_id} onChange={handleInputChange}>
              <option value="">Select Sub-Department</option>
              {filteredSubDepartments.map(subDepartment => (
                <option key={subDepartment.sub_department_id} value={subDepartment.sub_department_id}>{subDepartment.sub_department_name}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Button variant="primary" type="submit" className="mr-2">Update User</Button>
          <Button variant="secondary" onClick={() => setEditingUser(null)}>Cancel</Button>
        </Form>
      )}
    </Container>
  );
};

export default withRole(UserManagement, ['Super Admin']); // Wrap the component with withRole HOC


//this isgood file ,only saving issue , need to check in local