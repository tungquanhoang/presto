import React from 'react';
import BACKEND_PORT from '../config.json';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

/* The mmodal/form to delete a presentation */
const DeletePresentationModal = ({ id, openDeleteDialog, setOpenDeleteDialog }) => {
  const navigate = useNavigate();

  // Post the request to delete the presentation from database
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
    <Dialog
      open={openDeleteDialog}
      onClose={() => setOpenDeleteDialog(false)}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle id='alert-dialog-title'>{'Are you sure you want to delete this presentation?'}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          This action cannot be undone. Are you sure you want to continue?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDeleteDialog(false)} color='primary'>
          No
        </Button>
        <Button onClick={handleDeletePresentation} color='primary' autoFocus>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeletePresentationModal;
