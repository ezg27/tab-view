import React from 'react';
import { useFuzzySearch } from '../../hooks/useFuzzySearch';
import TabListItem from '../TabListItem';
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

const closeTab = (tab: chrome.tabs.Tab): void => {
  if (!tab.id) return;
  chrome.tabs.remove(tab.id);
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
          <TabListItem key={tab.title} tab={tab} parentWindow={window} setActiveTab={setActiveTab} closeTab={closeTab} />
        ))}
      </ul>
    </div>
  );
};

export default TabList;
