import React, { useCallback, useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import ContentSection from '../../components/ContentSection';
import ErrorBoundary from '../../components/ErrorBoundary';
import Header from '../../components/Header';
import WindowSection from '../../components/WindowSection';
import { useRovingFocus } from '../../hooks/useRovingFocus';
import { useWindows } from '../../hooks/useWindows';
import { moveTab } from '../../utils/helpers';
import styles from './App.module.scss';
import ErrorFallback from '../../components/ErrorFallback';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDisabledToggle, setSearchDisabledToggle] = useState(false);
  const { windows, error } = useWindows();

  if (error) return <ErrorFallback />;

  // Setup arrow key navigation
  useRovingFocus();

  const onDragStart = useCallback(() => {
    // Disable search input to prevent list rendering bugs
    setSearchDisabledToggle(state => !state);
  }, []);

  const onDragEnd = useCallback((result: DropResult) => {
    // Re-enable search
    setSearchDisabledToggle(state => !state);
    moveTab(result);
  }, []);

  const [currentWindow, otherWindows] = windows;

  return (
    <div className={styles.app}>
      <ErrorBoundary>
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchDisabledToggle={searchDisabledToggle} />
        <ContentSection>
          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <WindowSection title={'Current window'} searchTerm={searchTerm} windows={currentWindow} />
            {otherWindows.length > 0 && (
              <WindowSection title={'Other windows'} searchTerm={searchTerm} windows={otherWindows} />
            )}
          </DragDropContext>
        </ContentSection>
      </ErrorBoundary>
    </div>
  );
};

export default App;
