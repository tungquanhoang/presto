import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box } from '@material-ui/core';

const PresentationCard = ({ presentation }) => {
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
      {presentation.thumbnail
        ? (
          <CardMedia
            component="img"
            sx={{ height: 150 }}
            image={presentation.thumbnail}
            alt="Presentation Thumbnail"
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
            <Typography variant="subtitle1" color="text.secondary">
            </Typography>
          </Box>
          )
      }
      <CardContent sx={{ p: 2 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {presentation.name}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          {presentation.description || ''}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Slides: {presentation.slides.length}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PresentationCard;
