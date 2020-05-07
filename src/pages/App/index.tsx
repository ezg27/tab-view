import Fuse from 'fuse.js';
import React, { useEffect, useState } from 'react';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import styles from './App.module.scss';

const App: React.FC = () => {
  const [currentWindowTabs, setCurrentWindowTabs] = useState<chrome.tabs.Tab[]>([]);
  const [queryTabs, setQueryTabs] = useState<chrome.tabs.Tab[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fuse = new Fuse(currentWindowTabs, {
    keys: ['title', 'url'],
    threshold: 0.4,
  });

  // Get all tabs in current window
  useEffect(() => {
    chrome.windows.getCurrent({ populate: true }, ({ tabs }) => {
      if (tabs) setCurrentWindowTabs(tabs);
    });
  }, []);

  // Search tab list based on user input
  useEffect(() => {
    if (!searchTerm) return;
    const result = fuse.search(searchTerm).map(tab => tab.item);
    setQueryTabs(result);
  }, [searchTerm]);

  return (
    <div className={styles.app}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ContentSection currentTabs={searchTerm ? queryTabs : currentWindowTabs} />
    </div>
  );
};

export default App;
