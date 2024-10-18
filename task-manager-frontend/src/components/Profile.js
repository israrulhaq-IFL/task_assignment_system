import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Alert, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faEdit, faUpload } from '@fortawesome/free-solid-svg-icons';
import { PersonCircle } from 'react-bootstrap-icons'; // Import a placeholder icon
import './Profile.css'; // Import the CSS file

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const Profile = ({ handleLogout }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    subDepartment: '',
    manager: '',
    hod: '',
    profileImage: null,
  });
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = response.data;
        console.log('User profile data:', profileData); // Log the profile data
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          department: profileData.department_name || '',
          subDepartment: profileData.sub_department_name || '',
          manager: profileData.manager_name || '',
          hod: profileData.hod_name || '',
          profileImage: profileData.profile_image ? `${API_BASE_URL}/${profileData.profile_image}` : null,
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Error fetching profile data');
      }
    };

    fetchProfileData();
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formDataToSend = new FormData();
      formDataToSend.append('profileImage', file);

      try {
        const token = localStorage.getItem('accessToken');
        await axios.put(`${API_BASE_URL}/api/users/profile-image`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        setFormData({ ...formData, profileImage: URL.createObjectURL(file) });
        setSuccess('Profile image updated successfully');
        setError('');
      } catch (error) {
        setError('There was an error updating the profile image');
        setSuccess('');
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`${API_BASE_URL}/api/users/password`, { password: passwordData.password }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Password updated successfully');
      setError('');

      // Log the user out and redirect to the login page
      handleLogout();
    } catch (error) {
      setError('There was an error updating the password');
      setSuccess('');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleShowPasswordUpdate = () => {
    setShowPasswordUpdate(!showPasswordUpdate);
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="8">
          <div className="profile-box">
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <div className="text-center mb-3 profile-image-container">
              {formData.profileImage ? (
                <>
                  <Image src={formData.profileImage} roundedCircle width="150" height="150" className="profile-image" />
                  <FontAwesomeIcon
                    icon={faEdit}
                    className="edit-icon"
                    onClick={() => document.getElementById('profileImageInput').click()}
                  />
                </>
              ) : (
                <>
                  <PersonCircle size={150} className="profile-placeholder" />
                  <Button variant="primary" onClick={() => document.getElementById('profileImageInput').click()}>
                    <FontAwesomeIcon icon={faUpload} /> Upload Image
                  </Button>
                </>
              )}
              <Form.Control
                type="file"
                id="profileImageInput"
                name="profileImage"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
            <Form>
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" value={formData.name || ''} readOnly />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={formData.email || ''} readOnly />
              </Form.Group>
              <Form.Group controlId="formDepartment">
                <Form.Label>Department</Form.Label>
                <Form.Control type="text" name="department" value={formData.department || ''} readOnly />
              </Form.Group>
              <Form.Group controlId="formSubDepartment">
                <Form.Label>Sub-Department</Form.Label>
                <Form.Control type="text" name="subDepartment" value={formData.subDepartment || ''} readOnly />
              </Form.Group>
              <Form.Group controlId="formManager">
                <Form.Label>Manager</Form.Label>
                <Form.Control type="text" name="manager" value={formData.manager || ''} readOnly />
              </Form.Group>
              <Form.Group controlId="formHod">
                <Form.Label>Head of Department</Form.Label>
                <Form.Control type="text" name="hod" value={formData.hod || ''} readOnly />
              </Form.Group>
            </Form>
            <Button variant="primary" onClick={toggleShowPasswordUpdate} className="mt-3">
              {showPasswordUpdate ? 'Cancel Password Update' : 'Update Password'}
            </Button>
            {showPasswordUpdate && (
              <Form onSubmit={handlePasswordSubmit} className="mt-3">
                <Form.Group controlId="formPassword" className="password-group">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={passwordData.password || ''}
                    onChange={handlePasswordChange}
                  />
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="eye-icon"
                    onClick={toggleShowPassword}
                  />
                </Form.Group>
                <Form.Group controlId="formConfirmPassword" className="password-group">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword || ''}
                    onChange={handlePasswordChange}
                  />
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                    className="eye-icon"
                    onClick={toggleShowConfirmPassword}
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Update Password
                </Button>
              </Form>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;