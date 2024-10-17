import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

const RegisterForm = ({ onRegister }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            const response = await axios.post('http://localhost:3001/api/auth/register', { name, email, password });
            onRegister(response.data.message);
        } catch (error) {
            console.error('There was an error registering!', error);
        }
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <Form onSubmit={handleSubmit} className="auth-form">
            <Form.Group controlId="formName">
                <Form.Label>Name:</Form.Label>
                <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>
            <Form.Group controlId="formEmail">
                <Form.Label>Email:</Form.Label>
                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>
            <Form.Group controlId="formPassword">
                <Form.Label>Password:</Form.Label>
                <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>
            <Form.Group controlId="formConfirmPassword">
                <Form.Label>Confirm Password:</Form.Label>
                <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </Form.Group>
            <Button variant="primary" type="submit">Register</Button>
            <Button variant="secondary" onClick={handleLoginClick}>Log In</Button>
        </Form>
    );
};

export default RegisterForm;