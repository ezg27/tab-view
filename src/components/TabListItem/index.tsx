import CloseIcon from '@material-ui/icons/Close';
import RoomIcon from '@material-ui/icons/Room';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import React, { memo } from 'react';
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd';
import { closeTab, setActiveTab } from '../../utils/helpers';
import TabFavIcon from '../TabFavIcon';
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

  const getStyle = (style: DraggingStyle | NotDraggingStyle | undefined, snapshot: DraggableStateSnapshot) => {
    return {
      ...style,
      // Fix for glitchy grab hand cursor when hovering on the edge of tab list item
      cursor: snapshot.isDragging ? '-webit-grabbing' : 'pointer',
      color: snapshot.isDragging ? '#000000' : '',
      backgroundColor: snapshot.isDragging ? '#aec1ff' : '',
      boxShadow: snapshot.isDragging ? '0 10px 12px 0 rgba(0, 0, 0, 0.2)' : '',
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
          data-testid='tab-list-item'
        >
          <TabFavIcon tab={tab} />
          <p>{tab.title}</p>
          {tab.audible && <VolumeUpIcon className={styles.speakerIcon} fontSize='small' />}
          {tab.mutedInfo?.muted && <VolumeOffIcon className={styles.mutedSpeakerIcon} fontSize='small' />}
          {tab.pinned && <RoomIcon className={styles.pinIcon} fontSize='small' />}
          <CloseIcon
            name='closeIcon'
            data-testid='tab-close-icon'
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
