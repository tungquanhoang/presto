import { Box, Typography } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { Rnd } from 'react-rnd';

const PresentationSlideElement = ({ element, slideSize, handleDoubleClick, handleRightClick, handleSaveChanges }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [state, setState] = useState({
    width: `${element.sizeWidth}%`,
    height: `${element.sizeHeight}%`,
    x: parseFloat(element.positionX) / 100 * slideSize.width,
    y: parseFloat(element.positionY) / 100 * slideSize.height
  });

  // Wait for states to finish updating before updating the element details
  useEffect(() => {
    const saveChangesTimeout = setTimeout(saveElementAttributes, 500);
    return () => clearTimeout(saveChangesTimeout);
  }, [state]);

  // Wait for states to update to have accurate position and size for rendering element
  useEffect(() => {
    // This useEffect hook will run every time state or slideSize changes
    const updatedX = parseFloat(element.positionX) / 100 * slideSize.width;
    const updatedY = parseFloat(element.positionY) / 100 * slideSize.height;
    setState(prevState => ({
      ...prevState,
      x: updatedX,
      y: updatedY
    }));
  }, [slideSize]);

  const handleMouseDown = (event) => {
    setIsClicked(true);
  };

  const handleMouseLeave = () => {
    setIsClicked(false);
  };

  // Save the element attributes back to database
  const saveElementAttributes = () => {
    element.sizeWidth = state.width.replace('%', '');
    element.sizeHeight = state.height.replace('%', '');
    element.positionX = (state.x / slideSize.width * 100).toString();
    element.positionY = (state.y / slideSize.height * 100).toString();
    handleSaveChanges(element);
  }

  return (
    <Rnd
      size={{ width: state.width, height: state.height }}
      position={{ x: state.x, y: state.y }}
      minWidth={'1%'}
      minHeight={'1%'}
      onDragStop={(e, d) => {
        setState({ x: d.x, y: d.y, width: state.width, height: state.height });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setState({
          width: ref.style.width,
          height: ref.style.height,
          ...position
        });
      }}
      bounds={'parent'}>
      <Box key={element.id} sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        border: '1px solid grey',
        overflow: 'hidden',
        zIndex: `${element.layer}`, // Ensures that elements later in the array are rendered on top
      }}
        onMouseDown={handleMouseDown}
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
          // The four boxes on four corners of the element
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
    </Rnd>
  )
}

export default PresentationSlideElement;
