import React, { useState } from 'react';
import ContentSection from '../../components/ContentSection';
import Header from '../../components/Header';
import styles from './App.module.scss';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className={styles.app}>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ContentSection searchTerm={searchTerm} />
    </div>
  );
};

export default App;
