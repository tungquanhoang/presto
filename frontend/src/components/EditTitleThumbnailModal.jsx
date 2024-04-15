import React from 'react';
import BACKEND_PORT from '../config.json';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core';

/* The modal/form to edit the title and thumbnail of the presentation */
const EditTitleThumbnailModal = ({ openEditModal, handleCloseEditModal, presentation, setPresentation, newTitle, setNewTitle, newThumbnail, setNewThumbnail }) => {
  // Post a request to update the presentation details
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

  return (
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
  )
}

export default EditTitleThumbnailModal;
