import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Typography, Box, Container, IconButton } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { useParams } from 'react-router-dom';
import BACKEND_PORT from '../config.json';

const PresentationSlidesPage = () => {
  const { id } = useParams();
  const presentationId = id;
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Fetch initial slide data
  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:${BACKEND_PORT.BACKEND_PORT}/store`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (response.ok && data.store && data.store.presentations) {
      const presentation = data.store.presentations.find(p => p.id === presentationId);
      if (presentation && presentation.slides) {
        setSlides(presentation.slides);
        setCurrentSlideIndex(0); // Start from the first slide
      }
    } else {
      console.error('Failed to fetch slides');
    }
  };

  const updateSlidesInStore = async (updatedSlides) => {
    const token = localStorage.getItem('token');
    // Fetch the current store data first
    const fetchResponse = await fetch(`http://localhost:${BACKEND_PORT.BACKEND_PORT}/store`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const storeData = await fetchResponse.json();

    if (!fetchResponse.ok) {
      console.error('Failed to fetch store data:', storeData);
      return false;
    }

    // Find the current presentation and update its slides
    const updatedPresentations = storeData.store.presentations.map(presentation => {
      if (presentation.id === presentationId) {
        return { ...presentation, slides: updatedSlides };
      }
      return presentation;
    });

    // Send the updated store data back to the server
    const updateResponse = await fetch(`http://localhost:${BACKEND_PORT.BACKEND_PORT}/store`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ store: { presentations: updatedPresentations } })
    });

    if (!updateResponse.ok) {
      console.error('Failed to update slides:', await updateResponse.json());
      return false;
    }

    return true;
  };

  const handleAddSlide = async () => {
    const newSlide = {
      id: uuidv4(),
      content: `Slide ${slides.length + 1}`
    };
    const newSlides = [...slides, newSlide];
    if (await updateSlidesInStore(newSlides)) {
      setSlides(newSlides);
      setCurrentSlideIndex(newSlides.length - 1); // View the new slide
    } else {
      alert('Failed to add new slide');
    }
  };

  const handleDeleteSlide = async () => {
    if (slides.length === 1) {
      alert('Cannot delete the only slide. Please delete the presentation instead.');
      return;
    }
    const newSlides = slides.filter((_, index) => index !== currentSlideIndex);
    if (await updateSlidesInStore(newSlides)) {
      setSlides(newSlides);
      setCurrentSlideIndex(prev => (prev - 1 >= 0 ? prev - 1 : 0));
    } else {
      alert('Failed to delete slide');
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4">Slides</Typography>
      <Box position="relative" display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={500} maxHeight="md" my={4} sx={{ border: '1px solid grey' }}>
        {slides.length
          ? (
            <>
                <Typography>{slides[currentSlideIndex]?.content}</Typography>
                <Box position="absolute" bottom={0} left={0} width={50} height={50} display="flex" alignItems="center" justifyContent="center">
                <Typography style={{ fontSize: '1em' }}>{currentSlideIndex + 1}</Typography>
                </Box>
            </>
            )
          : (
          <Typography>No slides to display. Add a new slide.</Typography>
            )}
      </Box>
      <Button onClick={handleAddSlide} variant="contained" color="primary">
        Add New Slide
      </Button>
      {slides.length > 0 && (
          <Button onClick={handleDeleteSlide} variant="contained" color="secondary">
            Delete Slide
          </Button>
      )}
      {slides.length > 1 && (
        <>
          <IconButton onClick={handlePreviousSlide} disabled={currentSlideIndex === 0}>
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton onClick={handleNextSlide} disabled={currentSlideIndex === slides.length - 1}>
            <ArrowForwardIosIcon />
          </IconButton>
        </>
      )}
    </Container>
  );
};

export default PresentationSlidesPage;
