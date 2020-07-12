import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import styles from './Header.module.scss';

type HeaderProps = {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  searchDisabledToggle: boolean;
  scrollPosition: number
};

const Header: React.FC<HeaderProps> = ({ searchTerm, setSearchTerm, searchDisabledToggle, scrollPosition }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div style={{ boxShadow: scrollPosition > 18 ? '0 4px 10px -4px rgba(0, 0, 0, 0.2)' : '' }} className={styles.header}>
      <img src='images/tabview128.png' alt='logo' style={{ width: '32px' }} />
      <div className={styles.searchContainer}>
        <SearchIcon className={styles.searchIcon} />
        <input
          id='searchBox'
          ref={inputRef}
          spellCheck='false'
          type='text'
          placeholder='Search...'
          disabled={searchDisabledToggle}
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
        />
      </div>
      <CloseIcon
        className={styles.closeIcon}
        data-testid='closeButton'
        fontSize='default'
        onClick={e => {
          e.preventDefault();
          window.close();
        }}
      />
    </div>
  );
};

export default Header;
