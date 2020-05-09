import React from 'react';
import { useFuzzySearch } from '../../hooks/useFuzzySearch';
import styles from './TabList.module.scss';

type TabListProps = {
  searchTerm: string;
  window: chrome.windows.Window;
};

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

const TabList: React.FC<TabListProps> = ({ searchTerm, window }) => {
  const result = useFuzzySearch<chrome.tabs.Tab>(searchTerm, window.tabs || [], {
    keys: ['title', 'url'],
    threshold: 0.3,
    distance: 1000,
  });

  return (
    <div className={styles.tabList}>
      <ul>
        {result.map(tab => (
          <li key={tab.title} onClick={() => setActiveTab(tab, window)} unselectable='on'>
            {tab.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabList;
