import { Box, Typography } from '@material-ui/core'
import React, { useState } from 'react'

const PresentationSlideElement = ({ element, index, handleDoubleClick, handleRightClick, handleSaveChanges }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(element.positionX);
  const [startY, setStartY] = useState(element.positionY);

  /* Handle moving/dragging element */
  const handleMouseDown = (event) => {
    event.stopPropagation();
    setIsClicked(true);
    setIsDragging(true);
    setStartX(event.clientX);
    setStartY(event.clientY);
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const newX = element.positionX + (dx / window.innerWidth) * 125;
      const newY = element.positionY + (dy / window.innerHeight) * 125;
      // Ensure the new position does not exceed the slide boundaries
      const newPositionX = Math.max(0, Math.min(newX, 100 - element.sizeWidth));
      const newPositionY = Math.max(0, Math.min(newY, 100 - element.sizeHeight));
      element.positionX = newPositionX;
      element.positionY = newPositionY;
      setStartX(event.clientX);
      setStartY(event.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    handleSaveChanges(element);
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setIsClicked(false);
    }
  };

  return (
    <Box key={element.id} sx={{
      position: 'absolute',
      left: `${element.positionX}%`,
      top: `${element.positionY}%`,
      width: `${element.sizeWidth}%`,
      height: `${element.sizeHeight}%`,
      border: '1px solid grey',
      overflow: 'hidden',
      zIndex: `${element.layer}`, // Ensures that elements later in the array are rendered on top
    }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
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
      {isClicked &&
        [...Array(4)].map((_, cornerIndex) => (
          <Box
            key={cornerIndex}
            sx={{
              position: 'absolute',
              width: '5px',
              height: '5px',
              backgroundColor: 'black',
              cursor: 'pointer',
              zIndex: 9999,
              ...(cornerIndex === 0
                ? { top: '-2px', left: '-2px' }
                : cornerIndex === 1
                  ? { top: '-2px', right: '-2px' }
                  : cornerIndex === 2
                    ? { bottom: '-2px', left: '-2px' }
                    : { bottom: '-2px', right: '-2px' }),
            }}
          />
        ))}
    </Box>
  )
}

export default PresentationSlideElement;
