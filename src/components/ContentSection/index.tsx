import React, { useEffect, useState } from 'react';
import TabList from '../TabList';
import styles from './ContentSection.module.scss';

type ContentSectionProps = {
  searchTerm: string;
};

const ContentSection: React.FC<ContentSectionProps> = props => {
  // TODO: create lazy initial state function to get all windows/tabs instead of useEffect
  // OR: create custom hook that returns current window and other windows
  const [currentWindow, setCurrentWindow] = useState<Partial<chrome.windows.Window>>({});
  const [otherWindows, setOtherWindows] = useState<chrome.windows.Window[]>([]);

  // Get all tabs for all windows
  useEffect(() => {
    chrome.windows.getCurrent({ populate: true }, window => {
      setCurrentWindow(window);
      chrome.windows.getAll({ populate: true }, allWindows => {
        console.log(allWindows);
        console.log(currentWindow.id);
        const otherWindows = allWindows.filter(windowItem => windowItem.id !== window.id);
        console.log(otherWindows);
        setOtherWindows(otherWindows);
      });
    });
  }, []);

  return (
    <main className={styles.contentSection}>
      <h3>Current window</h3>
      <TabList tabs={currentWindow.tabs || []} {...props} />
      {otherWindows && (
        <>
          <h3>Other windows</h3>
          {otherWindows.map(window => (
            <TabList key={window.id} tabs={window.tabs || []} {...props} />
          ))}
        </>
      )}
    </main>
  );
};

export default ContentSection;
