import chromep from 'chrome-promise';
import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import TabList from '../../components/TabList';
import { useRovingFocus } from '../../hooks/useRovingFocus';
import styles from './App.module.scss';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDisabledToggle, setSearchDisabledToggle] = useState(false);
  const [allWindows, setAllWindows] = useState<ChromeWindow[]>([]);

  let currentWindow = {} as ChromeWindow;
  let otherWindows: ChromeWindow[] = [];

  // Setup arrow key navigation
  useRovingFocus();

  useEffect(() => {
    getWindows();
  }, []);

  // Get tabs for all windows
  const getWindows = async () => {
    const currentWindow = await chromep.windows.getCurrent();
    const windows = (await chromep.windows.getAll({ populate: true })).map(window => {
      return {
        ...window,
        isActiveWindow: window.id === currentWindow.id,
      } as ChromeWindow;
    });
    setAllWindows(windows);
  };

  if (allWindows.length) {
    currentWindow = allWindows.find(window => window.isActiveWindow)!;
    otherWindows = allWindows.filter(window => window.id !== currentWindow.id);
  }

  // On tab moved listener
  useEffect(() => {
    const onMovedListener = async (tabId: number, moveInfo: chrome.tabs.TabMoveInfo): Promise<void> => {
      await getWindows();
    };

    chrome.tabs.onMoved.addListener(onMovedListener);
    return () => {
      chrome.tabs.onMoved.removeListener(onMovedListener);
    };
  }, []);

  // On tab attached listener
  useEffect(() => {
    const onAttachedListener = async (tabId: number, attachInfo: chrome.tabs.TabAttachInfo): Promise<void> => {
      await getWindows();
    };

    chrome.tabs.onAttached.addListener(onAttachedListener);
    return () => {
      chrome.tabs.onAttached.removeListener(onAttachedListener);
    };
  }, []);

  // On tab removed listener
  useEffect(() => {
    const onRemovedListener = async (_tabId: number, removeInfo: chrome.tabs.TabRemoveInfo): Promise<void> => {
      const refreshedWindow = await chromep.windows.get(removeInfo.windowId, { populate: true });

      if (!refreshedWindow || !refreshedWindow.tabs?.length) {
        setAllWindows(prevWindows => prevWindows.filter(window => window.id !== removeInfo.windowId));
        return;
      }

      await getWindows();
    };

    chrome.tabs.onRemoved.addListener(onRemovedListener);
    return () => {
      chrome.tabs.onRemoved.removeListener(onRemovedListener);
    };
  }, []);

  const onDragStart = useCallback(() => {
    // Disable search input to prevent list rendering bugs
    setSearchDisabledToggle(state => !state);
  }, [searchDisabledToggle]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      // Re-enable search
      setSearchDisabledToggle(state => !state);

      const { destination, source, draggableId } = result;

      if (!destination) {
        return;
      }

      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }

      chrome.tabs.move(+draggableId, {
        windowId: +destination.droppableId,
        index: destination.index,
      });

      // TODO: Perform optimistic adjustment before list is refreshed to prevent UI flicker vvvv

      // const newTabList = Array.from(currentWindow.tabs!);
      // const movedTab = newTabList.splice(source.index, 1)[0];
      // newTabList.splice(destination.index, 0, movedTab);
      // setCurrentWindow(currentWindow => ({
      //   ...currentWindow,
      //   tabs: newTabList,
      // }));
    },
    [allWindows]
  );

  // TODO: Create popup from bottom in conjunction with error boundary to display any errors that occur

  return (
    <div className={styles.app}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchDisabledToggle={searchDisabledToggle} />
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <ContentSection>
          <h3>Current window</h3>
          <Droppable droppableId={`${currentWindow.id}`}>
            {(provided: DroppableProvided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <TabList searchTerm={searchTerm} window={currentWindow} />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {otherWindows.length > 0 && (
            <>
              <h3>Other windows</h3>
              {otherWindows.map(window => (
                <Droppable droppableId={`${window.id}`}>
                  {(provided: DroppableProvided) => (
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
