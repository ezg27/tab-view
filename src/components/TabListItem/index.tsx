import CloseIcon from '@material-ui/icons/Close';
import React, { memo } from 'react';
import styles from './TabListItem.module.scss';
import { setActiveTab, closeTab } from '../../utils/helpers';

type TabListItemProps = {
  tab: chrome.tabs.Tab;
  parentWindow: chrome.windows.Window;
};

const TabListItem: React.FC<TabListItemProps> = memo(({ tab, parentWindow }) => {
  return (
    <li className={styles.tabListItem} unselectable='on'>
      <p onClick={() => setActiveTab(tab, parentWindow)}>{tab.title}</p>
      <CloseIcon className={styles.closeIcon} fontSize='small' onClick={() => closeTab(tab)} />
    </li>
  );
});

export default TabListItem;
