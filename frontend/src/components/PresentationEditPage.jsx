import React, { useState, useEffect } from 'react';
import BACKEND_PORT from '../config.json';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Container } from '@material-ui/core';
import PresentationSlidesPage from './PresentationSlidesPage';
import EditTitleThumbnailModal from './EditTitleThumbnailModal';
import DeletePresentationModal from './DeletePresentationModal';

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

  // Open the preview of the presentation in a new tab
  const handlePresentationPreview = () => {
    window.open(`/presentation/${presentation.id}/preview`, '_blank');
  };

  return (
    <Container maxWidth='lg'>
      <Typography variant='h4'>Edit Presentation: {presentation?.name}</Typography>
      <Button onClick={handleBack} color='primary'>Back to Dashboard</Button>
      <Button onClick={handleOpenEditModal} color='primary'>Edit Title and Thumbnail</Button>
      <Button onClick={handlePresentationPreview} color='primary'>Preview</Button>
      <Button onClick={() => setOpenDeleteDialog(true)} color='secondary'>Delete Presentation</Button>

      <EditTitleThumbnailModal openEditModal={openEditModal} handleCloseEditModal={handleCloseEditModal} presentation={presentation} setPresentation={setPresentation} newTitle={newTitle} setNewTitle={setNewTitle} newThumbnail={newThumbnail} setNewThumbnail={setNewThumbnail}></EditTitleThumbnailModal>
      <DeletePresentationModal id={id} openDeleteDialog={openDeleteDialog} setOpenDeleteDialog={setOpenDeleteDialog}></DeletePresentationModal>
      {presentation && <PresentationSlidesPage />}
    </Container>
  );
};

export default PresentationEditPage;
