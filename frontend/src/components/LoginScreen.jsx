import React, { useState } from 'react'
// import { useHistory } from 'react-router-dom';
import { Button, Typography, Container, FormControl, Input, InputLabel } from '@material-ui/core';
import BACKEND_PORT from '../config.json';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // const history = useHistory();

  // Handle login logic
  const handleLogin = async () => {
    try {
      // Show error if email or password is empty
      if (!email || !password) {
        setError('Please enter your email and password.');
        return;
      }

      const response = await fetch('http://localhost:' + BACKEND_PORT + '/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json();
      if (data.error) {
        // Throw an error if the request returns an error
        throw new Error(data.error);
      } else {
        // Save token to localStorage for future authentication
        localStorage.setItem('token', data.token);
      }

      // TODO: Redirect to dashboard
      // history.push('/dashboard');
    } catch (error) {
      setError(error)
    }
  };

  // Submit the form on Enter key press
  const handleEnterKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center">Login</Typography>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
        onKeyDown={handleEnterKeyDown}>
        <FormControl fullWidth margin="normal">
          <InputLabel htmlFor="email">Email</InputLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel htmlFor="password">Password</InputLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        {error && <Typography variant="body2" color="error">{error}</Typography>}
        <Button type="submit" variant="contained" color="primary">
          Login
        </Button>
      </form>
    </Container>
  );
}

export default LoginScreen;
