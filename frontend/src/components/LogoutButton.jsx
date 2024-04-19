import React from 'react';
import { Button } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

/* Component for the logout button logics */
const LogoutButton = () => {
  const navigate = useNavigate();

  // Handle log out logic
  const handleLogout = () => {
    // Clear token from local storage
    localStorage.removeItem('token');
    // Redirect to login screen
    navigate('/login');
  };

  return (
    <Button variant='contained' color='secondary' onClick={handleLogout}>
      Log Out
    </Button>
  );
}

export default LogoutButton;
