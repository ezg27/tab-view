import React from 'react';
import styles from './Header.module.scss';

type HeaderProps = {};

const Header: React.FC<HeaderProps> = props => {
  return (
    <div className={styles.header}>
      <h1>Header</h1>
    </div>
  );
};

export default Header;
