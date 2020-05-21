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
  const [otherWindows, setOtherWindows] = useState<chrome.windows.Window[]>([]);

  // Refresh window
  useEffect(() => {
    const refreshWindow = (tabId, removeInfo) => {
      chrome.windows.getCurrent({ populate: true }, window => {
        setCurrentWindow(window);
      });
    };
    chrome.tabs.onRemoved.addListener(refreshWindow);
    return () => {
      chrome.tabs.onRemoved.removeListener(refreshWindow);
    };
  }, []);

  // Get all tabs for all windows
  useEffect(() => {
    const getWindows = async () => {
      const currentWindow = await chromep.windows.getCurrent({ populate: true });
      const activeWindow: ChromeWindow = { ...currentWindow, isActiveWindow: true };
      setCurrentWindow(activeWindow);

      const otherWindows = (await chromep.windows.getAll({ populate: true }))
        .filter(windowItem => windowItem.id !== currentWindow.id)
        .map(window => ({ ...window, isActiveWindow: false }));
      setOtherWindows(otherWindows);
    };
    getWindows();
  }, []);

  const setActiveTab = useCallback(async (tab: chrome.tabs.Tab, parentWindow: chrome.windows.Window): Promise<void> => {
    if (!tab.id) return;
    const currentWindow = await chromep.windows.getCurrent();
    if (currentWindow.id !== parentWindow.id) {
      await chromep.windows.update(parentWindow.id, { focused: true }, () => window.close());
    }
    if (tab.active) return;
    chromep.tabs.update(tab.id, { active: true });
  }, []);

  const closeTab = useCallback(async (tab: chrome.tabs.Tab): Promise<void> => {
    if (!tab.id) return;
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
