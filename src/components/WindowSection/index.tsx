import React from 'react';
import TabList from '../TabList';
import styles from './WindowSection.module.scss';

type WindowSectionProps = {
  title: string;
  searchTerm: string;
  windows: ChromeWindow[];
};

const WindowSection: React.FC<WindowSectionProps> = ({ title, searchTerm, windows }) => {
  return (
    <div className={styles.windowSection}>
      <h3>{title}</h3>
      {windows.length === 0 && <span className={styles.emptyListMessage}>Nothing to show...</span>}
      {windows.map(window => (
        <TabList key={window.id} searchTerm={searchTerm} window={window} />
      ))}
    </div>
  );
};

export default WindowSection;
