// PresentationPreviewPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, IconButton, Box, Grid, CircularProgress } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import BACKEND_PORT from '../config.json';
import PresentationSlideElement from './PresentationSlideElement';

const PresentationPreviewPage = () => {
  const { id } = useParams();
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true); // Indicate that the page is fetching the slide

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
          setLoading(false);
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

  /* Placeholder fucntions so that double-clicking and right-clicking behaviors do not trigger */
  const handleDoubleClick = () => { };

  const handleRightClick = () => { };

  return (
    <Box height="95vh" sx={{ overflow: 'hidden' }}>
      {loading
        ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress />
          </Box>
          )
        : (
        <>
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" position="relative">
            {slides[currentSlideIndex].elements.map((element, index) => (
              <PresentationSlideElement key={index} element={element} index={index} handleDoubleClick={handleDoubleClick} handleRightClick={handleRightClick}></PresentationSlideElement>
            ))}
          </Box>
          <Box position="absolute" bottom={20} left={0} right={0}>
            <Grid container display='flex' justifyContent='center' spacing={2}>
              <Grid item xs={'auto'}>
                <IconButton onClick={handlePreviousSlide} disabled={currentSlideIndex === 0}>
                  <ArrowBackIosIcon />
                </IconButton>
              </Grid>
              <Grid item xs={2}>
                <Typography variant='h4' align='center'>{currentSlideIndex + 1}</Typography>
              </Grid>
              <Grid item xs={'auto'}>
                <IconButton onClick={handleNextSlide} disabled={currentSlideIndex === slides.length - 1}>
                  <ArrowForwardIosIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        </>
          )}
    </Box>
  );
};

export default PresentationPreviewPage;
