import React, { Dispatch, SetStateAction } from 'react';
import styles from './Header.module.scss';

type HeaderProps = {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
};

const Header: React.FC<HeaderProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className={styles.header}>
      <span>icon</span>
      <input
        type='text'
        placeholder='Search...'
        autoFocus
        value={searchTerm}
        onChange={event => setSearchTerm(event.target.value)}
      />
      <button>O</button>
    </div>
  );
};

export default Header;
