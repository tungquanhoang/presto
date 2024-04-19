import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core';

const NewPresentationModal = ({ onPresentationCreate }) => {
  // State for controlling the open state of the dialog
  const [open, setOpen] = useState(false);
  // State for handling the input of the presentation name
  const [presentationName, setPresentationName] = useState('');
  // State for handling the input of the presentation description
  const [description, setDescription] = useState('');

  // Function to open the dialog
  const handleOpen = () => {
    setOpen(true);
  };

  // Function to close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Function to handle the creation logic when the "Create" button is clicked
  const handleCreate = () => {
    onPresentationCreate(presentationName, description);
    setPresentationName('');
    setDescription('');
    handleClose();
  };

  return (
    <>
      {/* Button to trigger the opening of the modal dialog */}
      <Button variant='contained' color='primary' onClick={handleOpen}>
        New Presentation
      </Button>
      {/* Modal dialog component from Material-UI */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Presentation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Presentation Name'
            type='text'
            fullWidth
            value={presentationName}
            onChange={(e) => setPresentationName(e.target.value)}
          />
          <TextField
            margin='dense'
            id='description'
            label='Description'
            type='text'
            fullWidth
            multiline
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleCreate} color='primary'>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewPresentationModal;
