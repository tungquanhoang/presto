import { Box, Typography } from '@material-ui/core'
import React from 'react'

const PresentationSlideElement = ({ element, index, handleDoubleClick, handleRightClick }) => {
  return (
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
  )
}

export default PresentationSlideElement;
