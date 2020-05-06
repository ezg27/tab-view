import React from 'react';
import styles from './Header.module.scss';

type HeaderProps = {};

const Header: React.FC<HeaderProps> = props => {
  return (
    <div className={styles.header}>
      <span>icon</span>
      <input type='text' placeholder='Search...' autoFocus />
      <button>O</button>
    </div>
  );
};

export default Header;
