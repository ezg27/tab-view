import React from 'react';
import TabList from '../TabList';
import styles from './ContentSection.module.scss';

type ContentSectionProps = {
  currentTabs: chrome.tabs.Tab[];
};

const setActiveTab = (tab: chrome.tabs.Tab) => {
  if (tab.active || !tab.id) return;
  chrome.tabs.update(tab.id, { active: true });
};

const ContentSection: React.FC<ContentSectionProps> = props => {
  return (
    <main className={styles.contentSection}>
      <h3>Current window</h3>
      <TabList setActiveTab={setActiveTab} {...props} />
    </main>
  );
};

export default ContentSection;
