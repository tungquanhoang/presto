import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import BACKEND_PORT from '../config.json';

const PresentationEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchPresentation = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:${BACKEND_PORT.BACKEND_PORT}/store`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        const presentation = data.store.presentations.find(p => p.id === id);
        setPresentation(presentation);
      } else {
        alert('Failed to fetch presentation details.');
      }
    };

    fetchPresentation();
  }, [id]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleDeletePresentation = async () => {
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

      const updatedPresentations = storeData.store.presentations.filter(p => p.id !== id);

      const updateResponse = await fetch(`http://localhost:${BACKEND_PORT.BACKEND_PORT}/store`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ store: { ...storeData.store, presentations: updatedPresentations } })
      });

      const updateData = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updateData.error || 'Failed to update store');
      }

      console.log('Presentation deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete presentation: ' + error.message);
    }
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4">Edit Presentation: {presentation?.name}</Typography>
      <Button onClick={handleBack} color="primary">Back to Dashboard</Button>
      <Button onClick={handleOpenDeleteDialog} color="secondary">Delete Presentation</Button>
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Are you sure you want to delete this presentation?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone. Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            No
          </Button>
          <Button onClick={handleDeletePresentation} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PresentationEditPage;
