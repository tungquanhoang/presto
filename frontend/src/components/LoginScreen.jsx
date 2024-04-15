import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Container, FormControl, Input, InputLabel, Link } from '@material-ui/core';
import BACKEND_PORT from '../config.json';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Handle login logic
  const handleLogin = async () => {
    // POST request to log the user in
    const response = await fetch('http://localhost:' + BACKEND_PORT.BACKEND_PORT + '/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json();
    if (data.error) {
      // Set new error if the request returns an error
      setError(data.error);
    } else {
      // Save token to localStorage for future authentication
      localStorage.setItem('token', data.token);
      // Redirect to dashboard
      navigate('/dashboard');
    }
  };

  // Submit the form on Enter key press
  const handleEnterKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container maxWidth='sm'>
      <Typography variant='h2' align='center'>Presto</Typography>
      <Typography variant='h4' align='center'>Login</Typography>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
        onKeyDown={handleEnterKeyDown}>
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
        {error && <Typography variant='body2' color='error'>{error}</Typography>}
        <Typography gutterBottom>
          Don&apos;t have an account? Register <Link href='/register'>here</Link>.
        </Typography>
        <Button type='submit' variant='contained' color='primary'>
          Login
        </Button>
      </form>
    </Container>
  );
}

export default LoginScreen;
