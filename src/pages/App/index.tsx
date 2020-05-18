import React, { useEffect, useState } from 'react';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import TabList from '../../components/TabList';
import styles from './App.module.scss';

const setActiveTab = (tab: chrome.tabs.Tab, parentWindow: chrome.windows.Window): void => {
  chrome.windows.getCurrent(currentWindow => {
    if (!tab.id) return;
    if (currentWindow.id !== parentWindow.id) {
      chrome.windows.update(parentWindow.id, { focused: true }, () => window.close());
    }
    if (tab.active) return;
    chrome.tabs.update(tab.id, { active: true });
  });
};

const closeTab = (tab: chrome.tabs.Tab): void => {
  if (!tab.id) return;
  chrome.tabs.remove(tab.id);
};

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // TODO: create lazy initial state function to get all windows/tabs instead of useEffect
  // OR: create custom hook that returns current window and other windows
  const [currentWindow, setCurrentWindow] = useState<chrome.windows.Window>({} as chrome.windows.Window);
  const [otherWindows, setOtherWindows] = useState<chrome.windows.Window[]>([]);

  // Get all tabs for all windows
  useEffect(() => {
    chrome.windows.getCurrent({ populate: true }, window => {
      setCurrentWindow(window);
      chrome.windows.getAll({ populate: true }, allWindows => {
        const otherWindows = allWindows.filter(windowItem => windowItem.id !== window.id);
        setOtherWindows(otherWindows);
      });
    });
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
