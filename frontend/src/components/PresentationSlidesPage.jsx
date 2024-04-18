import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Typography, Box, Container, IconButton, Menu, MenuItem, Dialog, TextField, Grid, CircularProgress, Select } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { useNavigate, useParams } from 'react-router-dom';
import SlideEditor from './SlideEditor';
import BACKEND_PORT from '../config.json';
import PresentationSlideElement from './PresentationSlideElement';

const availableFonts = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' }
];

const PresentationSlidesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPresentation, setCurrentPresentation] = useState(null);
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null); // For context menu
  const [editModalOpen, setEditModalOpen] = useState(false); // For edit modal
  const [editingElement, setEditingElement] = useState(null);
  const [loading, setLoading] = useState(true); // Indicate that the page is fetching the slide

  const slideRef = useRef(null);
  const [slideSize, setSlideSize] = useState({ width: 0, height: 0 });

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
    <Container maxWidth="lg">
      <Typography variant="h4">Slides</Typography>
      <SlideEditor presentation={currentPresentation} setPresentation={setCurrentPresentation} currentSlideIndex={currentSlideIndex} updateSlidesInStore={updateSlidesInStore} setSlides={setSlides} setLoading={setLoading} />
        {loading
          ? (
              <Box position="relative" display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={150} height='40vw' minWidth={266} my={4} sx={{ border: '1px solid grey' }}>
                <CircularProgress />
              </Box>
            )
          : (
              <Box ref={slideRef} style={{ background: (slides[currentSlideIndex].backgroundColor ? slides[currentSlideIndex].backgroundColor : currentPresentation.defaultColor) }} position="relative" display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={150} height='40vw' minWidth={266} my={4} sx={{ border: '2px solid grey' }}>
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
                <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                  <Box p={2}>
                  {editingElement?.type === 'text' && (
                    <>
                        <TextField
                        fullWidth
                        label="Text Content"
                        value={editingElement?.content || ''}
                        onChange={(e) => handleChange('content', e.target.value)}
                        />
                        <TextField
                        fullWidth
                        label="Font Size (em)"
                        type="number"
                        value={editingElement?.fontSize || 1.0}
                        onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
                        />
                        <TextField
                        fullWidth
                        label="Color"
                        type="color"
                        value={editingElement?.color || '#000000'}
                        onChange={(e) => handleChange('color', e.target.value)}
                        />
                        <Select
                            fullWidth
                            label="Font Family"
                            value={editingElement?.fontFamily || availableFonts[0].value}
                            onChange={(e) => handleChange('fontFamily', e.target.value)}
                        >
                            {availableFonts.map(font => (
                            <MenuItem key={font.value} value={font.value}>{font.label}</MenuItem>
                            ))}
                        </Select>
                    </>
                  )}
                  {editingElement?.type === 'image' && (
                    <>
                        <TextField
                        fullWidth
                        label="Image URL"
                        value={editingElement?.imageUrl || ''}
                        onChange={(e) => handleChange('imageUrl', e.target.value)}
                        />
                        <TextField
                        fullWidth
                        label="Alt Text"
                        value={editingElement?.imageAlt || ''}
                        onChange={(e) => handleChange('imageAlt', e.target.value)}
                        />
                    </>
                  )}
                  {editingElement?.type === 'video' && (
                    <>
                        <TextField
                        fullWidth
                        label="Video URL"
                        value={editingElement?.videoUrl || ''}
                        onChange={(e) => handleChange('videoUrl', e.target.value)}
                        />
                        <TextField
                        fullWidth
                        select
                        label="Autoplay"
                        value={editingElement?.autoplay ? 'true' : 'false'}
                        onChange={(e) => handleChange('autoplay', e.target.value === 'true')}
                        SelectProps={{ native: true }}
                        >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                        </TextField>
                    </>
                  )}
                  {editingElement?.type === 'code' && (
                    <>
                        <TextField
                        fullWidth
                        select
                        label="Programming Language"
                        value={editingElement?.programmingLanguage || 'JavaScript'}
                        onChange={(e) => handleChange('programmingLanguage', e.target.value)}
                        SelectProps={{ native: true }}
                        >
                        <option value="JavaScript">JavaScript</option>
                        <option value="Python">Python</option>
                        <option value="C">C</option>
                        </TextField>
                        <TextField
                        fullWidth
                        multiline
                        label="Code"
                        value={editingElement?.content || ''}
                        onChange={(e) => handleChange('content', e.target.value)}
                        variant="outlined"
                        rows={10} // Adjust the number of rows as needed
                        placeholder="Enter your code here"
                        />
                        <TextField
                        fullWidth
                        type="number"
                        label="Font Size (em)"
                        value={editingElement?.fontSize || 1.0}
                        onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
                        />
                        <Select
                            fullWidth
                            label="Font Family"
                            value={editingElement?.fontFamily || availableFonts[0].value}
                            onChange={(e) => handleChange('fontFamily', e.target.value)}
                        >
                            {availableFonts.map(font => (
                            <MenuItem key={font.value} value={font.value}>{font.label}</MenuItem>
                            ))}
                        </Select>
                    </>
                  )}

                    <Button onClick={() => {
                      handleSaveChanges(editingElement);
                      setEditModalOpen(false);
                    }} color="primary">
                      Save Changes
                    </Button>
                  </Box>
                </Dialog>
                <Box position="absolute" bottom={0} right={0} width={30} height={30} display="flex" alignItems="center" justifyContent="center">
                  <Typography style={{ fontSize: '1em' }}>{currentSlideIndex + 1}</Typography>
                </Box>
              </Box>
            )
        }
      <Grid container spacing={2}>
        <Grid item sm={2}>
          <Button onClick={handleAddSlide} variant="contained" color="primary">
            Add New Slide
          </Button>
        </Grid>
        <Grid item sm={2}>
          {slides.length > 0 && (
            <Button onClick={handleDeleteSlide} variant="contained" color="secondary">
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
