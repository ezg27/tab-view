import React, { memo } from 'react';
import { useFuzzySearch } from '../../hooks/useFuzzySearch';
import TabListItem from '../TabListItem';
import styles from './TabList.module.scss';

type TabListProps = {
  searchTerm: string;
  window: ChromeWindow;
};

const TabList: React.FC<TabListProps> = memo(({ searchTerm, window }) => {
  const result = useFuzzySearch<chrome.tabs.Tab>(searchTerm, window.tabs || [], {
    keys: ['title', 'url'],
    threshold: 0.3,
    distance: 1000,
  });

  return (
    <div className={styles.tabList}>
      <ul>
        {result.map((tab, index) => (
          <TabListItem
            key={tab.id}
            tab={tab}
            tabIndex={index}
            parentWindow={window}
          />
        ))}
      </ul>
    </div>
  );
});

export default TabList;
