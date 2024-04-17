// PresentationPreviewPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, IconButton, Box, Grid, CircularProgress } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import BACKEND_PORT from '../config.json';
import PresentationSlideElement from './PresentationSlideElement';

const PresentationPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPresentation, setCurrentPresentation] = useState(null);
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true); // Indicate that the page is fetching the slide

  // Fetch initial slide data
  useEffect(() => {
    fetchSlides();
    const urlParams = new URLSearchParams(window.location.search);
    const slideNumber = urlParams.get('slide');
    if (slideNumber) {
      setCurrentSlideIndex(parseInt(slideNumber, 10) - 1);
    }
  }, []);

  // Update URL based on slide number
  useEffect(() => {
    navigate(`/presentation/${id}/preview?slide=${currentSlideIndex + 1}`);
  }, [currentSlideIndex, navigate, id]);

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
        setCurrentPresentation(presentation);
        if (presentation && presentation.slides) {
          setSlides(presentation.slides);
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
  const handleDoubleClick = () => {};
  const handleRightClick = () => {};
  const handleSaveChanges = () => {};

  // Get the slide screen sizes and details for use in rendering slide elements later
  const slideRef = useRef(null);
  const [slideSize, setSlideSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateBoxSize = () => {
      const box = slideRef.current;
      if (box) {
        const { width, height } = box.getBoundingClientRect();
        setSlideSize({ width, height });
      }
    };

    updateBoxSize();
    window.addEventListener('resize', updateBoxSize);
    return () => window.removeEventListener('resize', updateBoxSize);
  }, [loading]);

  return (
    <Box display="flex" flexDirection={'column'} alignItems="center" height="100vh" overflow={'scroll'}>
      {loading
        ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress />
          </Box>
          )
        : (
        <>
          <Typography variant='h3' gutterBottom>Preview</Typography>
          <Box ref={slideRef} style={{ background: (slides[currentSlideIndex].backgroundColor ? slides[currentSlideIndex].backgroundColor : currentPresentation.defaultColor) }} display="flex" justifyContent="center" alignItems="center" minHeight={150} height='40vw' minWidth={266} width='100vw' position="relative" sx={{ border: '2px solid grey' }}>
            {slides[currentSlideIndex].elements.map((element, index) => (
              <PresentationSlideElement key={index} element={element} slideSize={slideSize} index={index} handleDoubleClick={handleDoubleClick} handleRightClick={handleRightClick} handleSaveChanges={handleSaveChanges} isPreview={true}></PresentationSlideElement>
            ))}
          </Box>
          <Box position="absolute" bottom={'1vh'} left={0} right={0}>
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
