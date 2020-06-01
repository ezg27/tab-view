import chromep from 'chrome-promise';
import React, { useEffect, useState } from 'react';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import TabList from '../../components/TabList';
import { refreshWindow } from '../../utils/helpers';
import styles from './App.module.scss';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWindow, setCurrentWindow] = useState<ChromeWindow>({} as ChromeWindow);
  const [otherWindows, setOtherWindows] = useState<ChromeWindow[]>([]);

  // Get tabs for all windows
  useEffect(() => {
    const getWindows = async () => {
      const currentWindow = await chromep.windows.getCurrent({ populate: true });
      const withActiveFlag: ChromeWindow = { ...currentWindow, isActiveWindow: true };
      setCurrentWindow(withActiveFlag);

      const otherWindows = (await chromep.windows.getAll({ populate: true }))
        .filter(windowItem => windowItem.id !== currentWindow.id)
        .map(window => ({ ...window, isActiveWindow: false } as ChromeWindow));
      setOtherWindows(otherWindows);
    };
    getWindows();
  }, []);

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

  const handleKeyDown = (e: KeyboardEvent) => {
    const activeElement = document.activeElement;
    const listItems = document.querySelectorAll('li[tabindex="-1"]');

    if (e.keyCode === 40) {
      // Down arrow
      e.preventDefault();
      if (activeElement?.tagName === 'INPUT') {
        (listItems[0] as HTMLElement).focus();
      }
      if (activeElement?.tagName === 'LI') {
        let itemIndex = 0;
        for (let [i, value] of listItems.entries()) {
          if (value === activeElement) {
            itemIndex = i;
          }
        }
        (listItems[itemIndex === listItems.length - 1 ? 0 : itemIndex + 1] as HTMLElement).focus();
      }
    } else if (e.keyCode === 38) {
      // Up arrow
      e.preventDefault();
      if (activeElement?.tagName === 'INPUT') {
        (listItems[listItems.length - 1] as HTMLElement).focus();
      }
      if (activeElement?.tagName === 'LI') {
        let itemIndex = 0;
        for (let [i, value] of listItems.entries()) {
          if (value === activeElement) {
            itemIndex = i;
          }
        }
        if (itemIndex === 0) {
          document.getElementById('searchBox')?.focus();
          return;
        }
        (listItems[itemIndex - 1] as HTMLElement).focus();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, false);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [handleKeyDown]);

  return (
    <div className={styles.app}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ContentSection>
        <h3>Current window</h3>
        <TabList searchTerm={searchTerm} window={currentWindow} />
        {!!otherWindows.length && (
          <>
            <h3>Other windows</h3>
            {otherWindows.map(window => (
              <TabList key={window.id} searchTerm={searchTerm} window={window} />
            ))}
          </>
        )}
      </ContentSection>
    </div>
  );
};

export default App;
