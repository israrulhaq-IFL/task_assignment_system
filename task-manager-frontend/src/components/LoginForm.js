import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; // Ensure this path is correct

const LoginForm = ({ onLogin, onForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, { email, password });
            
            // Store the tokens in localStorage
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            // Fetch the user's role
            const userResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${response.data.accessToken}` }
            });
            localStorage.setItem('role', userResponse.data.role);
            localStorage.setItem('user_id', userResponse.data.user_id);

            // Call the onLogin function if provided
            if (onLogin) {
                onLogin(response.data.accessToken);
            }

            // Redirect to the dashboard or another page
            navigate('/dashboard');
        } catch (error) {
            console.error('There was an error logging in!', error);
            if (error.response) {
                // Server responded with a status other than 2xx
                if (error.response.status === 400) {
                    setErrorMessage('Your username or password is incorrect.');
                } else {
                    setErrorMessage('There was a problem with the server. Please try again later.');
                }
            } else if (error.request) {
                // Request was made but no response was received
                setErrorMessage('Network error. Please check your internet connection.');
            } else {
                // Something else happened while setting up the request
                setErrorMessage('An unexpected error occurred. Please try again.');
            }
        }
    };

    const handleRegister = () => {
        navigate('/register');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Form onSubmit={handleSubmit} className="auth-form">
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <Form.Group controlId="formEmail">
                <Form.Label>Email:</Form.Label>
                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>
            <Form.Group controlId="formPassword" className="password-group">
                <Form.Label>Password:</Form.Label>
                <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <span className="eye-icon" onClick={togglePasswordVisibility}>
                    {showPassword ? '🙈' : '👁️'}
                </span>
            </Form.Group>
            <Button variant="primary" type="submit">Login</Button>
            <Button variant="link" className="register-btn" onClick={handleRegister}>Register</Button>
            <Button variant="link" className="forgot-password-btn" onClick={onForgotPassword}>Forgot Password</Button>
        </Form>
    );
};

export default LoginForm;