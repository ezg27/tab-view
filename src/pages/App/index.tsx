import React from 'react';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import styles from './App.module.scss';

const App: React.FC = () => {
  return (
    <div className={styles.app}>
      <Header />
      <ContentSection />
    </div>
  );
};

export default App;
