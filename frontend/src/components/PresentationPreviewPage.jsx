// PresentationPreviewPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, IconButton, Box, Grid } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import BACKEND_PORT from '../config.json';

const PresentationPreviewPage = () => {
  const { id } = useParams();
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:${BACKEND_PORT.BACKEND_PORT}/store`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.store && data.store.presentations) {
        const presentation = data.store.presentations.find(p => p.id === id);
        if (presentation && presentation.slides) {
          setSlides(presentation.slides);
          setCurrentSlideIndex(0);
        }
      } else {
        console.error('Failed to fetch slides');
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
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
      <Box display="flex" justifyContent="center" alignItems="center" height={500} my={4}>
        {slides.length
          ? (
            <>
              <Typography variant="h4">{slides[currentSlideIndex]?.content}</Typography>
            </>
            )
          : (
            <Typography>No slides to display.</Typography>
            )}
      </Box>
      <Grid container justifyContent='center' spacing={2}>
        <Grid item xs='auto'>
          <IconButton onClick={handlePreviousSlide} disabled={currentSlideIndex === 0}>
            <ArrowBackIosIcon />
          </IconButton>
        </Grid>
        <Grid item xs={10}>
          <Typography variant='h4' align='center'>{currentSlideIndex + 1}</Typography>
        </Grid>
        <Grid item xs='auto'>
          <IconButton onClick={handleNextSlide} disabled={currentSlideIndex === slides.length - 1}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PresentationPreviewPage;
