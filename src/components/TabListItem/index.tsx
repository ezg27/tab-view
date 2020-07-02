import CloseIcon from '@material-ui/icons/Close';
import React, { memo } from 'react';
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle
} from 'react-beautiful-dnd';
import { closeTab, setActiveTab } from '../../utils/helpers';
import styles from './TabListItem.module.scss';
import TabFavIcon from '../TabFavIcon';

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

  const getStyle = (style: DraggingStyle | NotDraggingStyle | undefined, snapshot: DraggableStateSnapshot) => {
    return {
      ...style,
      // Fix glitchy grab hand cursor when hovering on the edge of tab list item
      cursor: snapshot.isDragging ? '-webit-grabbing' : 'pointer',
    };
  };

  return (
    <Draggable draggableId={`${tab.id}`} index={tabIndex}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <li
          className={styles.tabListItem}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getStyle(provided.draggableProps.style, snapshot)}
          tabIndex={-1}
          onClick={handleActiveClick}
          onKeyPress={handleKeyPress(handleActiveClick)}
        >
          <TabFavIcon tab={tab} />
          {tab.pinned && <span># .</span>}
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
