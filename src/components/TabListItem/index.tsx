import CloseIcon from '@material-ui/icons/Close';
import React, { memo } from 'react';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { closeTab, setActiveTab } from '../../utils/helpers';
import styles from './TabListItem.module.scss';

type TabListItemProps = {
  tab: chrome.tabs.Tab;
  tabIndex: number;
  parentWindow: ChromeWindow;
};

const TabListItem: React.FC<TabListItemProps> = memo(({ tab, tabIndex, parentWindow }) => {
  const handleActiveClick: TabClickHandler = () => setActiveTab(tab, parentWindow);
  const handleClose: TabClickHandler = () => closeTab(tab);
  const handleKeyPress = (onClick: TabClickHandler) => ({ key }: React.KeyboardEvent) => {
    if (key === 'Enter') {
      onClick();
    }
  };

  return (
    <Draggable draggableId={`${tab.id}`} index={tabIndex}>
      {(provided: DraggableProvided) => (
        <li
          className={styles.tabListItem}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
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
      )}
    </Draggable>
  );
});

export default TabListItem;
