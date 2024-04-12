import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core';

const NewPresentationModal = ({ onPresentationCreate }) => {
  const [open, setOpen] = useState(false);
  const [presentationName, setPresentationName] = useState('');
  const [description, setDescription] = useState('');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreate = () => {
    onPresentationCreate(presentationName, description);
    setPresentationName('');
    setDescription('');
    handleClose();
  };

  return (
    <>
      <Button variant='contained' color='primary' onClick={handleOpen}>
        New Presentation
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Presentation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Presentation Name"
            type="text"
            fullWidth
            value={presentationName}
            onChange={(e) => setPresentationName(e.target.value)}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreate} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewPresentationModal;
