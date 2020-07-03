import React from 'react';
import styles from './TabFavIcon.module.scss';
import { validateFavIcon } from '../../utils/helpers';

type TabFavIconProps = {
  tab: chrome.tabs.Tab;
};

const TabFavIcon: React.FC<TabFavIconProps> = ({ tab }) => {
  const validFavIcon = validateFavIcon(tab);
  return (
    <span className={styles.tabFavIcon}>
      <img style={{
        verticalAlign: 'middle',
        width: '100%'
      }} src={validFavIcon} />
    </span>
  );
};

export default TabFavIcon;
