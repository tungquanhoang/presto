import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Typography, Box, Container, IconButton, Menu, MenuItem, Dialog, TextField } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { useParams } from 'react-router-dom';
import SlideEditor from './SlideEditor';
import BACKEND_PORT from '../config.json';

const PresentationSlidesPage = () => {
  const { id } = useParams();
  const presentationId = id;
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null); // For context menu
  const [editModalOpen, setEditModalOpen] = useState(false); // For edit modal
  const [editingElement, setEditingElement] = useState(null);

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

  const addElementToSlide = (element) => {
    const updatedSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return { ...slide, elements: [...slide.elements, element] }; // assuming each slide has an 'elements' array
      }
      return slide;
    });

    updateSlidesInStore(updatedSlides).then(success => {
      if (success) {
        setSlides(updatedSlides);
      } else {
        alert('Failed to update slide with new element');
      }
    });
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

  const handleChange = (name, value) => {
    setEditingElement(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    const updatedElements = slides[currentSlideIndex].elements.map(el =>
      el.id === editingElement.id ? { ...el, ...editingElement } : el
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
      setEditModalOpen(false); // Close the modal in any case
    });
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4">Slides</Typography>
      <SlideEditor addElementToSlide={addElementToSlide} />
      <Box position="relative" display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={500} maxHeight="md" my={4} sx={{ border: '1px solid grey' }}>
        {slides.length
          ? (
            <>
                {slides[currentSlideIndex].elements.map((element, index) => (
                <Box key={index} sx={{
                  position: 'absolute',
                  left: `${element.positionX}%`,
                  top: `${element.positionY}%`,
                  width: `${element.sizeWidth}%`,
                  height: `${element.sizeHeight}%`,
                  border: '1px solid grey',
                  overflow: 'hidden',
                  zIndex: index, // Ensures that elements later in the array are rendered on top
                }}
                onDoubleClick={() => handleDoubleClick(element)}
                onContextMenu={(event) => handleRightClick(event, element)}
                >
                    {element.type === 'text' && (
                    <Typography style={{
                      fontSize: `${element.fontSize}em`,
                      color: element.color,
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden', // Prevents text from overflowing the container
                    }}>
                        {element.content}
                    </Typography>
                    )}
                    {element.type === 'image' && (
                    <img src={element.imageUrl} alt={element.imageAlt} style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover' // Adjusts the image size to cover the element area, you can change it to 'contain' if you need to see the whole image
                    }} />
                    )}
                    {element.type === 'video' && (
                      <iframe src={`${element.videoUrl}&autoplay=${element.autoplay ? '1' : '0'}&mute=1`} allow='autoplay' width='100%' height='100%' allowFullScreen />
                    )}
                    {element.type === 'code' && (
                    <pre style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'auto', // Allows scrolling inside the pre element if the content overflows
                      backgroundColor: '#f4f4f4', // Gives a light background color for better readability
                      padding: '10px', // Adds some padding inside the pre element
                      margin: 0, // Removes default margin to fit better within the box
                      whiteSpace: 'pre-wrap'
                    }}>
                        {element.content}
                    </pre>
                    )}
                </Box>
                ))}
                <Menu
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleCloseMenu}
                >
                <MenuItem onClick={handleDeleteElement}>Delete</MenuItem>
                </Menu>
                <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                <Box p={2}>
                <TextField
                    fullWidth
                    label="Content"
                    value={editingElement?.content || ''}
                    onChange={(e) => handleChange('content', e.target.value)}
                />
                <TextField
                    fullWidth
                    label="X Position (%)"
                    type="number"
                    value={editingElement?.positionX || ''}
                    onChange={(e) => handleChange('positionX', e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Y Position (%)"
                    type="number"
                    value={editingElement?.positionY || ''}
                    onChange={(e) => handleChange('positionY', e.target.value)}
                />
                <Button onClick={handleSaveChanges} color="primary">
                    Save Changes
                </Button>
                </Box>
            </Dialog>
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
