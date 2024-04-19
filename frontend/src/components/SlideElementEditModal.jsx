import { Box, Button, Dialog, MenuItem, Select, TextField } from '@material-ui/core';
import React from 'react';

// The available fonts that user can choose
const availableFonts = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' }
];

/* The edit modal when user double clicks an element to edit */
const SlideElementEditModal = ({ editingElement, setEditingElement, editModalOpen, setEditModalOpen, handleSaveChanges }) => {
  // Change the editing element details
  const handleChange = (name, value) => {
    setEditingElement(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
      <Box p={2}>
        {/* Edit form if the element is text */}
        {editingElement?.type === 'text' && (
          <>
            <TextField
              fullWidth
              label='Text Content'
              value={editingElement?.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
            />
            <TextField
              fullWidth
              label='Font Size (em)'
              type='number'
              value={editingElement?.fontSize || 1.0}
              onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
            />
            <TextField
              fullWidth
              label='Color'
              type='color'
              value={editingElement?.color || '#000000'}
              onChange={(e) => handleChange('color', e.target.value)}
            />
            <Select
              fullWidth
              label='Font Family'
              value={editingElement?.fontFamily || availableFonts[0].value}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
            >
              {availableFonts.map(font => (
                <MenuItem key={font.value} value={font.value}>{font.label}</MenuItem>
              ))}
            </Select>
          </>
        )}
        {/* Edit form if the element is image */}
        {editingElement?.type === 'image' && (
          <>
            <TextField
              fullWidth
              label='Image URL'
              value={editingElement?.imageUrl || ''}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
            />
            <TextField
              fullWidth
              label='Alt Text'
              value={editingElement?.imageAlt || ''}
              onChange={(e) => handleChange('imageAlt', e.target.value)}
            />
          </>
        )}
        {/* Edit form if the element is video */}
        {editingElement?.type === 'video' && (
          <>
            <TextField
              fullWidth
              label='Video URL'
              value={editingElement?.videoUrl || ''}
              onChange={(e) => handleChange('videoUrl', e.target.value)}
            />
            <TextField
              fullWidth
              select
              label='Autoplay'
              value={editingElement?.autoplay ? 'true' : 'false'}
              onChange={(e) => handleChange('autoplay', e.target.value === 'true')}
              SelectProps={{ native: true }}
            >
              <option value='false'>No</option>
              <option value='true'>Yes</option>
            </TextField>
          </>
        )}
        {/* Edit form if the element is code */}
        {editingElement?.type === 'code' && (
          <>
            <TextField
              fullWidth
              select
              label='Programming Language'
              value={editingElement?.programmingLanguage || 'JavaScript'}
              onChange={(e) => handleChange('programmingLanguage', e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value='JavaScript'>JavaScript</option>
              <option value='Python'>Python</option>
              <option value='C'>C</option>
            </TextField>
            <TextField
              fullWidth
              multiline
              label='Code'
              value={editingElement?.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              variant='outlined'
              rows={10} // Adjust the number of rows as needed
              placeholder='Enter your code here'
            />
            <TextField
              fullWidth
              type='number'
              label='Font Size (em)'
              value={editingElement?.fontSize || 1.0}
              onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
            />
            <Select
              fullWidth
              label='Font Family'
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
        }} color='primary'>
          Save Changes
        </Button>
      </Box>
    </Dialog>
  )
}

export default SlideElementEditModal;
