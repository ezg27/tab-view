import React from 'react';
import styles from './TabList.module.scss';

type TabListProps = {
  currentTabs: chrome.tabs.Tab[];
};

const setActiveTab = (tab: chrome.tabs.Tab) => {
  if (tab.active || !tab.id) return;
  chrome.tabs.update(tab.id, { active: true });
};

const TabList: React.FC<TabListProps> = ({ currentTabs }) => {
  return (
    <div className={styles.tabList}>
      <ul>
        {currentTabs.map(tab => (
          <li key={tab.title} onClick={() => setActiveTab(tab)} unselectable='on'>
            {tab.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabList;
