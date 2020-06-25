import React from 'react';
import { Droppable, DroppableProvided } from 'react-beautiful-dnd';
import TabList from '../TabList';

type WindowSectionProps = {
  title: string;
  searchTerm: string;
  windows: ChromeWindow[];
};

const WindowSection: React.FC<WindowSectionProps> = ({ title, searchTerm, windows }) => {
  return (
    <div>
      <h3>{title}</h3>
      {windows.map(window => (
        <Droppable droppableId={`${window.id}`}>
          {(provided: DroppableProvided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <TabList searchTerm={searchTerm} window={window} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </div>
  );
};

export default WindowSection;
