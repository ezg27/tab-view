import chromep from 'chrome-promise';
import React, { useCallback, useEffect, useState } from 'react';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import TabList from '../../components/TabList';
import styles from './App.module.scss';

interface ChromeWindow extends chrome.windows.Window {
  isActiveWindow: boolean;
}

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWindow, setCurrentWindow] = useState<ChromeWindow>({} as ChromeWindow);
  const [otherWindows, setOtherWindows] = useState<ChromeWindow[]>([]);

  // Get tabs for all windows
  useEffect(() => {
    const getWindows = async () => {
      const currentWindow = await chromep.windows.getCurrent({ populate: true });
      const activeWindow: ChromeWindow = { ...currentWindow, isActiveWindow: true };
      setCurrentWindow(activeWindow);

      const otherWindows = (await chromep.windows.getAll({ populate: true }))
        .filter(windowItem => windowItem.id !== currentWindow.id)
        .map(window => ({ ...window, isActiveWindow: false } as ChromeWindow));
      setOtherWindows(otherWindows);
    };
    getWindows();
  }, []);

  // On remove listener
  useEffect(() => {
    const refreshWindow = async (tabId, removeInfo) => {
      // Get window tab was removed from
      const refreshedWindow = await chromep.windows.get(removeInfo.windowId, { populate: true });

      // If active window
      if (refreshedWindow.id === currentWindow.id) {
        setCurrentWindow({ ...refreshedWindow, isActiveWindow: true } as ChromeWindow);
        return;
      }

      // If tab closed was last in the window
      if (!refreshedWindow.tabs.length) {
        setOtherWindows(windows => windows.filter(window => window.id !== refreshedWindow.id));
        return;
      }

      setOtherWindows(windows =>
        windows.map(window => {
          return window.id === refreshedWindow.id
            ? ({ ...refreshedWindow, isActiveWindow: false } as ChromeWindow)
            : window;
        })
      );
    };

    chrome.tabs.onRemoved.addListener(refreshWindow);
    return () => {
      chrome.tabs.onRemoved.removeListener(refreshWindow);
    };
  }, [currentWindow]);

  const setActiveTab = useCallback(async (tab: chrome.tabs.Tab, parentWindow: chrome.windows.Window): Promise<void> => {
    // Return if window is invalid
    if (!tab.id) return;

    // If tab is in another window, navigate and close extension
    const current = await chromep.windows.getCurrent();
    if (current.id !== parentWindow.id) {
      await chromep.windows.update(parentWindow.id, { focused: true });
      window.close();
    }

    // Return if current tab selected
    if (tab.active) return;

    // Navigate to tab in current window
    await chromep.tabs.update(tab.id, { active: true });
  }, []);

  const closeTab = useCallback(async (tab: chrome.tabs.Tab): Promise<void> => {
    // Return if window is invalid
    if (!tab.id) return;

    // Remove tab
    await chromep.tabs.remove(tab.id);
  }, []);

  return (
    <div className={styles.app}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ContentSection>
        <h3>Current window</h3>
        <TabList searchTerm={searchTerm} window={currentWindow} setActiveTab={setActiveTab} closeTab={closeTab} />
        {!!otherWindows.length && (
          <>
            <h3>Other windows</h3>
            {otherWindows.map(window => (
              <TabList
                key={window.id}
                searchTerm={searchTerm}
                window={window}
                setActiveTab={setActiveTab}
                closeTab={closeTab}
              />
            ))}
          </>
        )}
      </ContentSection>
    </div>
  );
};

export default App;
