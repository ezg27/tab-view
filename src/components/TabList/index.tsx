import Fuse from 'fuse.js';
import React, { useEffect, useState } from 'react';
import styles from './TabList.module.scss';

type TabListProps = {
  tabs: ReadonlyArray<chrome.tabs.Tab>;
  searchTerm: string;
};

const setActiveTab = (tab: chrome.tabs.Tab) => {
  if (tab.active || !tab.id) return;
  chrome.tabs.update(tab.id, { active: true });
};

let fuse: Fuse<chrome.tabs.Tab, Fuse.IFuseOptions<chrome.tabs.Tab>>;

const TabList: React.FC<TabListProps> = ({ tabs, searchTerm }) => {
  const [queryTabs, setQueryTabs] = useState<chrome.tabs.Tab[]>([]);

  // Set up Fuse search
  useEffect(() => {
    if (!tabs) return;
    const options: Fuse.IFuseOptions<chrome.tabs.Tab> = {
      keys: ['title', 'url'],
      threshold: 0.4,
    };
    fuse = new Fuse(tabs, options);
  }, [tabs]);

  // Search tab list based on user input
  useEffect(() => {
    if (!searchTerm) return;
    const result = fuse.search(searchTerm).map(tab => tab.item);
    setQueryTabs(result);
  }, [searchTerm]);

  return (
    <div className={styles.tabList}>
      <ul>
        {(searchTerm ? queryTabs : tabs).map(tab => (
          <li key={tab.title} onClick={() => setActiveTab(tab)} unselectable='on'>
            {tab.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabList;
