import React, { useState } from 'react';
import BACKEND_PORT from '../config.json';
import { Button, Modal, Typography, FormControl, RadioGroup, FormControlLabel, Radio, Box, Grid } from '@material-ui/core';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';

/* A modal/form to pick the theme/background color for the slide deck */
const ThemeBackgroundPicker = ({ presentation, setPresentation, currentSlideIndex, updateSlidesInStore, setSlides, setLoading, modalStyle }) => {
  const [open, setOpen] = useState(false);
  const [backgroundType, setBackgroundType] = useState('solid');
  const [gradientDirection, setGradientDirection] = useState('to right');
  const [currentOrDefault, setCurrentOrDefault] = useState('current');
  const [backgroundValue, setBackgroundValue] = useState('#FFFFFF');
  const [gradientValue, setGradientValue] = useState({ start: '#FFFFFF', end: '#000000' });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Save the background color
  const handleSave = () => {
    setLoading(true);
    let newBackgroundValue;
    if (backgroundType === 'solid') {
      newBackgroundValue = backgroundValue;
    } else {
      newBackgroundValue = `linear-gradient(${gradientDirection}, ${gradientValue.start}, ${gradientValue.end})`;
    }

    let slidesToUpdate = presentation.slides;
    if (currentOrDefault === 'current') {
      presentation.slides[currentSlideIndex].backgroundColor = newBackgroundValue;
      slidesToUpdate = presentation.slides;
    } else {
      presentation.defaultColor = newBackgroundValue;
    }

    setBackgroundValue(newBackgroundValue);

    handleUpdatePresentationBackground();

    updateSlidesInStore(slidesToUpdate).then(success => {
      if (success) {
        setSlides(slidesToUpdate);
        setLoading(false);
      }
    });

    handleClose();
  };

  // Post a request to change the background color in the database
  const handleUpdatePresentationBackground = async () => {
    const updatedPresentation = presentation;
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:${BACKEND_PORT.BACKEND_PORT}/store`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ store: { presentations: [updatedPresentation] } })
    });

    if (response.ok) {
      setPresentation(updatedPresentation);
    } else {
      alert('Failed to update presentation details.');
    }
  };

  return (
    <Box maxWidth='md'>
      <Button startIcon={<FormatColorFillIcon />} onClick={handleOpen} color='primary'>Theme & Background</Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant='h6'>Choose Background</Typography>
          <FormControl component='fieldset'>
            <RadioGroup value={currentOrDefault} onChange={(e) => setCurrentOrDefault(e.target.value)}>
              <FormControlLabel value='current' control={<Radio />} label='Current Slide' />
              <FormControlLabel value='default' control={<Radio />} label='Default' />
            </RadioGroup>
          </FormControl>
          <FormControl component='fieldset'>
            <RadioGroup value={backgroundType} onChange={(e) => setBackgroundType(e.target.value)}>
              <FormControlLabel value='solid' control={<Radio />} label='Solid Color' />
              <FormControlLabel value='gradient' control={<Radio />} label='Gradient' />
            </RadioGroup>
          </FormControl>
          {backgroundType === 'solid' && (
            <Box maxWidth='sm' sx={{ marginBottom: 10 }}>
              <Typography variant='subtitle1'>Solid Color</Typography>
              <input type='color' value={backgroundValue} onChange={(e) => setBackgroundValue(e.target.value)} />
            </Box>
          )}
          {backgroundType === 'gradient' && (
            <Box maxWidth='sm' sx={{ marginBottom: 10 }}>
              <Typography variant='subtitle1'>Gradient Colors</Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Typography variant='subtitle2'>Start color</Typography>
                  <input type='color' value={gradientValue.start} onChange={(e) => setGradientValue({ ...gradientValue, start: e.target.value })} />
                </Grid>
                <Grid item>
                  <Typography variant='subtitle2'>End color</Typography>
                  <input type='color' value={gradientValue.end} onChange={(e) => setGradientValue({ ...gradientValue, end: e.target.value })} />
                </Grid>
              </Grid>
              <Typography variant='subtitle1'>Gradient Direction</Typography>
              <FormControl>
                <select value={gradientDirection} onChange={(e) => setGradientDirection(e.target.value)}>
                  <option value='to right'>Left to Right</option>
                  <option value='to left'>Right to Left</option>
                  <option value='to bottom'>Top to Bottom</option>
                  <option value='to top'>Bottom to Top</option>
                </select>
              </FormControl>
            </Box>
          )}
          <Button onClick={handleSave} variant='contained' color='primary'>Save</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default ThemeBackgroundPicker;
