import chromep from 'chrome-promise';
import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import WindowSection from '../../components/WindowSection';
import { useRovingFocus } from '../../hooks/useRovingFocus';
import { groupBy } from '../../utils/helpers';
import styles from './App.module.scss';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDisabledToggle, setSearchDisabledToggle] = useState(false);
  const [allWindows, setAllWindows] = useState<ChromeWindow[]>([]);

  // Group according to current active window
  const [currentWindow, otherWindows] = groupBy(allWindows, val => val.isActiveWindow);

  // Setup arrow key navigation
  useRovingFocus();

  // Get tabs for all windows
  useEffect(() => {
    getWindows();
  }, []);

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

      if (source.droppableId === destination.droppableId) {
        // Optimistic reorder tabs
        const window = allWindows.find(window => window.id === Number(source.droppableId));

        if (!window) {
          return;
        }
        const newTabList = Array.from(window.tabs!);
        const movedTab = newTabList.splice(source.index, 1)[0];
        newTabList.splice(destination.index, 0, movedTab);
        setAllWindows(prevWindows =>
          prevWindows.map(window => {
            return window.id === Number(source.droppableId)
              ? ({ ...window, tabs: newTabList } as ChromeWindow)
              : window;
          })
        );
      } else {
        // Optimistic move tab between windows
        const sourceWindow = allWindows.find(window => window.id === Number(source.droppableId));
        const destinationWindow = allWindows.find(window => window.id === Number(destination.droppableId));

        if (!sourceWindow || !destinationWindow) {
          return;
        }

        const newSourceTabList = Array.from(sourceWindow.tabs!);
        const newDestinationTabList = Array.from(destinationWindow.tabs!);

        const movedTab = newSourceTabList.splice(source.index, 1)[0];
        newDestinationTabList.splice(destination.index, 0, movedTab);

        setAllWindows(prevWindows =>
          prevWindows.map(window => {
            return window.id === Number(source.droppableId)
              ? ({ ...window, tabs: newSourceTabList } as ChromeWindow)
              : Number(destination.droppableId)
              ? ({ ...window, tabs: newDestinationTabList } as ChromeWindow)
              : window;
          })
        );
      }

      chrome.tabs.move(Number(draggableId), {
        windowId: Number(destination.droppableId),
        index: destination.index,
      });
    },
    [allWindows]
  );

  return (
    <div className={styles.app}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchDisabledToggle={searchDisabledToggle} />
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <ContentSection>
          <WindowSection title={'Current window'} searchTerm={searchTerm} windows={currentWindow} />
          {otherWindows.length > 0 && (
            <>
              <WindowSection title={'Other windows'} searchTerm={searchTerm} windows={otherWindows} />
            </>
          )}
        </ContentSection>
      </DragDropContext>
    </div>
  );
};

export default App;
