import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Typography, Box, Container, IconButton, Menu, MenuItem, Dialog, Grid, CircularProgress, DialogTitle, DialogContent } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { useNavigate, useParams } from 'react-router-dom';
import SlideEditor from './SlideEditor';
import BACKEND_PORT from '../config.json';
import PresentationSlideElement from './PresentationSlideElement';
import { animated, useTransition } from 'react-spring';
import SlideRearrangeScreen from './SlideRearrangeScreen';
import SlideElementEditModal from './SlideElementEditModal';

const PresentationSlidesPage = () => {
  const { id } = useParams(); // Retrieve presentation ID from URL
  const navigate = useNavigate();
  const [currentPresentation, setCurrentPresentation] = useState(null);
  const [slides, setSlides] = useState([]); // Array of slide objects
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null); // For the material-UI menu anchor
  const [editModalOpen, setEditModalOpen] = useState(false); // For the material-UI menu anchor
  const [editingElement, setEditingElement] = useState(null);
  const [loading, setLoading] = useState(true); // State to manage loading indicator
  const [showRearrange, setShowRearrange] = useState(false); // State to toggle the rearrange slides modal
  const slideRef = useRef(null); // Reference to the slide DOM element
  const [slideSize, setSlideSize] = useState({ width: 0, height: 0 }); // Store dimensions of the slide

  const transitions = useTransition(slides[currentSlideIndex], {
    from: { opacity: 0, transform: 'translate3d(100%,0,0)' }, // Starting styles
    enter: { opacity: 1, transform: 'translate3d(0%,0,0)' }, // End styles when entering
    leave: { opacity: 0, transform: 'translate3d(-100%,0,0)' }, // End styles when leaving
    keys: currentSlideIndex
  });
  // Fetch initial slide data
  useEffect(() => {
    fetchSlides();
    const urlParams = new URLSearchParams(window.location.search);
    const slideNumber = urlParams.get('slide');
    if (slideNumber) {
      setCurrentSlideIndex(parseInt(slideNumber, 10) - 1);
    }
    console.log(slides);
  }, []);

  // Update URL based on slide number
  useEffect(() => {
    navigate(`/presentation/${id}/edit?slide=${currentSlideIndex + 1}`);
  }, [currentSlideIndex, navigate, id]);

  const fetchSlides = async () => {
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
      }
      setLoading(false);
    } else {
      console.error('Failed to fetch slides');
    }
  };

  // Update the slides details in database
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
      if (presentation.id === currentPresentation.id) {
        const updatedPresentation = { ...presentation, slides: updatedSlides };
        setCurrentPresentation(updatedPresentation);
        return updatedPresentation;
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
      backgroundColor: null,
      elements: []
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
    setLoading(true);
    if (slides.length === 1) {
      alert('Cannot delete the only slide. Please delete the presentation instead.');
      setLoading(false);
      return;
    }
    const newSlides = slides.filter((_, index) => index !== currentSlideIndex);
    if (await updateSlidesInStore(newSlides)) {
      setSlides(newSlides);
      setCurrentSlideIndex(prev => (prev - 1 >= 0 ? prev - 1 : 0));
    } else {
      alert('Failed to delete slide');
    }
    setLoading(false);
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

  const handleRightClick = (event, element) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setEditingElement(element);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDeleteElement = () => {
    const updatedSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        const filteredElements = slide.elements.filter(el => el.id !== editingElement.id);
        return { ...slide, elements: filteredElements };
      }
      return slide;
    });
    setSlides(updatedSlides);
    handleCloseMenu();

    updateSlidesInStore(updatedSlides).then(success => {
      if (success) {
        console.log('Slides updated successfully');
      } else {
        console.error('Failed to update slides');
      }
    });
  };

  const handleDoubleClick = (element) => {
    setEditingElement(element);
    setEditModalOpen(true);
  };

  const handleSaveChanges = (element) => {
    const updatedElements = slides[currentSlideIndex].elements.map(el =>
      el.id === element.id ? { ...el, ...element } : el
    );
    const updatedSlides = slides.map((slide, idx) =>
      idx === currentSlideIndex ? { ...slide, elements: updatedElements } : slide
    );

    // Log data to see what is being sent to the server
    console.log('Updated slides data', updatedSlides);

    updateSlidesInStore(updatedSlides).then(success => {
      if (success) {
        setSlides(updatedSlides); // Update local state if the server update was successful
        console.log('Update successful');
      } else {
        console.error('Failed to update slides on server');
      }
    });
  };

  const handleRearrangeSlides = (newSlides) => {
    setSlides(newSlides);
    updateSlidesInStore(newSlides); // Assume this function handles updating the backend
    setShowRearrange(false); // Close rearrange screen after updating
  };

  // Get the slide screen sizes and details for use in rendering slide elements later
  useEffect(() => {
    const updateSlideSize = () => {
      const slide = slideRef.current;
      if (slide) {
        const { width, height } = slide.getBoundingClientRect();
        setSlideSize({ width, height });
      }
    };

    updateSlideSize();
    window.addEventListener('resize', updateSlideSize);
    return () => window.removeEventListener('resize', updateSlideSize);
  }, [loading]);

  return (
    <Container maxWidth='lg'>
      <Typography variant='h4'>Slides</Typography>
      <Button onClick={() => setShowRearrange(true)} style={{ margin: '10px' }}>
        Rearrange Slides
      </Button>
      <Dialog
        open={showRearrange}
        onClose={() => setShowRearrange(false)}
        fullWidth
        maxWidth='lg'
      >
        <DialogTitle>Rearrange Slides</DialogTitle>
        <DialogContent>
          <SlideRearrangeScreen slides={slides} onRearrange={handleRearrangeSlides} onClose={() => setShowRearrange(false)} />
        </DialogContent>
      </Dialog>
      <SlideEditor presentation={currentPresentation} setPresentation={setCurrentPresentation} currentSlideIndex={currentSlideIndex} updateSlidesInStore={updateSlidesInStore} setSlides={setSlides} setLoading={setLoading} />
      {loading
        ? (
          <Box position='relative' display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight={150} height='40vw' minWidth={266} my={4} sx={{ border: '1px solid grey' }}>
            <CircularProgress />
          </Box>
          )
        : (
            transitions((style, item) => (
              item === slides[currentSlideIndex] && (
                <animated.div style={style}>
                  <Box ref={slideRef} style={{ background: (slides[currentSlideIndex].backgroundColor ? slides[currentSlideIndex].backgroundColor : currentPresentation.defaultColor) }} position='relative' display='flex' flexDirection='column' alignItems='center' justifyContent='center' minHeight={150} height='40vw' minWidth={266} my={4} sx={{ border: '2px solid grey' }}>
                    {slides[currentSlideIndex].elements.map((element, index) => (
                      <PresentationSlideElement key={index} slideSize={slideSize} element={element} handleDoubleClick={handleDoubleClick} handleRightClick={handleRightClick} handleSaveChanges={handleSaveChanges} isPreview={false}></PresentationSlideElement>
                    ))}
                    <Menu
                      open={Boolean(anchorEl)}
                      anchorEl={anchorEl}
                      onClose={handleCloseMenu}
                    >
                      <MenuItem onClick={handleDeleteElement}>Delete</MenuItem>
                    </Menu>
                    <SlideElementEditModal editingElement={editingElement} setEditingElement={setEditingElement} editModalOpen={editModalOpen} setEditModalOpen={setEditModalOpen} handleSaveChanges={handleSaveChanges} />
                    <Box position='absolute' bottom={0} right={0} width={30} height={30} display='flex' alignItems='center' justifyContent='center'>
                      <Typography style={{ fontSize: '1em' }}>{currentSlideIndex + 1}</Typography>
                    </Box>
                  </Box>
                </animated.div>
              )
            ))
          )
      }
      <Grid container spacing={2}>
        <Grid item sm={2}>
          <Button onClick={handleAddSlide} variant='contained' color='primary'>
            Add New Slide
          </Button>
        </Grid>
        <Grid item sm={2}>
          {slides.length > 0 && (
            <Button onClick={handleDeleteSlide} variant='contained' color='secondary'>
              Delete Slide
            </Button>
          )}
        </Grid>
        <Grid item sm={8} align='right'>
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
        </Grid>
      </Grid>
    </Container>
  );
};

export default PresentationSlidesPage;
