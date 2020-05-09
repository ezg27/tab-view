import React from 'react';
import { useFuzzySearch } from '../../hooks/useFuzzySearch';
import styles from './TabList.module.scss';

type TabListProps = {
  searchTerm: string;
  tabs: chrome.tabs.Tab[];
};

const setActiveTab = (tab: chrome.tabs.Tab) => {
  if (tab.active || !tab.id) return;
  chrome.tabs.update(tab.id, { active: true });
};

const TabList: React.FC<TabListProps> = ({ searchTerm, tabs }) => {
  const result = useFuzzySearch<chrome.tabs.Tab>(searchTerm, tabs, {
    keys: ['title', 'url'],
    threshold: 0.3,
    distance: 1000,
  });

  return (
    <div className={styles.tabList}>
      <ul>
        {result.map(tab => (
          <li key={tab.title} onClick={() => setActiveTab(tab)} unselectable='on'>
            {tab.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabList;
