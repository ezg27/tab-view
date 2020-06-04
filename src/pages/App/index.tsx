import React, { useCallback, useState } from 'react';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import TabList from '../../components/TabList';
import { useRovingFocus } from '../../hooks/useRovingFocus';
import { useWindows } from '../../hooks/useWindows';
import { moveTab } from '../../utils/helpers';
import styles from './App.module.scss';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDisabledToggle, setSearchDisabledToggle] = useState(false);
  const [currentWindow, otherWindows] = useWindows();

  // Setup arrow key navigation
  useRovingFocus();

  const onDragStart = useCallback(() => {
    setSearchDisabledToggle(state => !state);
  }, [searchDisabledToggle])


  const onDragEnd = useCallback((result: DropResult) => {
    setSearchDisabledToggle(state => !state);
    moveTab(result);
  }, []);

  return (
    <div className={styles.app}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchDisabledToggle={searchDisabledToggle} />
      <DragDropContext
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
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
