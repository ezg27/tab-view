import React, { useState } from 'react';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import TabList from '../../components/TabList';
import { useRovingFocus } from '../../hooks/useRovingFocus';
import { useWindows } from '../../hooks/useWindows';
import styles from './App.module.scss';
import { moveTab } from '../../utils/helpers';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWindow, otherWindows] = useWindows();

  // Setup arrow key navigation
  useRovingFocus();

  return (
    <div className={styles.app}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <DragDropContext onDragEnd={moveTab}>
        <ContentSection>
          <h3>Current window</h3>
          <Droppable droppableId={'${currentWindow.id}'}>
            {(provided: DroppableProvided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <TabList searchTerm={searchTerm} window={currentWindow} />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {!!otherWindows.length && (
            <>
              <h3>Other windows</h3>
              {otherWindows.map(window => (
                <Droppable droppableId={`${window.id}`}>
                  {provided => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      <TabList key={window.id} searchTerm={searchTerm} window={window} />
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </>
          )}
        </ContentSection>
      </DragDropContext>
    </div>
  );
};

export default App;
