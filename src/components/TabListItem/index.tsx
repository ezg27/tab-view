import CloseIcon from '@material-ui/icons/Close';
import React, { memo } from 'react';
import { closeTab, setActiveTab } from '../../utils/helpers';
import styles from './TabListItem.module.scss';

type TabListItemProps = {
  tab: chrome.tabs.Tab;
  parentWindow: ChromeWindow;
};

const TabListItem: React.FC<TabListItemProps> = memo(({ tab, parentWindow }) => {
  const handleActiveClick: TabClickHandler = () => setActiveTab(tab, parentWindow);
  const handleClose: TabClickHandler = () => closeTab(tab);
  const handleKeyPress = (onClick: TabClickHandler) => ({ key }: React.KeyboardEvent) => {
    if (key === 'Enter') {
      onClick();
    }
  };

  return (
    <li
      className={styles.tabListItem}
      tabIndex={-1}
      onClick={handleActiveClick}
      onKeyPress={handleKeyPress(handleActiveClick)}
    >
      <p>{tab.title}</p>
      <CloseIcon
        name='closeIcon'
        className={styles.closeIcon}
        tabIndex={-1}
        fontSize='small'
        onClick={e => {
          e.stopPropagation();
          handleClose();
        }}
      />
    </li>
  );
});

export default TabListItem;
