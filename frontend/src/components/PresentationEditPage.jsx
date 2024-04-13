import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@material-ui/core';
import PresentationSlidesPage from './PresentationSlidesPage';
import BACKEND_PORT from '../config.json';

const PresentationEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newThumbnail, setNewThumbnail] = useState('');

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
        const foundPresentation = data.store.presentations.find(p => p.id === id);
        setPresentation(foundPresentation);
        setNewTitle(foundPresentation?.name);
        setNewThumbnail(foundPresentation?.thumbnail);
      } else {
        alert('Failed to fetch presentation details.');
      }
    };

    fetchPresentation();
  }, [id]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleOpenEditModal = () => {
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handleUpdatePresentation = async () => {
    const updatedPresentation = { ...presentation, name: newTitle, thumbnail: newThumbnail || null };
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:${BACKEND_PORT.BACKEND_PORT}/store`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ store: { presentations: [updatedPresentation] } }) // Simplified, update your backend as needed
    });

    if (response.ok) {
      setPresentation(updatedPresentation);
      handleCloseEditModal();
    } else {
      alert('Failed to update presentation details.');
    }
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

  return (
    <Container maxWidth="sm">
      <Typography variant="h4">Edit Presentation: {presentation?.name}</Typography>
      <Button onClick={handleBack} color="primary">Back to Dashboard</Button>
      <Button onClick={handleOpenEditModal} color="primary">Edit Title and Thumbnail</Button>
      <Button onClick={() => setOpenDeleteDialog(true)} color="secondary">Delete Presentation</Button>

      <Dialog open={openEditModal} onClose={handleCloseEditModal}>
        <DialogTitle>Edit Presentation Details</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Thumbnail URL"
            type="text"
            fullWidth
            value={newThumbnail}
            onChange={(e) => setNewThumbnail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdatePresentation} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            No
          </Button>
          <Button onClick={handleDeletePresentation} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      {presentation && <PresentationSlidesPage presentationId={id} />}
    </Container>
  );
};

export default PresentationEditPage;
