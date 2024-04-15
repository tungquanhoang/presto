import React, { useState } from 'react';
import { Container, Button, Modal, Box, TextField, Typography, Grid, MenuItem } from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import CodeIcon from '@mui/icons-material/Code';
import { v4 as uuidv4 } from 'uuid';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const SlideEditor = ({ addElementToSlide }) => {
  const [open, setOpen] = useState(false);
  const [elementType, setElementType] = useState('');
  const [programmingLanguage, setProgrammingLanguage] = useState('javascript'); // Additional state for programming language
  const [elementProps, setElementProps] = useState({
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
  });

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
      fontSize: '1.0',
      color: '#000000',
      imageUrl: '',
      imageAlt: '',
      videoUrl: '',
      autoplay: false,
      positionX: '0',
      positionY: '0',
      programmingLanguage: '',
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setElementProps(prev => ({ ...prev, [name]: value }));
  };

  const addElement = () => {
    if (!validateElement(elementProps)) {
      alert('Please check your input values.');
      return;
    }
    const newElement = { ...elementProps, id: uuidv4(), type: elementType };
    addElementToSlide(newElement);
    handleClose();
  };

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
    <Container maxWidth="xl">
      <Button startIcon={<TextFieldsIcon />} onClick={() => handleOpen('text')}>Add Text</Button>
      <Button startIcon={<ImageIcon />} onClick={() => handleOpen('image')}>Add Image</Button>
      <Button startIcon={<OndemandVideoIcon />} onClick={() => handleOpen('video')}>Add Video</Button>
      <Button startIcon={<CodeIcon />} onClick={() => handleOpen('code')}>Add Code</Button>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">{`Add ${elementType}`}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Width (%)" name="sizeWidth" value={elementProps.sizeWidth} onChange={handleChange} />
              <TextField fullWidth label="Height (%)" name="sizeHeight" value={elementProps.sizeHeight} onChange={handleChange} />
              {elementType === 'text' && (
                <>
                  <TextField fullWidth multiline maxRows={4} label="Text" name="content" value={elementProps.content} onChange={handleChange} />
                  <TextField fullWidth type="number" label="Font Size (em)" name="fontSize" value={elementProps.fontSize} onChange={handleChange} />
                  <TextField fullWidth type="color" label="Color" name="color" value={elementProps.color} onChange={handleChange} />
                </>
              )}
              {elementType === 'image' && (
                <>
                  <TextField fullWidth label="Image URL" name="imageUrl" value={elementProps.imageUrl} onChange={handleChange} />
                  <TextField fullWidth label="Alt Text" name="imageAlt" value={elementProps.imageAlt} onChange={handleChange} />
                </>
              )}
              {elementType === 'video' && (
                <>
                  <TextField fullWidth label="Video URL" name="videoUrl" value={elementProps.videoUrl} onChange={handleChange} />
                  <TextField fullWidth select SelectProps={{ native: true }} label="Autoplay" name="autoplay" value={elementProps.autoplay} onChange={handleChange}>
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </TextField>
                </>
              )}
              {elementType === 'code' && (
                <>
                  <TextField
                    select
                    label="Language"
                    value={programmingLanguage}
                    onChange={e => setProgrammingLanguage(e.target.value)}
                    fullWidth
                  >
                  <MenuItem value="javascript">JavaScript</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="c">C</MenuItem>
                  </TextField>
                  <TextField fullWidth multiline maxRows={10} label="Code" name="content" value={elementProps.content} onChange={handleChange} />
                  <TextField fullWidth type="number" label="Font Size (em)" name="fontSize" value={elementProps.fontSize} onChange={handleChange} />
                </>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button onClick={addElement} variant="contained">Add to Slide</Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Container>
  );
};

export default SlideEditor;
