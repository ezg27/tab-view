import React, { useCallback, useState, useEffect } from 'react';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import TabList from '../../components/TabList';
import { useRovingFocus } from '../../hooks/useRovingFocus';
import { moveTab, refreshWindow } from '../../utils/helpers';
import styles from './App.module.scss';
import chromep from 'chrome-promise';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDisabledToggle, setSearchDisabledToggle] = useState(false);
  const [currentWindow, setCurrentWindow] = useState<ChromeWindow>({} as ChromeWindow);
  const [otherWindows, setOtherWindows] = useState<ChromeWindow[]>([]);

  // Get tabs for all windows
  useEffect(() => {
    const getWindows = async () => {
      const currentWindow = await chromep.windows.getCurrent({ populate: true });
      const withActiveFlag: ChromeWindow = {
        ...currentWindow,
        isActiveWindow: true,
      };
      setCurrentWindow(withActiveFlag);

      const otherWindows = (await chromep.windows.getAll({ populate: true }))
        .filter(windowItem => windowItem.id !== currentWindow.id)
        .map(
          window =>
            ({
              ...window,
              isActiveWindow: false,
            } as ChromeWindow)
        );
      setOtherWindows(otherWindows);
    };
    getWindows();
  }, []);

  // On tab moved listener
  useEffect(() => {
    const onMovedListener = async (tabId: number, moveInfo: chrome.tabs.TabMoveInfo): Promise<void> => {
      // Get window
      const refreshedWindow = await chromep.windows.get(moveInfo.windowId, { populate: true });

      // If active window
      setCurrentWindow(currentWindow =>
        currentWindow.id === refreshedWindow.id
          ? ({
              ...refreshedWindow,
              isActiveWindow: true,
            } as ChromeWindow)
          : currentWindow
      );
    };

    chrome.tabs.onMoved.addListener(onMovedListener);
    return () => {
      chrome.tabs.onMoved.removeListener(onMovedListener);
    };
  }, [currentWindow, otherWindows]);

  // On tab removed listener
  useEffect(() => {
    const onRemovedListener = async (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo): Promise<void> => {
      return await refreshWindow(tabId, removeInfo, setCurrentWindow, setOtherWindows);
    };

    chrome.tabs.onRemoved.addListener(onRemovedListener);
    return () => {
      chrome.tabs.onRemoved.removeListener(onRemovedListener);
    };
  }, [currentWindow, otherWindows]);

  // Setup arrow key navigation
  useRovingFocus();

  const onDragStart = useCallback(() => {
    setSearchDisabledToggle(state => !state);
  }, [searchDisabledToggle])


  const onDragEnd = useCallback((result: DropResult) => {
    setSearchDisabledToggle(state => !state);
    moveTab(result, currentWindow, setCurrentWindow);
  }, [currentWindow]);

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
