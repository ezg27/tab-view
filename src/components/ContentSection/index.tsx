import React from 'react';
import styles from './ContentSection.module.scss';

type ContentSectionProps = {
  currentTabs: chrome.tabs.Tab[];
};

const setActiveTab = (tab: chrome.tabs.Tab) => {
  if (tab.active || !tab.id) return;
  chrome.tabs.update(tab.id, { active: true });
};

const ContentSection: React.FC<ContentSectionProps> = ({ currentTabs }) => {
  return (
    <main className={styles.contentSection}>
      <h3>Current window</h3>
      <ul>
        {currentTabs.map(tab => (
          <li key={tab.title} onClick={() => setActiveTab(tab)} unselectable='on'>
            {tab.title}
          </li>
        ))}
      </ul>
    </main>
  );
};

export default ContentSection;
