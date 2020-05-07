import React from 'react';
import TabList from '../TabList';
import styles from './ContentSection.module.scss';

type ContentSectionProps = {
  currentTabs: chrome.tabs.Tab[];
};

const ContentSection: React.FC<ContentSectionProps> = props => {
  return (
    <main className={styles.contentSection}>
      <h3>Current window</h3>
      <TabList {...props} />
    </main>
  );
};

export default ContentSection;
