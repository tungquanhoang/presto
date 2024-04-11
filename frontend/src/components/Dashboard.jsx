import React from 'react'
import LogoutButton from './LogoutButton';
import { Container } from '@material-ui/core';

const Dashboard = () => {
  return (
    <Container maxWidth='lg'>
      <div>Dashboard</div>
      <LogoutButton></LogoutButton>
    </Container>
  );
}

export default Dashboard;
