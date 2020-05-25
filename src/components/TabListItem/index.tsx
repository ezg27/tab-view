import CloseIcon from '@material-ui/icons/Close';
import React, { memo } from 'react';
import { closeTab, setActiveTab } from '../../utils/helpers';
import styles from './TabListItem.module.scss';

type TabListItemProps = {
  tab: chrome.tabs.Tab;
  parentWindow: chrome.windows.Window;
};

const TabListItem: React.FC<TabListItemProps> = memo(({ tab, parentWindow }) => {
  const handleActiveClick: TabClickHandler = () => setActiveTab(tab, parentWindow);
  const handleClose: TabClickHandler = () => closeTab(tab);
  const handleEnterKeyPress = (onClick: TabClickHandler) => ({ key }: React.KeyboardEvent) => {
    if (key === 'Enter') {
      onClick();
    }
  };

  return (
    <li className={styles.tabListItem}>
      <a onClick={handleActiveClick} onKeyPress={handleEnterKeyPress(handleActiveClick)} tabIndex={0}>
        {tab.title}
      </a>
      <CloseIcon
        className={styles.closeIcon}
        fontSize='small'
        onClick={handleClose}
        onKeyPress={handleEnterKeyPress(handleClose)}
        tabIndex={0}
      />
    </li>
  );
});

export default TabListItem;
