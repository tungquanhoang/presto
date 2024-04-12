import React from 'react'
import LogoutButton from './LogoutButton';
import NewPresentationModal from './NewPresentationButton';
import { Container } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import BACKEND_PORT from '../config.json';

const Dashboard = () => {
  const navigate = useNavigate();

  const handlePresentationCreate = async (presentationName) => {
    const token = localStorage.getItem('token');
    try {
      const storeResponse = await fetch(`http://localhost:${BACKEND_PORT.BACKEND_PORT}/store`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const storeData = await storeResponse.json();

      if (!storeResponse.ok) {
        throw new Error(storeData.error || 'Failed to fetch store data');
      }

      const presentations = storeData.store.presentations || [];
      const newPresentation = {
        id: `presentation${presentations.length + 1}`,
        name: presentationName,
        description: '',
        thumbnail: '/images/default-thumbnail.jpg',
        slides: []
      };

      presentations.push(newPresentation);

      const updateResponse = await fetch(`http://localhost:${BACKEND_PORT.BACKEND_PORT}/store`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ store: { ...storeData.store, presentations } })
      });

      const updateData = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updateData.error || 'Failed to update store');
      }

      console.log('Presentation created successfully:', updateData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create presentation: ' + error.message);
    }
  };

  return (
    <Container maxWidth='lg'>
      <NewPresentationModal onPresentationCreate={handlePresentationCreate} />
      <LogoutButton />
    </Container>
  );
}

export default Dashboard;
