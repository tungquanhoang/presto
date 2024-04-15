import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import LogoutButton from './LogoutButton';
import NewPresentationModal from './NewPresentationButton';
import { Container, Grid, Box } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import PresentationCard from './PresentationCard';
import BACKEND_PORT from '../config.json';

const Dashboard = () => {
  const [presentations, setPresentations] = useState([]);

  useEffect(() => {
    const fetchPresentations = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:${BACKEND_PORT.BACKEND_PORT}/store`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPresentations(data.store.presentations || []);
      } else {
        console.error('Failed to fetch presentations:', data.error);
        alert('Failed to load presentations.');
      }
    };

    fetchPresentations();
  }, []);

  const navigate = useNavigate();

  const handlePresentationCreate = async (presentationName, description) => {
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
        id: uuidv4(),
        name: presentationName,
        description,
        thumbnail: null,
        slides: [
          {
            // Blank first slide
            id: uuidv4(),
            elements: []
          }
        ]
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
      setPresentations(presentations);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create presentation: ' + error.message);
    }
  };

  return (
    <Container maxWidth='lg'>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <NewPresentationModal onPresentationCreate={handlePresentationCreate} />
        <LogoutButton />
      </Box>
      <Grid container spacing={3}>
        {presentations.map(presentation => (
          <Grid item key={presentation.id} xs={12} sm={6} md={4}>
            <PresentationCard presentation={presentation} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Dashboard;
