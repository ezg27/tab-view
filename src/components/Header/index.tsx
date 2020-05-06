import React from 'react'
import styles from './Header.module.scss';

type Props = {}

const Header = (props: Props) => {
  return (
    <div className={styles.header}>
      <h1>Header</h1>
    </div>
  )
}

export default Header
