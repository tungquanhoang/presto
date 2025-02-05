import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SlideRearrangeScreen = ({ slides, onRearrange, onClose }) => {
  // State to manage the local copy of slides, allowing reordering without immediately affecting the parent component's state.
  const [internalSlides, setInternalSlides] = React.useState(slides);

  // Effect to update internal state when the slides prop changes. This ensures the component stays in sync with external changes.
  React.useEffect(() => {
    setInternalSlides(slides);
  }, [slides]);

  // Handler for when a drag operation finishes
  const handleDragEnd = (result) => {
    console.log('Drag result:', result);
    if (!result.destination) {
      console.log('No destination found; dropped outside the list.');
      return;
    }

    if (result.destination.index === result.source.index) {
      console.log('Item dropped in the same place.');
      return;
    }

    const newSlides = Array.from(internalSlides);
    const [reorderedItem] = newSlides.splice(result.source.index, 1);
    newSlides.splice(result.destination.index, 0, reorderedItem);

    setInternalSlides(newSlides);
    onRearrange(newSlides);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId='slides' direction='horizontal'>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              display: 'flex',
              flexDirection: 'row',
              padding: '20px',
              overflow: 'auto',
              minWidth: '100%',
              gap: '10px',
              border: '1px solid lightgrey',
            }}
          >
            {internalSlides.map((slide, index) => (
              <Draggable key={slide.id} draggableId={slide.id.toString()} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      userSelect: 'none',
                      padding: '10px',
                      background: 'white',
                      border: '1px solid lightgrey',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100px',
                      height: '50px',
                    }}
                  >
                    Slide {index + 1}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <button onClick={onClose} style={{ marginTop: '20px', padding: '10px 20px' }}>Close</button>
    </DragDropContext>
  );
};

export default SlideRearrangeScreen;
