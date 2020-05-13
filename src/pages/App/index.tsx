import React, { useEffect, useState } from 'react';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import TabList from '../../components/TabList';
import styles from './App.module.scss';

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
