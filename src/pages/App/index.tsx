import React, { useEffect, useState } from 'react';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import styles from './App.module.scss';

const App: React.FC = () => {
  const [currentTabs, setCurrentTabs] = useState<chrome.tabs.Tab[]>([]);

  // Get all tabs in current window
  useEffect(() => {
    chrome.windows.getCurrent({ populate: true }, ({ tabs }) => {
      if (tabs) setCurrentTabs(tabs);
    });
  }, []);

  return (
    <div className={styles.app}>
      <Header />
      <ContentSection currentTabs={currentTabs} />
    </div>
  );
};

export default App;
