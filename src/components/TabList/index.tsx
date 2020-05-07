import React from 'react';
import styles from './TabList.module.scss';

type TabListProps = {
  currentTabs: chrome.tabs.Tab[];
  setActiveTab: (tab: chrome.tabs.Tab) => void;
};

const TabList: React.FC<TabListProps> = ({ currentTabs, setActiveTab }) => {
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
