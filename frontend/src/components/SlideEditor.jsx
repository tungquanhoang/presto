import React, { useState } from 'react';
import { Container, Button, Modal, TextField, Typography, MenuItem, Stack, Select, InputLabel, FormControl } from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import CodeIcon from '@mui/icons-material/Code';
import { v4 as uuidv4 } from 'uuid';
import { Box, Grid } from '@material-ui/core';
import ThemeBackgroundPicker from './ThemeBackgroundPicker';

// Styles for the modal pop-up
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const SlideEditor = ({ presentation, setPresentation, currentSlideIndex, updateSlidesInStore, setSlides, setLoading }) => {
  const [open, setOpen] = useState(false); // Controls if the modal is open
  const [elementType, setElementType] = useState(''); // Stores the type of element to be added
  const [programmingLanguage, setProgrammingLanguage] = useState('javascript'); // State for programming language for code elements
  const [elementProps, setElementProps] = useState({ // Stores properties of the new element to be created
    id: '',
    type: '',
    content: '',
    sizeWidth: '50',
    sizeHeight: '50',
    fontSize: '1.0',
    color: '#000000',
    imageUrl: '',
    imageAlt: '',
    videoUrl: '',
    autoplay: false,
    positionX: '0',
    positionY: '0',
    programmingLanguage: '',
    fontFamily: 'Arial',
  });

  // Predefined font families for selection
  const fontFamilies = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' }
  ];

  // Function to add the created element to the current slide
  const addElementToSlide = (element) => {
    const updatedSlides = presentation.slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return { ...slide, elements: [...slide.elements, element] }; // assuming each slide has an 'elements' array
      }
      return slide;
    });

    // Update the slides in the backend
    updateSlidesInStore(updatedSlides).then(success => {
      if (success) {
        setSlides(updatedSlides);
      } else {
        alert('Failed to update slide with new element');
      }
    });
  };

  // Function to open the modal and set up defaults based on element type
  const handleOpen = (type) => {
    setElementType(type);
    setOpen(true);
    // Reset element properties based on type if needed
    setElementProps({
      id: '',
      type: '',
      content: '',
      sizeWidth: '50',
      sizeHeight: '50',
      layer: '0',
      fontSize: '1.0',
      color: '#000000',
      imageUrl: '',
      imageAlt: '',
      videoUrl: '',
      autoplay: false,
      positionX: '0',
      positionY: '0',
      programmingLanguage: '',
      fontFamily: 'Arial',
    });
  };

  // Function to close the modal
  const handleClose = () => {
    setOpen(false);
  };

  // Function to handle changes in form fields
  const handleChange = (event) => {
    const { name, value } = event.target;
    setElementProps(prev => ({ ...prev, [name]: value }));
  };

  // Function to validate element input and add element to slide
  const addElement = () => {
    if (!validateElement(elementProps)) {
      alert('Please check your input values.');
      return;
    }
    const newElement = { ...elementProps, id: uuidv4(), type: elementType, layer: presentation.slides.length };
    addElementToSlide(newElement);
    handleClose();
  };

  // Function to validate properties of the element before adding
  const validateElement = (props) => {
    if (props.sizeWidth < 0 || props.sizeWidth > 100 || props.sizeHeight < 0 || props.sizeHeight > 100) {
      return false;
    }
    if (props.type === 'text' && props.fontSize <= 0) {
      return false;
    }
    if ((props.type === 'image' || props.type === 'video') && !props.imageUrl.startsWith('http')) {
      return false;
    }
    return true;
  };

  return (
    <Box maxWidth='xl' sx={{ p: 0 }}>
      <Grid container justifyContent='flex-start' alignContent='flex-start' spacing={2}>
        <Grid item xs={6} sm='auto'>
          <Button startIcon={<TextFieldsIcon />} onClick={() => handleOpen('text')}>Add Text</Button>
        </Grid>
        <Grid item xs={6} sm='auto'>
          <Button startIcon={<ImageIcon />} onClick={() => handleOpen('image')}>Add Image</Button>
        </Grid>
        <Grid item xs={6} sm='auto'>
          <Button startIcon={<OndemandVideoIcon />} onClick={() => handleOpen('video')}>Add Video</Button>
        </Grid>
        <Grid item xs={6} sm='auto'>
          <Button startIcon={<CodeIcon />} onClick={() => handleOpen('code')}>Add Code</Button>
        </Grid>
        <Grid item xs={6} sm='auto'>
          <ThemeBackgroundPicker presentation={presentation} setPresentation={setPresentation} currentSlideIndex={currentSlideIndex} updateSlidesInStore={updateSlidesInStore} setSlides={setSlides} setLoading={setLoading} modalStyle={modalStyle}>Theme and Background Picker</ThemeBackgroundPicker>
        </Grid>
      </Grid>

      <Modal open={open} onClose={handleClose}>
        <Container maxWidth='xs' sx={modalStyle}>
          <Stack spacing={3}>
            <Typography variant='h6' component='h2'>{`Add ${elementType}`}</Typography>
            <TextField fullWidth label='Width (%)' name='sizeWidth' value={elementProps.sizeWidth} onChange={handleChange} />
            <TextField fullWidth label='Height (%)' name='sizeHeight' value={elementProps.sizeHeight} onChange={handleChange} />
            {elementType === 'text' && (
              <>
                <FormControl fullWidth>
                <InputLabel>Font Family</InputLabel>
                <Select
                    name='fontFamily'
                    value={elementProps.fontFamily}
                    label='Font Family'
                    onChange={handleChange}
                >
                    {fontFamilies.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
                </FormControl>
                <TextField fullWidth multiline maxRows={4} label='Text' name='content' value={elementProps.content} onChange={handleChange} />
                <TextField fullWidth type='number' label='Font Size (em)' name='fontSize' value={elementProps.fontSize} onChange={handleChange} />
                <TextField fullWidth type='color' label='Color' name='color' value={elementProps.color} onChange={handleChange} />
              </>
            )}
            {elementType === 'image' && (
              <>
                <TextField fullWidth label='Image URL' name='imageUrl' value={elementProps.imageUrl} onChange={handleChange} />
                <TextField fullWidth label='Alt Text' name='imageAlt' value={elementProps.imageAlt} onChange={handleChange} />
              </>
            )}
            {elementType === 'video' && (
              <>
                <TextField fullWidth label='Video URL' name='videoUrl' value={elementProps.videoUrl} onChange={handleChange} />
                <TextField fullWidth select SelectProps={{ native: true }} label='Autoplay' name='autoplay' value={elementProps.autoplay} onChange={handleChange}>
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </TextField>
              </>
            )}
            {elementType === 'code' && (
              <>
                <FormControl fullWidth>
                <InputLabel>Font Family</InputLabel>
                <Select
                    name='fontFamily'
                    value={elementProps.fontFamily}
                    label='Font Family'
                    onChange={handleChange}
                >
                    {fontFamilies.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
                </FormControl>
                <TextField
                  select
                  label='Language'
                  value={programmingLanguage}
                  onChange={e => setProgrammingLanguage(e.target.value)}
                  fullWidth
                >
                <MenuItem value='javascript'>JavaScript</MenuItem>
                <MenuItem value='python'>Python</MenuItem>
                <MenuItem value='c'>C</MenuItem>
                </TextField>
                <TextField fullWidth multiline maxRows={10} label='Code' name='content' value={elementProps.content} onChange={handleChange} />
                <TextField fullWidth type='number' label='Font Size (em)' name='fontSize' value={elementProps.fontSize} onChange={handleChange} />
              </>
            )}
            <Button onClick={addElement} variant='contained'>Add to Slide</Button>
          </Stack>
        </Container>
      </Modal>
    </Box>
  );
};

export default SlideEditor;
