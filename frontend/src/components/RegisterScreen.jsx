import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Container, FormControl, Input, InputLabel, Link } from '@material-ui/core';
import BACKEND_PORT from '../config.json';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if the user already logged in/registered
  useEffect(() => {
    // Token available then user logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Handle register logic
  const handleRegister = async () => {
    // Verify password
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // POST request to register user
    const response = await fetch('http://localhost:' + BACKEND_PORT.BACKEND_PORT + '/admin/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (data.error) {
      setError(data.error);
    } else {
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    }
  };

  // Submit the form on Enter key press
  const handleEnterKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <Container maxWidth='sm'>
      <Typography variant='h2' align='center'>Presto</Typography>
      <Typography variant='h4' align='center'>Register</Typography>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleRegister();
      }} onKeyDown={handleEnterKeyDown}>
        <FormControl fullWidth margin='normal' required>
          <InputLabel htmlFor='email'>Email</InputLabel>
          <Input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl fullWidth margin='normal' required>
          <InputLabel htmlFor='password'>Password</InputLabel>
          <Input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <FormControl fullWidth margin='normal' required>
          <InputLabel htmlFor='confirmPassword'>Confirm Password</InputLabel>
          <Input
            id='confirmPassword'
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormControl>
        <FormControl fullWidth margin='normal' required>
          <InputLabel htmlFor='name'>Name</InputLabel>
          <Input
            id='name'
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>
        {error && <Typography variant='body2' color='error'>{error}</Typography>}
        <Typography gutterBottom>
          Already have an account? Log in your account <Link href='/login'>here</Link>.
        </Typography>
        <Button type='submit' variant='contained' color='primary'>
          Register
        </Button>
      </form>
    </Container>
  );
};

export default RegisterScreen;
