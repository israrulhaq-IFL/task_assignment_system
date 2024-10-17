import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Table, Button, Form, Container, Alert } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    department_name: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editDepartmentId, setEditDepartmentId] = useState(null);
  const token = localStorage.getItem('accessToken');

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (error) {
      console.error('There was an error fetching the departments!', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('Form data being submitted:', formData);

    try {
      if (editMode) {
        const response = await axios.put(`${API_BASE_URL}/api/departments/${editDepartmentId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(departments.map(dept => (dept.department_id === editDepartmentId ? response.data : dept)));
        setEditMode(false);
        setEditDepartmentId(null);
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/departments`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments([...departments, response.data]);
      }
      setFormData({ department_name: '' });
    } catch (error) {
      console.error('There was an error creating/updating the department!', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error);
      }
    }
  };

  const handleEdit = (department) => {
    setFormData({
      department_name: department.department_name
    });
    setEditMode(true);
    setEditDepartmentId(department.department_id);
  };

  const handleDelete = async (departmentId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/departments/${departmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(departments.filter(dept => dept.department_id !== departmentId));
    } catch (error) {
      console.error('There was an error deleting the department!', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error);
      }
    }
  };

  return (
    <Container className="department-management">
      <h1 className="text-center my-4">Department Management</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleFormSubmit} className="mb-4">
        <Form.Group controlId="formDepartmentName">
          <Form.Label>Department Name</Form.Label>
          <Form.Control type="text" name="department_name" value={formData.department_name} onChange={handleInputChange} />
        </Form.Group>
        <Button variant="primary" type="submit">{editMode ? 'Update Department' : 'Create Department'}</Button>
      </Form>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Department Name</th>
            <th>HOD Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map(department => (
            <tr key={department.department_id}>
              <td>{department.department_id}</td>
              <td>{department.department_name}</td>
              <td>{department.hod_name || 'N/A'}</td>
              <td>
                <Button variant="warning" onClick={() => handleEdit(department)}>Edit</Button>{' '}
                <Button variant="danger" onClick={() => handleDelete(department.department_id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default DepartmentManagement;