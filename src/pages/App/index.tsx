import React, { useEffect, useState } from 'react';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import TabList from '../../components/TabList';
import { useWindows } from '../../hooks/useWindows';
import styles from './App.module.scss';
import { useRovingFocus } from '../../hooks/useRovingFocus';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWindow, otherWindows] = useWindows();

  // Setup arrow key navigation
  useRovingFocus();

  return (
    <div className={styles.app}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ContentSection>
        <h3>Current window</h3>
        <TabList searchTerm={searchTerm} window={currentWindow} />
        {!!otherWindows.length && (
          <>
            <h3>Other windows</h3>
            {otherWindows.map(window => (
              <TabList key={window.id} searchTerm={searchTerm} window={window} />
            ))}
          </>
        )}
      </ContentSection>
    </div>
  );
};

export default App;
