import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, CardActionArea } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

const PresentationCard = ({ presentation }) => {
  const navigate = useNavigate();

  // Function to handle card click
  const handleCardClick = () => {
    navigate(`/presentation/${presentation.id}/edit`); // Navigate to edit page with the presentation ID
  };
  return (
    <Card
      sx={{
        width: 300,
        m: 2,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 3,
      }}
    >
    <CardActionArea onClick={handleCardClick}>
      {presentation.thumbnail
        ? (
          <CardMedia
            component='img'
            sx={{ height: 150 }}
            image={presentation.thumbnail}
            alt='Presentation Thumbnail'
          />
          )
        : (
          <Box
            sx={{
              height: 150,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#ccc',
            }}
          >
            <Typography variant='subtitle1' color='secondary' />
          </Box>
          )
      }
      <CardContent sx={{ p: 2 }}>
        <Typography gutterBottom variant='h5' component='h2'>
          {presentation.name}
        </Typography>
        <Typography variant='body2' component='p'>
          {presentation.description || ''}
        </Typography>
        <Typography variant='body2'>
          Slides: {presentation.slides.length}
        </Typography>
      </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PresentationCard;
